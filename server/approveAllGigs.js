require('dotenv').config();
const mongoose = require('mongoose');
const Gig = require('./models/Gig');

async function approveAllGigs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Find all pending gigs
    const pendingGigs = await Gig.find({ status: 'pending' });
    console.log(`Found ${pendingGigs.length} pending gigs`);

    if (pendingGigs.length === 0) {
      console.log('No pending gigs to approve');
      const allGigs = await Gig.find({});
      console.log(`Total gigs in database: ${allGigs.length}`);
      allGigs.forEach(gig => {
        console.log(`- ${gig.title} (${gig.status})`);
      });
    } else {
      // Approve all pending gigs
      const result = await Gig.updateMany(
        { status: 'pending' },
        { status: 'approved' }
      );
      console.log(`✅ Approved ${result.modifiedCount} gigs`);
    }

    // Show all gigs after approval
    const allGigs = await Gig.find({});
    console.log(`\nAll gigs in database:`);
    allGigs.forEach(gig => {
      console.log(`- ${gig.title} (${gig.status}) - Price: ₹${gig.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

approveAllGigs();