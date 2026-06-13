const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Hotel = require('./server/models/Hotel');
const User = require('./server/models/User');
const Booking = require('./server/models/Booking');

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/HotStay';

async function migrateData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');

    // Read JSON files
    const hotelDataPath = path.join(__dirname, 'database/hotelData.json');
    const usersPath = path.join(__dirname, 'database/users.json');
    const bookingsPath = path.join(__dirname, 'database/bookings.json');

    // Load and parse data
    console.log('\nReading JSON files...');
    const hotelData = JSON.parse(fs.readFileSync(hotelDataPath, 'utf8'));
    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const bookingsData = JSON.parse(fs.readFileSync(bookingsPath, 'utf8'));

    console.log(`Found ${hotelData.length} hotels`);
    console.log(`Found ${usersData.length} users`);
    console.log(`Found ${bookingsData.length} bookings`);

    // Clear existing data (optional - comment out to keep data)
    console.log('\nClearing existing data...');
    await Hotel.deleteMany({});
    await User.deleteMany({});
    await Booking.deleteMany({});
    console.log('✓ Cleared collections');

    // Insert hotels
    console.log('\nInserting hotels...');
    const insertedHotels = await Hotel.insertMany(
      hotelData.map(h => ({
        name: h.name,
        description: h.description,
        location: h.location,
        price: h.price,
        images: h.images,
        type: h.type,
        guests: h.guests,
        categories: h.categories,
        hostEmail: h.host,
        rating: h.rating,
        reviewCount: h.reviewCount,
        bedrooms: h.bedrooms,
        beds: h.beds,
        bathrooms: h.bathrooms,
        amenities: h.amenities,
        reviews: h.reviews
      }))
    );
    console.log(`✓ Inserted ${insertedHotels.length} hotels`);

    // Insert users
    console.log('\nInserting users...');
    const insertedUsers = await User.insertMany(usersData);
    console.log(`✓ Inserted ${insertedUsers.length} users`);

    // Insert bookings
    console.log('\nInserting bookings...');
    const insertedBookings = await Booking.insertMany(bookingsData);
    console.log(`✓ Inserted ${insertedBookings.length} bookings`);

    console.log('\n✓✓✓ Migration completed successfully! ✓✓✓');
    console.log(`\nSummary:`);
    console.log(`  - Hotels: ${insertedHotels.length}`);
    console.log(`  - Users: ${insertedUsers.length}`);
    console.log(`  - Bookings: ${insertedBookings.length}`);

    process.exit(0);

  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

migrateData();
