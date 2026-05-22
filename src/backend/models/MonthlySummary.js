const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const summarySchema = new Schema(
  {
    month: Number,
    year: Number,
    total_bottles: Number,
    delivery_days: Number,
    total_amount: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model("MonthlySummary", summarySchema);
