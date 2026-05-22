const BottleEntry = require("../models/BottleEntry");
const BottlePrice = require("../models/BottlePrice");
const { updateMonthlySummary } = require("../services/summaryService");
const memoryStore = require("../services/memoryStore");
const mongoose = require("mongoose");

// ADD
exports.addEntry = async (req, res, next) => {
  try {
    const { date, bottle_count } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const entryDate = new Date(date);

    if (isNaN(entryDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    entryDate.setUTCHours(0, 0, 0, 0);

    if (bottle_count === undefined) {
      return res.status(400).json({ message: "Bottle Count is required" });
    }

    if (!Number.isInteger(bottle_count)) {
      return res
        .status(400)
        .json({ message: "Bottle count must be whole number" });
    }

    if (bottle_count <= 0) {
      return res
        .status(400)
        .json({ message: "negative bottles are not allowed" });
    }

    if (!memoryStore.isDbConnected(mongoose)) {
      const saved = memoryStore.addEntry({ date, bottle_count });

      if (!saved) {
        return res
          .status(400)
          .json({ message: "Entry already exists for today" });
      }

      return res.json({
        message: "Entry added",
        data: {
          ...saved,
          id: saved._id,
        },
      });
    }

    const existing = await BottleEntry.findOne({ date });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Entry already exists for today" });
    }

    const priceData = await BottlePrice.findOne().sort({
      effective_from: -1,
    });

    const DEFAULT_PRICE = 5;
    const price = priceData?.price ?? DEFAULT_PRICE;

    const month = entryDate.getUTCMonth() + 1;
    const year = entryDate.getUTCFullYear();

    const amount = bottle_count * price;

    const newEntry = new BottleEntry({
      date,
      bottle_count,
      price_per_bottle: price,
      amount,
      month,
      year,
    });

    const saved = await newEntry.save();

    await updateMonthlySummary(month, year);

    const formatted = {
      ...saved.toObject(),
      id: saved._id.toString(),
    };

    delete formatted._id;
    delete formatted.__v;
    delete formatted.createdAt;
    delete formatted.updatedAt;

    return res.json({
      message: "Entry added",
      data: formatted,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
};

// MONTHLY ENTRIES
exports.getMonthlyEntries = async (req, res, next) => {
  try {
    const { month, year, page, limit } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Month and year are required",
      });
    }

    const monthNum = Number(month);
    const yearNum = Number(year);

    if (!Number.isInteger(monthNum) || !Number.isInteger(yearNum)) {
      return res.status(400).json({
        message: "Month and year must be valid integers",
      });
    }

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        message: "Month must be between 1 and 12",
      });
    }

    if (yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({
        message: "Year must be between 2000 and 2100",
      });
    }

    const pageNum = page === undefined ? null : Number(page);
    const limitNum = limit === undefined ? null : Number(limit);
    const shouldPaginate = pageNum !== null || limitNum !== null;

    if (shouldPaginate) {
      if (
        !Number.isInteger(pageNum) ||
        !Number.isInteger(limitNum) ||
        pageNum < 1 ||
        limitNum < 1
      ) {
        return res.status(400).json({
          message: "Page and limit must be positive integers",
        });
      }
    }

    if (!memoryStore.isDbConnected(mongoose)) {
      const entries = memoryStore.getEntriesByMonth(monthNum, yearNum);
      const summary = memoryStore.getSummary(monthNum, yearNum);
      const paginatedEntries = shouldPaginate
        ? entries.slice((pageNum - 1) * limitNum, pageNum * limitNum)
        : entries;

      const response = {
        summary: {
          total_bottles: summary.total_bottles,
          total_amount: summary.total_amount,
          delivery_days: summary.delivery_days,
        },
        entries: paginatedEntries.map((entry) => ({
          ...entry,
          id: entry._id,
        })),
      };

      if (shouldPaginate) {
        response.pagination = {
          page: pageNum,
          limit: limitNum,
          total_entries: entries.length,
          total_pages: Math.ceil(entries.length / limitNum),
        };
      }

      return res.json(response);
    }

    const query = {
      month: monthNum,
      year: yearNum,
    };

    let entriesQuery = BottleEntry.find(query)
      .sort({ date: 1 })
      .select("-__v -createdAt -updatedAt")
      .lean();

    if (shouldPaginate) {
      entriesQuery = entriesQuery
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);
    }

    const [entries, allEntriesCount, summaryEntries] = await Promise.all([
      entriesQuery,
      shouldPaginate ? BottleEntry.countDocuments(query) : null,
      shouldPaginate
        ? BottleEntry.find(query).select("bottle_count amount").lean()
        : null,
    ]);

    let total_bottles = 0;
    let total_amount = 0;

    (summaryEntries || entries).forEach((e) => {
      total_bottles += e.bottle_count;
      total_amount += e.amount;
    });

    const formattedEntries = entries.map((e) => ({
      ...e,
      id: e._id.toString(),
    }));

    const response = {
      summary: {
        total_bottles,
        total_amount,
        delivery_days: shouldPaginate
          ? allEntriesCount
          : formattedEntries.length,
      },
      entries: formattedEntries,
    };

    if (shouldPaginate) {
      response.pagination = {
        page: pageNum,
        limit: limitNum,
        total_entries: allEntriesCount,
        total_pages: Math.ceil(allEntriesCount / limitNum),
      };
    }

    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
};

// UPDATE
exports.updateEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bottle_count } = req.body;

    if (bottle_count === undefined) {
      return res.status(400).json({ message: "Bottle Count is required" });
    }

    if (!Number.isInteger(bottle_count)) {
      return res
        .status(400)
        .json({ message: "Bottle count must be whole number" });
    }

    if (bottle_count <= 0) {
      return res
        .status(400)
        .json({ message: "negative bottles are not allowed" });
    }

    if (!memoryStore.isDbConnected(mongoose)) {
      const updated = memoryStore.updateEntry(id, bottle_count);

      if (!updated) {
        return res.status(404).json({ message: "Entry not found" });
      }

      return res.json({
        message: "Entry updated",
        data: {
          ...updated,
          id: updated._id,
        },
      });
    }

    const entry = await BottleEntry.findById(id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const newAmount = bottle_count * entry.price_per_bottle;

    const updated = await BottleEntry.findByIdAndUpdate(
      id,
      {
        bottle_count,
        amount: newAmount,
      },
      { new: true },
    );

    await updateMonthlySummary(updated.month, updated.year);

    const formatted = {
      ...updated.toObject(),
      id: updated._id.toString(),
    };

    delete formatted._id;
    delete formatted.__v;
    delete formatted.createdAt;
    delete formatted.updatedAt;

    return res.json({
      message: "Entry updated",
      data: formatted,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
};

// DELETE
exports.deleteEntry = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!memoryStore.isDbConnected(mongoose)) {
      const deleted = memoryStore.deleteEntry(id);

      if (!deleted) {
        return res.status(404).json({ message: "Entry not found" });
      }

      return res.json({ message: "Entry deleted successfully" });
    }

    const entry = await BottleEntry.findById(id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    await BottleEntry.findByIdAndDelete(id);

    try {
      await updateMonthlySummary(entry.month, entry.year);
    } catch (summaryErr) {
      console.error("Monthly summary update failed after delete:", summaryErr);
    }

    return res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
};
