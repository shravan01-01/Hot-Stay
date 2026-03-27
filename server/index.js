const express = require("express");
const path = require("path");
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

const hotelData = {
    id: "hot-stay-001",
    name: "The Heritage Coral Villa",
    location: "Udaipur, Rajasthan, India",
    rating: 4.92,
    reviewCount: 458,
    type: "Luxury Boutique Stay",
    price: 12500,
    originalPrice: 15000,
    host: "Ananya Sharma",
    guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    description: "Nestled on the banks of Lake Pichola, The Heritage Coral Villa offers a blend of traditional Mewari architecture and modern luxury. Enjoy private balconies, hand-painted murals, and a signature infinity pool overlooking the 'City of Lakes'. Perfect for couples or small families seeking a premium escape.",
    images: [
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400",
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=400",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400"
    ],
    amenities: [
        "Lake View", "High-speed WiFi", "Infinity Pool", 
        "Dedicated Workspace", "Central AC", "Free Parking", 
        "Breakfast Included", "Pet Friendly"
    ],
    reviews: [
        { 
            userName: "Vikram Singh", 
            avatar: "https://i.pravatar.cc/100?u=vikram", 
            date: "February 2026", 
            comment: "The views are even better than the photos! The staff made us feel like royalty.", 
            rating: 5 
        },
        { 
            userName: "Sarah Jenkins", 
            avatar: "https://i.pravatar.cc/100?u=sarah", 
            date: "January 2026", 
            comment: "Extremely clean and the decor is stunning. Best stay in Udaipur so far.", 
            rating: 4.8 
        }
    ]
};

const similarHotels = [
    {
        id: "hot-stay-002",
        name: "Desert Rose Resort",
        location: "Jaisalmer",
        rating: 4.7,
        price: 8900,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400"
    },
    {
        id: "hot-stay-003",
        name: "Jaipur Palace Suites",
        location: "Jaipur",
        rating: 4.85,
        price: 10200,
        image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=400"
    },
    {
        id: "hot-stay-004",
        name: "Mountain Mist Retreat",
        location: "Manali",
        rating: 4.6,
        price: 7500,
        image: "https://images.unsplash.com/photo-1445013544686-8301edd829b1?auto=format&fit=crop&w=400"
    }
];

// 4. Routes
app.get('/Hot-Stay/booking/:id', (req, res) => {
    // In a real app, you would: const hotel = await Hotel.findById(req.params.id);
    res.render('booking', { 
        hotel: hotelData, 
        similarHotels: similarHotels 
    });
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