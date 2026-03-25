const express = require("express");
const app = express();

// route
app.get("/", (req, res) => {
    res.send("Hello World 🚀");
});

// server start
app.listen(3000, () => {
    console.log("Server running on port 3000");
});