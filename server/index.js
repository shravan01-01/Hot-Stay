const express = require("express");
const app = express();

// route
app.get("/", (req, res) => {
    res.send("Hello World 🚀");
});

app.get("/Hot-Stay", (req, res) => {
    res.send("Welcome to Hot Stay! 🚀");
});

// server start
app.listen(3000, () => {
    console.log("Server running on port 3000");
});