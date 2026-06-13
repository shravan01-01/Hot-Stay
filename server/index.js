const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const app = express();
const Hotel = require('./models/Hotel');
const User = require('./models/User');
const Booking = require('./models/Booking');

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/HotStay";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("MongoDB connected:", mongoURI);
}).catch((error) => {
  console.error("MongoDB connection error:", error);
});

// middleware to read form data
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../frontend"))); // serve static files from frontend folder

app.set("view engine", "ejs");

// 👇 frontend folder as views
app.set("views", path.join(__dirname, "../frontend"));

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

// 🔥 Handle login form
app.post("/Validation", (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);

  // dummy validation
  if (email === "admin@gmail.com" && password === "1234") {
    res.redirect("/Hot-Stay/home");
  } else {
    res.send("Invalid credentials");
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
    
    res.render("home", { 
      hotels: hotels,
      selectedCategory: category || null,
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
      error: 'Error loading hotels'
    });
  }
});


// 4. Routes
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
        });
    } catch (error) {
        console.error('Error reading hotel data:', error);
        res.status(500).send('Error loading hotel data');
    }
});


app.get('/Hot-Stay/Profile', async (req, res) => {
    try {
        // Get the first user (in real app, would use session/auth)
        const currentUser = await User.findOne({}).lean();
        
        if (!currentUser) {
            return res.status(404).send('User not found');
        }
        
        // Filter bookings for current user
        const userBookings = await Booking.find({ userId: currentUser.id }).lean();
        
        // Calculate statistics dynamically
        const completedBookings = userBookings.filter(b => b.status === 'Completed');
        const cancelledBookings = userBookings.filter(b => b.status === 'Cancelled');
        const totalNights = userBookings.reduce((sum, b) => sum + (b.nights || 0), 0);
        const totalSpent = userBookings.reduce((sum, b) => sum + (b.price || 0), 0);
        const reviewedBookings = completedBookings.filter(b => b.reviewed).length;
        
        // Calculate average rating
        const ratings = completedBookings
            .filter(b => b.rating !== null)
            .map(b => b.rating);
        const averageRating = ratings.length > 0 
            ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
            : null;
        
        // Prepare user data with calculated stats
        const userData = {
            ...currentUser,
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
        
        // Sort bookings by date (newest first)
        const sortedBookings = userBookings.sort((a, b) => 
            new Date(b.bookingDate) - new Date(a.bookingDate)
        );
        
        res.render('Profile', { user: userData, bookings: sortedBookings });
        
    } catch (error) {
        console.error('Error loading profile data:', error);
        res.status(500).send('Error loading profile data');
    }
});



app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});


// Host routes - allow users to list and create host properties
// Show form to create a new hosted property
app.get('/Hot-Stay/host/new', (req, res) => {
  res.render('host_new');
});

// Save a new hosted property
app.post('/Hot-Stay/host/new', async (req, res) => {
  try {
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
      hostEmail
    });

    await hotel.save();
    res.redirect('/Hot-Stay/host/dashboard');
  } catch (error) {
    console.error('Error creating hosted property:', error);
    res.status(500).send('Error creating property');
  }
});

// Host dashboard - list hosted properties (all for now)
app.get('/Hot-Stay/host/dashboard', async (req, res) => {
    try {
        const hotels = await Hotel.find({}).sort({ createdAt: -1 }).lean();
        res.render('host_dashboard', { hotels });
    } catch (error) {
        console.error('Error loading host dashboard:', error);
        res.status(500).send('Error loading dashboard');
    }
});