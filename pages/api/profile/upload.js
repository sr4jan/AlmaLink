import { getServerSession } from "next-auth/next";
import { authOptions } from './auth/[...nextauth]';
import formidable from 'formidable';
import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Parse form data
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    if (!files.image?.[0]) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.v2.uploader.upload(files.image[0].filepath, {
      folder: 'user-avatars',
      public_id: `avatar-${session.user.id}-${Date.now()}`,
      overwrite: true,
      transformation: [
        { width: 150, height: 150, crop: "fill" },
        { quality: "auto" }
      ]
    });

    return res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
}