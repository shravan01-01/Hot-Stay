const express = require("express"); // for creating the server
const mongoose = require("mongoose"); // for connecting to MongoDB
const path = require("path"); // for handling file paths
const bcrypt = require("bcryptjs"); // for hashing passwords

const Hotel = require('./models/Hotel'); // model for hotel data
const User = require('./models/User'); // model for user data
const Booking = require('./models/Booking'); // model for booking data
const { getHostedPropertiesForUser } = require('./models/hostUtils');

const app = express(); // create express app

// middleware to parse JSON and urlencoded request bodies with 10mb limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// serve static files from frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend"));

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/HotStay";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("MongoDB connected:", mongoURI);
}).catch((error) => {
  console.error("MongoDB connection error:", error);
});

// Helper to get current user with demo fallback
async function getCurrentUser(req) {
  let user = null;
  const userId = req?.query?.id || req?.body?.userId || req?.headers?.['x-user-id'];
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    user = await User.findById(userId);
  }
  if (!user) {
    user = await User.findOne({});
  }
  if (!user) {
    // Create default demo user if DB is empty
    const hashedPassword = await bcrypt.hash("password123", 10);
    user = await User.create({
      name: "Alex Morgan",
      firstName: "Alex",
      lastName: "Morgan",
      username: "alexmorgan",
      email: "alex.morgan@example.com",
      phone: "+91 98765 43210",
      password: hashedPassword,
      bio: "Passionate traveler, foodie, and architecture enthusiast. Always on the lookout for cozy stays with breathtaking views.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      dob: "1995-06-15",
      address: {
        street: "123 Horizon Boulevard",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "India"
      },
      settings: {
        communication: {
          bookingUpdates: true,
          promotions: true,
          newsletter: true,
          sms: false
        },
        privacy: {
          profileVisible: true,
          reviewsPublic: false
        },
        security: {
          twoFactorEnabled: false
        }
      },
      preferences: {
        roomType: "Luxury",
        travelFrequency: "Frequently",
        priceRange: "Premium",
        locations: {
          beach: true,
          mountain: true,
          city: true,
          rural: false
        },
        amenities: {
          pool: true,
          gym: true,
          restaurant: true,
          spa: true,
          wifi: true
        }
      },
      verified: true
    });
  }
  return user;
}

// Helper to format user data and calculate dynamic statistics
function formatUserData(userDoc, userBookings) {
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };

  const completedBookings = userBookings.filter(b => b.status === 'Completed');
  const cancelledBookings = userBookings.filter(b => b.status === 'Cancelled');
  const totalNights = userBookings.reduce((sum, b) => sum + (b.nights || 0), 0);
  const totalSpent = userBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const reviewedBookings = completedBookings.filter(b => b.reviewed).length;

  // Calculate average rating from reviewed bookings
  const ratings = completedBookings
    .filter(b => b.rating && !isNaN(b.rating))
    .map(b => Number(b.rating));
  const averageRating = ratings.length > 0
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : null;

  return {
    ...user,
    id: user._id.toString(),
    firstName: user.firstName || (user.name ? user.name.split(' ')[0] : 'Alex'),
    lastName: user.lastName || (user.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : 'Morgan'),
    username: user.username || (user.email ? user.email.split('@')[0] : 'alexmorgan'),
    bio: user.bio || 'Passionate traveler exploring the world one stay at a time.',
    avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    dob: user.dob || '',
    address: user.address || { street: '', city: '', state: '', postalCode: '', country: 'India' },
    settings: {
      communication: {
        bookingUpdates: user.settings?.communication?.bookingUpdates ?? true,
        promotions: user.settings?.communication?.promotions ?? true,
        newsletter: user.settings?.communication?.newsletter ?? true,
        sms: user.settings?.communication?.sms ?? false,
      },
      privacy: {
        profileVisible: user.settings?.privacy?.profileVisible ?? true,
        reviewsPublic: user.settings?.privacy?.reviewsPublic ?? false,
      },
      security: {
        twoFactorEnabled: user.settings?.security?.twoFactorEnabled ?? false,
      }
    },
    preferences: {
      roomType: user.preferences?.roomType || 'Any',
      travelFrequency: user.preferences?.travelFrequency || 'Occasionally',
      priceRange: user.preferences?.priceRange || 'Mid-Range',
      locations: {
        beach: user.preferences?.locations?.beach ?? true,
        mountain: user.preferences?.locations?.mountain ?? true,
        city: user.preferences?.locations?.city ?? true,
        rural: user.preferences?.locations?.rural ?? false,
      },
      amenities: {
        pool: user.preferences?.amenities?.pool ?? true,
        gym: user.preferences?.amenities?.gym ?? true,
        restaurant: user.preferences?.amenities?.restaurant ?? true,
        spa: user.preferences?.amenities?.spa ?? false,
        wifi: user.preferences?.amenities?.wifi ?? true,
      }
    },
    totalBookings: userBookings.length,
    totalTrips: completedBookings.length,
    cancelledBookings: cancelledBookings.length,
    totalSpent: totalSpent,
    totalNights: totalNights,
    reviewedBookings: reviewedBookings,
    averageRating: averageRating,
    cancellationRate: userBookings.length > 0
      ? (cancelledBookings.length / userBookings.length * 100).toFixed(1)
      : 0
  };
}

