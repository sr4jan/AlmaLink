import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.username = user.username;
        token.name = user.name;
        token.avatar = user.avatar;
        token.collegeId = user.collegeId;
        token.profile = user.profile;
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
        session.user.avatar = token.avatar;
        session.user.collegeId = token.collegeId;
        session.user.profile = token.profile;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);