const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const priceSchema = new Schema(
  {
    price: {
      type: Number,
      default: 5,
    },
    effective_from: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "ARCHIVED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("BottlePrice", priceSchema);
