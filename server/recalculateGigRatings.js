const mongoose = require('mongoose');
const Review = require('./models/Review');
const Gig = require('./models/Gig');
require('dotenv').config();

const recalculateAllGigRatings = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all unique gig IDs that have reviews
    const gigsWithReviews = await Review.distinct('gigId');
    console.log(`Found ${gigsWithReviews.length} gigs with reviews`);

    for (const gigId of gigsWithReviews) {
      console.log(`\n📊 Processing gigId: ${gigId}`);

      // Calculate stats for this gig
      const stats = await Review.aggregate([
        { $match: { gigId: new mongoose.Types.ObjectId(gigId) } },
        {
          $group: {
            _id: '$gigId',
            averageRating: { $avg: '$rating' },
            reviewCount: { $sum: 1 }
          }
        }
      ]);

      console.log('Stats:', stats);

      if (stats.length > 0) {
        const { averageRating, reviewCount } = stats[0];
        
        const updatedGig = await Gig.findByIdAndUpdate(
          gigId,
          { averageRating, reviewCount },
          { new: true }
        );

        console.log(`✅ Updated gig "${updatedGig.title}"`);
        console.log(`   Rating: ${averageRating.toFixed(2)}, Reviews: ${reviewCount}`);
      }
    }

    // Reset gigs with no reviews
    const allGigs = await Gig.find({});
    const gigsWithReviewsStrings = gigsWithReviews.map(id => id.toString());
    
    for (const gig of allGigs) {
      if (!gigsWithReviewsStrings.includes(gig._id.toString())) {
        await Gig.findByIdAndUpdate(gig._id, { averageRating: 0, reviewCount: 0 });
        console.log(`Reset gig "${gig.title}" to 0 rating (no reviews)`);
      }
    }

    console.log('\n✅ All gig ratings recalculated!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

recalculateAllGigRatings();
