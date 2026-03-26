const express = require("express");
const path = require("path");

const app = express();

// middleware to read form data
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// 👇 frontend folder as views
app.set("views", path.join(__dirname, "../frontend"));

// Landing page
app.get("/Hot-Stay", (req, res) => {
  res.render("landing");
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
  res.render("home.ejs"); // home.ejs
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});