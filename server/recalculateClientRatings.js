const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Review = require('./models/Review');

dotenv.config();

const recalculateClientRatings = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all clients
    const clients = await User.find({ role: 'client' });
    console.log(`Found ${clients.length} clients`);

    let updated = 0;

    for (const client of clients) {
      // Aggregate reviews written BY students FOR this client (role='student')
      const result = await Review.aggregate([
        {
          $match: {
            revieweeId: client._id,
            role: 'student' // Reviews written by students
          }
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 }
          }
        }
      ]);

      if (result.length > 0) {
        const { avgRating, count } = result[0];
        client.averageClientRating = parseFloat(avgRating.toFixed(2));
        await client.save();
        console.log(`Updated client ${client.name}: ${avgRating.toFixed(2)} stars from ${count} review(s)`);
        updated++;
      } else {
        // No reviews, set to 0
        if (client.averageClientRating !== 0) {
          client.averageClientRating = 0;
          await client.save();
          console.log(`Reset client ${client.name}: no reviews`);
          updated++;
        }
      }
    }

    console.log(`\nRecalculation complete! Updated ${updated} client(s).`);
    process.exit(0);
  } catch (error) {
    console.error('Error recalculating client ratings:', error);
    process.exit(1);
  }
};

recalculateClientRatings();
