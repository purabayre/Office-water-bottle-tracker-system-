const MonthlySummary = require("../models/MonthlySummary");
const memoryStore = require("../services/memoryStore");
const mongoose = require("mongoose");

exports.getMonthlySummary = async (req, res, next) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: "Invalid month" });
    }

    if (!Number.isInteger(year) || year < 2000) {
      return res.status(400).json({ message: "Invalid year" });
    }

    if (!memoryStore.isDbConnected(mongoose)) {
      return res.json({
        summary: memoryStore.getSummary(month, year),
      });
    }

    const summary = await MonthlySummary.findOne({
      month: Number(month),
      year: Number(year),
    });

    if (!summary) {
      return res.json({
        summary: {
          month,
          year,
          total_bottles: 0,
          total_amount: 0,
          delivery_days: 0,
        },
      });
    }

    res.json({
      summary: {
        month: summary.month,
        year: summary.year,
        total_bottles: summary.total_bottles,
        total_amount: summary.total_amount,
        delivery_days: summary.delivery_days,
      },
    });
  } catch (err) {
    res.status(500).send("server error");
  }
};
