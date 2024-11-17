const mongoose = require("mongoose");

async function connectMongoDB(url) {
  await mongoose
    .connect(url)
    .then(() => console.log("MongoDB connected Successfully!"))
    .catch((err) => console.log("Mongo Error :", err));
}

module.exports = { connectMongoDB };
