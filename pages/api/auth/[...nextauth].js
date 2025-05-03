import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import College from '@/models/College';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    // ... other providers
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await connectDB();
          
          const user = await User.findOne({ email: credentials.email });
          
          if (!user) {
            throw new Error("Invalid credentials");
          }
      
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Invalid credentials");
          }
      
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username || user.profile?.firstName || user.email.split('@')[0],
            role: user.role,
            username: user.username,
            avatar: user.profile?.avatar,
            collegeId: user.collegeId?.toString(), // Make sure collegeId is included
            profile: {
              firstName: user.profile?.firstName || '',
              lastName: user.profile?.lastName || '',
              avatar: user.profile?.avatar || null
            }
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        try {
          await connectDB();
          
          // Check if user exists
          let existingUser = await User.findOne({ email: user.email });
          
          if (existingUser) {
            // Update user's Google-specific info if needed
            if (!existingUser.profile.avatar && user.image) {
              existingUser.profile.avatar = user.image;
              await existingUser.save();
            }
            return true;
          } else {
            // Since this is login page, we should not create new users
            // Instead, we should return false to show an error
            return false;
          }
        } catch (error) {
          console.error("SignIn Callback Error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Get fresh user data from database
      if (user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });
        
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.email = dbUser.email;
          token.username = dbUser.username;
          token.name = dbUser.name || dbUser.username;
          token.profile = dbUser.profile;
          token.collegeId = dbUser.collegeId?.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.username = token.username;
        session.user.name = token.name;
        session.user.profile = token.profile;
        session.user.collegeId = token.collegeId;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    newUser: '/auth/signup',
  },
  events: {
    async signIn(message) {
      console.log('Sign in event:', message);
    },
    async signOut(message) {
      console.log('Sign out event:', message);
    },
    async error(message) {
      console.error('Error event:', message);
    }
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

