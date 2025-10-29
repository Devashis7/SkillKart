const mongoose = require('mongoose');
const Review = require('./models/Review');
const User = require('./models/User');
require('dotenv').config();

const recalculateAllStudentRatings = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all unique student IDs that have reviews
    const studentsWithReviews = await Review.distinct('revieweeId');
    console.log(`Found ${studentsWithReviews.length} students with reviews`);

    for (const studentId of studentsWithReviews) {
      console.log(`\n📊 Processing studentId: ${studentId}`);

      // Calculate stats for this student (only reviews from clients)
      const stats = await Review.aggregate([
        { 
          $match: { 
            revieweeId: new mongoose.Types.ObjectId(studentId),
            role: 'client' // Only count client reviews
          } 
        },
        {
          $group: {
            _id: '$revieweeId',
            averageRating: { $avg: '$rating' },
            reviewCount: { $sum: 1 }
          }
        }
      ]);

      console.log('Stats:', stats);

      if (stats.length > 0) {
        const { averageRating, reviewCount } = stats[0];
        
        const updatedUser = await User.findByIdAndUpdate(
          studentId,
          { averageStudentRating: averageRating },
          { new: true }
        );

        console.log(`✅ Updated student "${updatedUser.name}"`);
        console.log(`   Rating: ${averageRating.toFixed(2)}, Reviews: ${reviewCount}`);
      }
    }

    // Reset students with no reviews
    const allStudents = await User.find({ role: 'student' });
    const studentsWithReviewsStrings = studentsWithReviews.map(id => id.toString());
    
    for (const student of allStudents) {
      if (!studentsWithReviewsStrings.includes(student._id.toString())) {
        await User.findByIdAndUpdate(student._id, { averageStudentRating: 0 });
        console.log(`Reset student "${student.name}" to 0 rating (no reviews)`);
      }
    }

    console.log('\n✅ All student ratings recalculated!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

recalculateAllStudentRatings();