// ----------------------------------------------------
// Public & Authentication Routes
// ----------------------------------------------------

// Landing page
app.get("/Hot-Stay", (req, res) => {
  res.render("landing");
});

app.get("/about", (req, res) => {
  res.render("about");
});

// Login page
app.get("/Hot-Stay/login", (req, res) => {
  res.render("login");
});

// Register page
app.get("/Hot-Stay/register", (req, res) => {
  res.render("register", { error: null });
});

// Register Route
app.post("/Hot-Stay/register", async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !password || !confirmPassword) {
      return res.render("register", {
        error: "Name and both password fields are required"
      });
    }

    if (password !== confirmPassword) {
      return res.render("register", {
        error: "Passwords do not match"
      });
    }

    // Either email or phone is required
    if (!email && !phone) {
      return res.render("register", {
        error: "Email or Phone is required"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email ? email.toLowerCase() : null },
        { phone: phone || null }
      ].filter(Boolean)
    });

    if (existingUser) {
      return res.render("register", {
        error: "User already exists"
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    const username = (email ? email.split('@')[0] : name.toLowerCase().replace(/\s+/g, '')) + Math.floor(Math.random() * 100);

    // Create User
    await User.create({
      name,
      firstName,
      lastName,
      username,
      email: email ? email.toLowerCase() : undefined,
      phone,
      password: hashedPassword
    });
    console.log("User created:", email || phone);

    return res.redirect("/Hot-Stay/login");
  } catch (err) {
    console.error("Register error:", err);
    return res.render("register", {
      error: err.message || "Unable to register user"
    });
  }
});

// Handle login form
app.post("/Validation", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send("Invalid credentials");
    }

    // Redirect to home page    
    res.redirect("/Hot-Stay/home");
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal server error");
  }
});

// Home page
app.get("/Hot-Stay/home", async (req, res) => {
  const category = req.query.category;
  const propertyType = req.query.type;
  const guests = req.query.guests;
  const location = req.query.location;

  try {
    let query = {};

    // Build MongoDB query
    if (category) {
      query.categories = { $in: [category] };
    }
    if (propertyType && propertyType !== 'all') {
      query.type = { $regex: propertyType, $options: 'i' };
    }
    if (guests) {
      query.guests = { $gte: parseInt(guests) };
    }
    if (location && location.trim() !== '') {
      query.location = { $regex: location, $options: 'i' };
    }

    const hotels = await Hotel.find(query).lean();
    const propertyTypes = [...new Set(hotels.map(h => h.type).filter(Boolean))];

    const currentUser = await getCurrentUser(req);
    const savedHotelIds = (currentUser?.savedHotels || []).map(id => id.toString());

    res.render("home", {
      hotels: hotels,
      selectedCategory: category || null,
      id: currentUser ? currentUser._id.toString() : null,
      savedHotels: savedHotelIds,
      propertyTypes: propertyTypes,
      searchFilters: {
        type: propertyType,
        guests: guests,
        location: location
      }
    });
  } catch (error) {
    console.error('Error reading hotel data:', error);
    res.render("home", {
      hotels: [],
      selectedCategory: category || null,
      id: req.query.id || null,
      savedHotels: [],
      error: 'Error loading hotels'
    });
  }
});

