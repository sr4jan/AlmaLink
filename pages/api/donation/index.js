import dbConnect from '@/lib/mongodb';
import Donation from '@/models/Donation';

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const donations = await Donation
          .find({ status: 'completed' })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();

        // Calculate total stats
        const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
        const monthlyDonors = donations.filter(d => d.recurring).length;

        return res.status(200).json({
          success: true,
          donations,
          stats: {
            totalAmount,
            totalDonors: donations.length,
            monthlyDonors
          }
        });
      } catch (error) {
        console.error('Fetch donations error:', error);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch donations"
        });
      }

    case 'POST':
      try {
        const { name, amount, recurring } = req.body;

        // Validate required fields
        if (!name?.trim()) {
          return res.status(400).json({
            success: false,
            message: "Name is required"
          });
        }

        // Validate amount
        const donationAmount = Number(amount);
        if (!donationAmount || donationAmount < 100 || donationAmount > 100000) {
          return res.status(400).json({
            success: false,
            message: "Invalid donation amount (min: ₹100, max: ₹100,000)"
          });
        }

        // Create donation with current UTC time
        const donation = new Donation({
          name: name.trim(),
          amount: donationAmount,
          recurring: Boolean(recurring),
          userId: req.body.userId || 'sr4jan',
          status: 'completed',
          createdAt: new Date().toISOString()
        });

        await donation.save();

        return res.status(201).json({
          success: true,
          donation: donation.toObject()
        });
      } catch (error) {
        console.error('Create donation error:', error);
        return res.status(500).json({
          success: false,
          message: "Failed to process donation"
        });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({
        success: false,
        message: `Method ${req.method} Not Allowed`
      });
  }
}