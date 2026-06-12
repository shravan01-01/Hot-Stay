const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

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
    // Assuming you have a logged-in user or fetched one from a DB
    const userData = {
        username: 'JohnDoe',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@example.com',
        bio: 'Fullstack developer and coffee enthusiast.',
        createdAt: '2023-01-15'
    };
    
    res.render('Profile', { user: userData });
});



app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});