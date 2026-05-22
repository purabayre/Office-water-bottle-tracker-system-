const BottleEntry = require("../models/BottleEntry");
const MonthlySummary = require("../models/MonthlySummary");

exports.updateMonthlySummary = async (month, year) => {
  try {
    month = Number(month);
    year = Number(year);

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new Error("Invalid month");
    }

    if (!Number.isInteger(year) || year < 2000) {
      throw new Error("Invalid year");
    }

    // Same data set as aggregation $match
    const entries = await BottleEntry.find({ month, year });

    // Same aggregation logic manually
    let total_bottles = 0;
    let total_amount = 0;
    let delivery_days = 0;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      total_bottles += entry.bottle_count ? entry.bottle_count : 0;
      total_amount += entry.amount ? entry.amount : 0;
      delivery_days += 1;
    }

    return await MonthlySummary.findOneAndUpdate(
      { month, year },
      {
        $set: {
          total_bottles,
          total_amount,
          delivery_days,
        },
      },
      {
        new: true,
        upsert: true,
      },
    );
  } catch (error) {
    throw error;
  }
};
