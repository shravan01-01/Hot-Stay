const express = require("express");
const path = require("path");

const app = express();

app.set("view engine", "ejs");

// 👇 point to frontend folder
app.set("views", path.join(__dirname, "../frontend"));

app.get("/Hot-Stay", (req, res) => {
  res.render("landing"); // landing.ejs
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/Hot-Stay#", (req, res) => {
  res.render("Homes");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});