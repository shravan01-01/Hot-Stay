const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

// middleware to read form data
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "Public/ejs"))); // serve static files from frontend folder

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
  res.render("home"); // home.ejs
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