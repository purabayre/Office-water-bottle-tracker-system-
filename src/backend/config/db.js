const mongoose = require("mongoose");

const connectDB = () => {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI is not set. Using in-memory data for this run.");
    return Promise.resolve(false);
  }

  return mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log("MongoDB Connected");
      return true;
    })
    .catch((err) => {
      console.log("DB Error:", err);
      return false;
    });
};

module.exports = connectDB;