// Hotel Booking Detail Page
app.get('/Hot-Stay/booking/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).lean();

    if (!hotel) {
      return res.status(404).send('Hotel not found');
    }

    // Get similar hotels (same type or category)
    const similarHotels = await Hotel.find({
      $and: [
        { _id: { $ne: hotel._id } },
        {
          $or: [
            { type: hotel.type },
            { categories: { $in: hotel.categories || [] } }
          ]
        }
      ]
    }).limit(6).lean();

    res.render('booking', {
      hotel: hotel,
      similarHotels: similarHotels,
      id: req.query.id || null
    });
  } catch (error) {
    console.error('Error reading hotel data:', error);
    res.status(500).send('Error loading hotel data');
  }
});

// Create a new booking
app.post('/Hot-Stay/booking/create', async (req, res) => {
  try {
    const { hotelId, hotelName, location, fullName, guestEmail, phone, checkIn, checkOut, guests, nights, totalPrice, pricePerNight, specialRequests, image } = req.body;

    // Validation
    if (!hotelId || !fullName || !guestEmail || !phone || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Get current user
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please log in.'
      });
    }

    // Calculate nights if not provided
    const calculatedNights = nights || Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const calculatedPrice = totalPrice || (calculatedNights * parseFloat(pricePerNight));

    // Create booking
    const booking = new Booking({
      userId: currentUser._id.toString(),
      hotelId: hotelId,
      hotelName: hotelName,
      location: location,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: parseInt(guests),
      nights: calculatedNights,
      price: parseFloat(calculatedPrice),
      status: 'Upcoming',
      reviewed: false,
      image: image,
      bookingDate: new Date(),
      guestName: fullName,
      guestEmail: guestEmail,
      phone: phone,
      specialRequests: specialRequests || ''
    });

    await booking.save();

    console.log('Booking created successfully:', booking._id);

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed!',
      bookingId: booking._id,
      redirectUrl: '/Hot-Stay/Profile'
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating booking: ' + error.message
    });
  }
});

// ----------------------------------------------------
// Profile & User Account Routes
// ----------------------------------------------------

// Profile View Route
app.get('/Hot-Stay/Profile', async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return res.status(404).send('User not found');
    }

    // Filter bookings for current user (match both ObjectId and string)
    const userBookings = await Booking.find({
      $or: [
        { userId: currentUser._id.toString() },
        { userId: currentUser._id }
      ]
    }).sort({ bookingDate: -1 }).lean();

    // If user has saved hotels, fetch them
    let savedHotels = [];
    if (currentUser.savedHotels && currentUser.savedHotels.length > 0) {
      savedHotels = await Hotel.find({ _id: { $in: currentUser.savedHotels } }).lean();
    }

    const userData = formatUserData(currentUser, userBookings);

    res.render('Profile', {
      user: userData,
      bookings: userBookings,
      savedHotels: savedHotels,
      id: currentUser._id.toString(),
      message: req.query.message || null,
      activeTab: req.query.tab || 'bookings'
    });

  } catch (error) {
    console.error('Error loading profile data:', error);
    res.status(500).send('Error loading profile data: ' + error.message);
  }
});

// Update Profile Personal Information & Avatar
app.post('/Hot-Stay/profile/update', async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      firstName,
      lastName,
      username,
      email,
      phone,
      dob,
      bio,
      street,
      city,
      state,
      postalCode,
      country,
      avatar
    } = req.body;

    if (firstName) currentUser.firstName = firstName.trim();
    if (lastName) currentUser.lastName = lastName.trim();
    if (firstName || lastName) {
      currentUser.name = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.name;
    }
    if (username) currentUser.username = username.trim();
    if (email) currentUser.email = email.trim().toLowerCase();
    if (phone) currentUser.phone = phone.trim();
    if (dob !== undefined) currentUser.dob = dob;
    if (bio !== undefined) currentUser.bio = bio.trim();
    if (avatar) currentUser.avatar = avatar;

    // Update address
    currentUser.address = {
      street: street !== undefined ? street.trim() : (currentUser.address?.street || ''),
      city: city !== undefined ? city.trim() : (currentUser.address?.city || ''),
      state: state !== undefined ? state.trim() : (currentUser.address?.state || ''),
      postalCode: postalCode !== undefined ? postalCode.trim() : (currentUser.address?.postalCode || ''),
      country: country !== undefined ? country.trim() : (currentUser.address?.country || 'India')
    };

    await currentUser.save();

    const isJson = req.xhr || req.headers['content-type']?.includes('application/json') || req.headers.accept?.includes('application/json');
    if (isJson) {
      return res.json({ success: true, message: 'Profile updated successfully', user: currentUser });
    }
    return res.redirect('/Hot-Stay/Profile?message=Profile+updated+successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ success: false, message: 'Error updating profile: ' + error.message });
  }
});

