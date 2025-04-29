import dbConnect from '@/lib/mongodb';
import Donation from '@/models/Donation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  try {
    await dbConnect();
    
    // Get the session
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    switch (req.method) {
      case 'GET':
        try {
          // Get donations for the user's college
          const donations = await Donation
            .find({
              status: 'completed',
              // Add collegeId filter if needed
            })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

          // Calculate stats
          const stats = {
            totalAmount: donations.reduce((sum, d) => sum + (d.amount || 0), 0),
            totalDonors: new Set(donations.map(d => d.userId)).size,
            monthlyDonors: donations.filter(d => d.recurring).length
          };

          return res.status(200).json({
            success: true,
            donations,
            stats
          });
        } catch (error) {
          console.error('GET donations error:', error);
          return res.status(500).json({
            success: false,
            message: "Failed to fetch donations"
          });
        }

      case 'POST':
        try {
          const { amount, recurring, category, paymentDetails } = req.body;

          if (!amount || !category || !paymentDetails) {
            return res.status(400).json({
              success: false,
              message: "Missing required fields"
            });
          }

          const donation = new Donation({
            amount: Number(amount),
            recurring: Boolean(recurring),
            category,
            userId: session.user.id,
            name: session.user.name,
            paymentId: paymentDetails.paymentId,
            orderId: paymentDetails.orderId,
            status: 'completed',
            createdAt: new Date().toISOString()
          });

          await donation.save();

          return res.status(201).json({
            success: true,
            donation: donation.toObject()
          });
        } catch (error) {
          console.error('POST donation error:', error);
          return res.status(500).json({
            success: false,
            message: "Failed to create donation"
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}