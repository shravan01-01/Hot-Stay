const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const app = express();

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
app.get("/Hot-Stay/home", (req, res) => {
  const category = req.query.category;
  const propertyType = req.query.type;
  const guests = req.query.guests;
  const location = req.query.location;
  
  try {
    const hotelDataPath = path.join(__dirname, '../database/hotelData.json');
    let hotels = JSON.parse(fs.readFileSync(hotelDataPath, 'utf8'));
    
    // Filter by category if provided
    if (category) {
      hotels = hotels.filter(hotel => 
        hotel.categories && hotel.categories.includes(category)
      );
    }
    
    // Filter by property type if provided
    if (propertyType && propertyType !== 'all') {
      hotels = hotels.filter(hotel => 
        hotel.type && hotel.type.toLowerCase().includes(propertyType.toLowerCase())
      );
    }
    
    // Filter by guest capacity if provided
    if (guests) {
      const guestCount = parseInt(guests);
      hotels = hotels.filter(hotel => hotel.guests >= guestCount);
    }
    
    // Filter by location if provided
    if (location && location.trim() !== '') {
      hotels = hotels.filter(hotel => 
        hotel.location && hotel.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Extract unique property types for the search form
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
    }); // home.ejs
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
app.get('/Hot-Stay/booking/:id', (req, res) => {
    // In a real app, you would: const hotel = await Hotel.findById(req.params.id);
    try {
        const hotelDataPath = path.join(__dirname, '../database/hotelData.json');
        const similarHotelsPath = path.join(__dirname, '../database/similarHotels.json');
        
        const hotels = JSON.parse(fs.readFileSync(hotelDataPath, 'utf8'));
        const similarHotels = JSON.parse(fs.readFileSync(similarHotelsPath, 'utf8'));
        
        // Find the hotel by ID
        const hotel = hotels.find(h => h.id === req.params.id);
        
        if (!hotel) {
            return res.status(404).send('Hotel not found');
        }
        
        res.render('booking', { 
            hotel: hotel, 
            similarHotels: similarHotels,
        });
    } catch (error) {
        console.error('Error reading hotel data:', error);
        res.status(500).send('Error loading hotel data');
    }
});


app.get('/Hot-Stay/Profile', (req, res) => {
    try {
        const usersPath = path.join(__dirname, '../database/users.json');
        const bookingsPath = path.join(__dirname, '../database/bookings.json');
        
        // Load users and bookings from database
        const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        const allBookings = JSON.parse(fs.readFileSync(bookingsPath, 'utf8'));
        
        // Get the first user (in real app, would use session/auth)
        const currentUser = users[0];
        
        if (!currentUser) {
            return res.status(404).send('User not found');
        }
        
        // Filter bookings for current user
        const userBookings = allBookings.filter(booking => booking.userId === currentUser.id);
        
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