// Update Preferences
app.post('/Hot-Stay/profile/preferences', async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      roomType,
      travelFrequency,
      priceRange,
      locBeach,
      locMountain,
      locCity,
      locRural,
      amenityPool,
      amenityGym,
      amenityRestaurant,
      amenitySpa,
      amenityWifi
    } = req.body;

    currentUser.preferences = {
      roomType: roomType || currentUser.preferences?.roomType || 'Any',
      travelFrequency: travelFrequency || currentUser.preferences?.travelFrequency || 'Occasionally',
      priceRange: priceRange || currentUser.preferences?.priceRange || 'Mid-Range',
      locations: {
        beach: locBeach === true || locBeach === 'true' || locBeach === 'on',
        mountain: locMountain === true || locMountain === 'true' || locMountain === 'on',
        city: locCity === true || locCity === 'true' || locCity === 'on',
        rural: locRural === true || locRural === 'true' || locRural === 'on'
      },
      amenities: {
        pool: amenityPool === true || amenityPool === 'true' || amenityPool === 'on',
        gym: amenityGym === true || amenityGym === 'true' || amenityGym === 'on',
        restaurant: amenityRestaurant === true || amenityRestaurant === 'true' || amenityRestaurant === 'on',
        spa: amenitySpa === true || amenitySpa === 'true' || amenitySpa === 'on',
        wifi: amenityWifi === true || amenityWifi === 'true' || amenityWifi === 'on'
      }
    };

    await currentUser.save();

    const isJson = req.xhr || req.headers['content-type']?.includes('application/json') || req.headers.accept?.includes('application/json');
    if (isJson) {
      return res.json({ success: true, message: 'Preferences saved successfully', preferences: currentUser.preferences });
    }
    return res.redirect('/Hot-Stay/Profile?tab=preferences&message=Preferences+saved+successfully');
  } catch (error) {
    console.error('Error saving preferences:', error);
    return res.status(500).json({ success: false, message: 'Error saving preferences: ' + error.message });
  }
});

// Update Settings (Communication & Privacy)
app.post('/Hot-Stay/profile/settings', async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      bookingUpdates,
      promotions,
      newsletter,
      sms,
      profileVisible,
      reviewsPublic,
      twoFactorEnabled
    } = req.body;

    currentUser.settings = {
      communication: {
        bookingUpdates: bookingUpdates === true || bookingUpdates === 'true' || bookingUpdates === 'on',
        promotions: promotions === true || promotions === 'true' || promotions === 'on',
        newsletter: newsletter === true || newsletter === 'true' || newsletter === 'on',
        sms: sms === true || sms === 'true' || sms === 'on'
      },
      privacy: {
        profileVisible: profileVisible === true || profileVisible === 'true' || profileVisible === 'on',
        reviewsPublic: reviewsPublic === true || reviewsPublic === 'true' || reviewsPublic === 'on'
      },
      security: {
        twoFactorEnabled: twoFactorEnabled === true || twoFactorEnabled === 'true' || twoFactorEnabled === 'on'
      }
    };

    await currentUser.save();

    const isJson = req.xhr || req.headers['content-type']?.includes('application/json') || req.headers.accept?.includes('application/json');
    if (isJson) {
      return res.json({ success: true, message: 'Settings saved successfully', settings: currentUser.settings });
    }
    return res.redirect('/Hot-Stay/Profile?tab=settings&message=Settings+saved+successfully');
  } catch (error) {
    console.error('Error saving settings:', error);
    return res.status(500).json({ success: false, message: 'Error saving settings: ' + error.message });
  }
});

