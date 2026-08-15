const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

// Mock statistics calculations logic directly
function calculateProfileStats(userBookings) {
  const completedBookings = userBookings.filter(b => b.status === 'Completed');
  const cancelledBookings = userBookings.filter(b => b.status === 'Cancelled');
  const totalNights = userBookings.reduce((sum, b) => sum + (b.nights || 0), 0);
  const totalSpent = userBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const reviewedBookings = completedBookings.filter(b => b.reviewed).length;
  
  const ratings = completedBookings
      .filter(b => b.rating && !isNaN(b.rating))
      .map(b => Number(b.rating));
  const averageRating = ratings.length > 0 
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : null;

  return {
    totalBookings: userBookings.length,
    totalTrips: completedBookings.length,
    cancelledBookings: cancelledBookings.length,
    totalSpent,
    totalNights,
    reviewedBookings,
    averageRating,
    cancellationRate: userBookings.length > 0 
        ? (cancelledBookings.length / userBookings.length * 100).toFixed(1)
        : '0.0'
  };
}

test('calculates profile statistics accurately for mixed bookings', () => {
  const bookings = [
    { status: 'Completed', nights: 3, price: 6000, reviewed: true, rating: 5 },
    { status: 'Completed', nights: 2, price: 4000, reviewed: true, rating: 4 },
    { status: 'Upcoming', nights: 4, price: 8000, reviewed: false },
    { status: 'Cancelled', nights: 1, price: 2000, reviewed: false }
  ];

  const stats = calculateProfileStats(bookings);

  assert.strictEqual(stats.totalBookings, 4);
  assert.strictEqual(stats.totalTrips, 2);
  assert.strictEqual(stats.cancelledBookings, 1);
  assert.strictEqual(stats.totalNights, 10);
  assert.strictEqual(stats.totalSpent, 20000);
  assert.strictEqual(stats.reviewedBookings, 2);
  assert.strictEqual(stats.averageRating, '4.5');
  assert.strictEqual(stats.cancellationRate, '25.0');
});

test('handles empty booking list gracefully', () => {
  const stats = calculateProfileStats([]);
  assert.strictEqual(stats.totalBookings, 0);
  assert.strictEqual(stats.totalTrips, 0);
  assert.strictEqual(stats.cancelledBookings, 0);
  assert.strictEqual(stats.totalNights, 0);
  assert.strictEqual(stats.totalSpent, 0);
  assert.strictEqual(stats.averageRating, null);
  assert.strictEqual(stats.cancellationRate, '0.0');
});

test('toggles saved hotel IDs in wishlist', () => {
  const savedHotels = ['hotel-123', 'hotel-456'];
  const toggleSave = (list, id) => {
    const idx = list.indexOf(id);
    if (idx > -1) {
      list.splice(idx, 1);
      return false; // un-saved
    } else {
      list.push(id);
      return true; // saved
    }
  };

  // Remove existing
  const isSaved1 = toggleSave(savedHotels, 'hotel-123');
  assert.strictEqual(isSaved1, false);
  assert.deepStrictEqual(savedHotels, ['hotel-456']);

  // Add new
  const isSaved2 = toggleSave(savedHotels, 'hotel-789');
  assert.strictEqual(isSaved2, true);
  assert.deepStrictEqual(savedHotels, ['hotel-456', 'hotel-789']);
});

test('validates password hashing and verification', async () => {
  const plainPassword = 'securePassword123!';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const isValid = await bcrypt.compare(plainPassword, hashedPassword);
  const isInvalid = await bcrypt.compare('wrongPassword', hashedPassword);

  assert.strictEqual(isValid, true);
  assert.strictEqual(isInvalid, false);
});

test('formats preferences and settings correctly with fallback defaults', () => {
  const rawBody = {
    roomType: 'Suite',
    travelFrequency: 'Frequently',
    priceRange: 'Premium',
    locBeach: 'on',
    locMountain: 'true',
    amenityPool: 'true',
    amenityGym: 'on',
    amenityWifi: 'true'
  };

  const preferences = {
    roomType: rawBody.roomType || 'Any',
    travelFrequency: rawBody.travelFrequency || 'Occasionally',
    priceRange: rawBody.priceRange || 'Mid-Range',
    locations: {
      beach: rawBody.locBeach === 'on' || rawBody.locBeach === 'true',
      mountain: rawBody.locMountain === 'on' || rawBody.locMountain === 'true',
      city: rawBody.locCity === 'on' || rawBody.locCity === 'true',
      rural: rawBody.locRural === 'on' || rawBody.locRural === 'true'
    },
    amenities: {
      pool: rawBody.amenityPool === 'on' || rawBody.amenityPool === 'true',
      gym: rawBody.amenityGym === 'on' || rawBody.amenityGym === 'true',
      restaurant: rawBody.amenityRestaurant === 'on' || rawBody.amenityRestaurant === 'true',
      spa: rawBody.amenitySpa === 'on' || rawBody.amenitySpa === 'true',
      wifi: rawBody.amenityWifi === 'on' || rawBody.amenityWifi === 'true'
    }
  };

  assert.strictEqual(preferences.roomType, 'Suite');
  assert.strictEqual(preferences.travelFrequency, 'Frequently');
  assert.strictEqual(preferences.priceRange, 'Premium');
  assert.strictEqual(preferences.locations.beach, true);
  assert.strictEqual(preferences.locations.mountain, true);
  assert.strictEqual(preferences.locations.city, false);
  assert.strictEqual(preferences.amenities.pool, true);
  assert.strictEqual(preferences.amenities.gym, true);
  assert.strictEqual(preferences.amenities.restaurant, false);
  assert.strictEqual(preferences.amenities.wifi, true);
});

test('formats export data payload properly', () => {
  const user = {
    name: 'Alex Morgan',
    email: 'alex@example.com',
    phone: '+91 98765 43210',
    dob: '1995-06-15',
    address: { city: 'Mumbai', country: 'India' }
  };
  const bookings = [
    { hotelName: 'Grand Resort', price: 12000, nights: 3, status: 'Completed' }
  ];

  const exportPayload = {
    exportDate: new Date().toISOString(),
    profile: user,
    bookings
  };

  assert.strictEqual(exportPayload.profile.name, 'Alex Morgan');
  assert.strictEqual(exportPayload.bookings.length, 1);
  assert.strictEqual(exportPayload.bookings[0].hotelName, 'Grand Resort');
});

