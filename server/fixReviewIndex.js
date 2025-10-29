const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const fixReviewIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('reviews');

    // Get existing indexes
    const indexes = await collection.indexes();
    console.log('\nExisting indexes:', JSON.stringify(indexes, null, 2));

    // Drop the old unique index on orderId if it exists
    try {
      await collection.dropIndex('orderId_1');
      console.log('\n✅ Dropped old unique index on orderId');
    } catch (err) {
      if (err.code === 27) {
        console.log('\n⚠️  Old index orderId_1 does not exist (already dropped or never created)');
      } else {
        throw err;
      }
    }

    // Drop the old unique index on (orderId, reviewerId) if it exists
    try {
      await collection.dropIndex('orderId_1_reviewerId_1');
      console.log('✅ Dropped old unique index on (orderId, reviewerId)');
    } catch (err) {
      if (err.code === 27) {
        console.log('⚠️  Old index orderId_1_reviewerId_1 does not exist (already dropped or never created)');
      } else {
        throw err;
      }
    }

    // Create new compound unique index on orderId and role
    try {
      await collection.createIndex({ orderId: 1, role: 1 }, { unique: true });
      console.log('✅ Created new compound unique index on (orderId, role)');
    } catch (err) {
      if (err.code === 85 || err.code === 86) {
        console.log('⚠️  Compound index already exists');
      } else {
        throw err;
      }
    }

    // Verify new indexes
    const newIndexes = await collection.indexes();
    console.log('\nNew indexes:', JSON.stringify(newIndexes, null, 2));

    console.log('\n✅ Review index migration completed successfully!');
    console.log('Now both clients and students can review the same order.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing review index:', error);
    process.exit(1);
  }
};

fixReviewIndex();