// Change Password
app.post('/Hot-Stay/profile/change-password', async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, currentUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    // Hash and save new password
    currentUser.password = await bcrypt.hash(newPassword, 10);
    await currentUser.save();

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ success: false, message: 'Error changing password: ' + error.message });
  }
});

// Export User Profile Data as JSON download
app.get('/Hot-Stay/profile/export-data', async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return res.status(404).send('User not found');
    }

    const bookings = await Booking.find({
      $or: [
        { userId: currentUser._id.toString() },
        { userId: currentUser._id }
      ]
    }).lean();

    const exportData = {
      exportDate: new Date().toISOString(),
      profile: {
        name: currentUser.name,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        username: currentUser.username,
        email: currentUser.email,
        phone: currentUser.phone,
        bio: currentUser.bio,
        dob: currentUser.dob,
        address: currentUser.address,
        memberSince: currentUser.createdAt,
        verified: currentUser.verified
      },
      preferences: currentUser.preferences,
      settings: currentUser.settings,
      bookings: bookings.map(b => ({
        id: b._id,
        hotelName: b.hotelName,
        location: b.location,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        guests: b.guests,
        nights: b.nights,
        price: b.price,
        status: b.status,
        rating: b.rating,
        reviewText: b.reviewText,
        bookingDate: b.bookingDate
      }))
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="hotstay-profile-${currentUser.username || 'user'}.json"`);
    return res.send(jsonString);
  } catch (error) {
    console.error('Error exporting profile data:', error);
    return res.status(500).send('Error exporting data: ' + error.message);
  }
});

// Cancel Booking
app.post('/Hot-Stay/booking/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    const isJson = req.xhr || req.headers['content-type']?.includes('application/json') || req.headers.accept?.includes('application/json');
    if (isJson) {
      return res.json({ success: true, message: 'Booking cancelled successfully', booking });
    }
    return res.redirect('/Hot-Stay/Profile?message=Booking+cancelled+successfully');
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({ success: false, message: 'Error cancelling booking: ' + error.message });
  }
});

// Submit Review for Booking
app.post('/Hot-Stay/booking/:id/review', async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const ratingNum = Math.min(5, Math.max(1, parseFloat(rating) || 5));
    booking.rating = ratingNum;
    booking.reviewed = true;
    booking.status = 'Completed';
    booking.reviewText = reviewText ? reviewText.trim() : '';
    booking.reviewComment = booking.reviewText;
    booking.reviewDate = new Date();
    await booking.save();

    // Update hotel review count and rating if hotel exists
    if (booking.hotelId && mongoose.Types.ObjectId.isValid(booking.hotelId)) {
      const hotel = await Hotel.findById(booking.hotelId);
      if (hotel) {
        const hotelBookings = await Booking.find({ hotelId: booking.hotelId, reviewed: true });
        const avgRating = hotelBookings.reduce((sum, b) => sum + (b.rating || 0), 0) / hotelBookings.length;
        hotel.rating = parseFloat(avgRating.toFixed(1));
        hotel.reviewCount = hotelBookings.length;
        await hotel.save();
      }
    }

    const isJson = req.xhr || req.headers['content-type']?.includes('application/json') || req.headers.accept?.includes('application/json');
    if (isJson) {
      return res.json({ success: true, message: 'Review submitted successfully', booking });
    }
    return res.redirect('/Hot-Stay/Profile?tab=reviews&message=Review+submitted+successfully');
  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(500).json({ success: false, message: 'Error submitting review: ' + error.message });
  }
});

// Toggle Saved Hotel (Wishlist)
app.post('/Hot-Stay/hotel/:id/toggle-save', async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'Please log in to save hotels' });
    }

    const hotelId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({ success: false, message: 'Invalid hotel ID' });
    }

    if (!currentUser.savedHotels) {
      currentUser.savedHotels = [];
    }

    const index = currentUser.savedHotels.findIndex(id => id.toString() === hotelId.toString());
    let isSaved = false;

    if (index > -1) {
      // Remove from saved
      currentUser.savedHotels.splice(index, 1);
      isSaved = false;
    } else {
      // Add to saved
      currentUser.savedHotels.push(hotelId);
      isSaved = true;
    }

    await currentUser.save();

    return res.json({
      success: true,
      isSaved: isSaved,
      message: isSaved ? 'Hotel added to saved properties' : 'Hotel removed from saved properties'
    });
  } catch (error) {
    console.error('Error toggling saved hotel:', error);
    return res.status(500).json({ success: false, message: 'Error saving hotel: ' + error.message });
  }
});

// Delete Account (Danger Zone)
app.post('/Hot-Stay/profile/delete', async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete user's bookings
    await Booking.deleteMany({
      $or: [
        { userId: currentUser._id.toString() },
        { userId: currentUser._id }
      ]
    });

    // Delete user
    await User.findByIdAndDelete(currentUser._id);

    const isJson = req.xhr || req.headers['content-type']?.includes('application/json') || req.headers.accept?.includes('application/json');
    if (isJson) {
      return res.json({ success: true, message: 'Account deleted successfully', redirectUrl: '/Hot-Stay/register' });
    }
    return res.redirect('/Hot-Stay/register');
  } catch (error) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ success: false, message: 'Error deleting account: ' + error.message });
  }
});

// ----------------------------------------------------
// Host Routes
// ----------------------------------------------------

// Show form to create a new hosted property
app.get('/Hot-Stay/host/new', (req, res) => {
  res.render('host_new', { id: req.query.id || null });
});

// Save a new hosted property
app.post('/Hot-Stay/host/new', async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    const { name, description, location, price, images, type, guests, categories, hostEmail } = req.body;
    const hotel = new Hotel({
      name,
      description,
      location,
      price: parseFloat(price) || 0,
      images: images ? images.split(',').map(s => s.trim()) : [],
      type,
      guests: parseInt(guests) || 1,
      categories: categories ? categories.split(',').map(s => s.trim()) : [],
      hostEmail: hostEmail || currentUser?.email || '',
      host: currentUser?.name || 'Host'
    });

    await hotel.save();
    res.redirect('/Hot-Stay/home');
  } catch (error) {
    console.error('Error creating hosted property:', error);
    res.status(500).send('Error creating property');
  }
});

// Host dashboard - list only the current user's hosted properties
app.get('/Hot-Stay/host/hosted-list', async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return res.status(404).send('User not found');
    }

    const allHotels = await Hotel.find({}).sort({ createdAt: -1 }).lean();
    const hotels = getHostedPropertiesForUser(allHotels, currentUser.email);

    res.render('hosted-list', { hotels, user: currentUser, id: req.query.id || null });
  } catch (error) {
    console.error('Error loading host dashboard:', error);
    res.status(500).send('Error loading dashboard');
  }
});

// Show form to edit an existing hosted property
app.get('/Hot-Stay/host/:id/edit', async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    const hotel = await Hotel.findById(req.params.id).lean();

    if (!hotel) {
      return res.status(404).send('Property not found');
    }

    if (currentUser && hotel.hostEmail && hotel.hostEmail.toLowerCase() !== currentUser.email.toLowerCase()) {
      return res.status(403).send('You can only edit your own properties');
    }

    res.render('host_edit', { hotel, user: currentUser, id: req.query.id || null });
  } catch (error) {
    console.error('Error loading property edit form:', error);
    res.status(500).send('Error loading edit form');
  }
});

// Update an existing hosted property
app.post('/Hot-Stay/host/:id/edit', async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).send('Property not found');
    }

    if (currentUser && hotel.hostEmail && hotel.hostEmail.toLowerCase() !== currentUser.email.toLowerCase()) {
      return res.status(403).send('You can only edit your own properties');
    }

    const { name, description, location, price, images, type, guests, categories, hostEmail } = req.body;

    hotel.name = name;
    hotel.description = description;
    hotel.location = location;
    hotel.price = parseFloat(price) || 0;
    hotel.images = images ? images.split(',').map(s => s.trim()) : hotel.images;
    hotel.type = type;
    hotel.guests = parseInt(guests) || hotel.guests || 1;
    hotel.categories = categories ? categories.split(',').map(s => s.trim()) : hotel.categories;
    hotel.hostEmail = hostEmail || hotel.hostEmail || currentUser?.email || '';
    hotel.host = currentUser?.name || hotel.host || 'Host';

    await hotel.save();
    res.redirect('/Hot-Stay/host/hosted-list');
  } catch (error) {
    console.error('Error updating hosted property:', error);
    res.status(500).send('Error updating property');
  }
});

// ----------------------------------------------------
// Start Server
// ----------------------------------------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;