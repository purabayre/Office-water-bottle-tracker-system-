const mongoose = require("mongoose");
const BottlePrice = require("../models/BottlePrice");
const memoryStore = require("../services/memoryStore");

exports.setPrice = async (req, res, next) => {
  let session;

  try {
    let { price } = req.body;

    price = Number(price);
    if (!price || isNaN(price) || price <= 0) {
      return res.status(400).json({ message: "Price must be a valid number" });
    }

    if (!memoryStore.isDbConnected(mongoose)) {
      const saved = memoryStore.setPrice(price);

      return res.status(201).json({
        updatedPrice: {
          price: saved.price,
          effective_from: saved.effective_from,
          status: saved.status,
        },
      });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    await BottlePrice.updateMany(
      { status: "ACTIVE" },
      { status: "ARCHIVED" },
      { session },
    );

    const newPrice = new BottlePrice({
      price,
      effective_from: new Date(),
      status: "ACTIVE",
    });

    const saved = await newPrice.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      updatedPrice: {
        price: saved.price,
        effective_from: saved.effective_from,
        status: saved.status,
      },
    });
  } catch (err) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    console.log(err);
    res.status(500).send("server error");
  }
};

exports.getCurrentPrice = async (req, res, next) => {
  try {
    if (!memoryStore.isDbConnected(mongoose)) {
      const currentPrice = memoryStore.getActivePrice();

      return res.json({
        currentPrice,
        message:
          currentPrice.status === "DEFAULT"
            ? "Default price is being used because no price is set yet."
            : undefined,
      });
    }

    let price = await BottlePrice.findOne({ status: "ACTIVE" }).sort({
      effective_from: -1,
    });

    if (!price) {
      price = await BottlePrice.findOne().sort({ effective_from: -1 });
    }

    if (!price) {
      return res.json({
        currentPrice: {
          price: 5.0,
          effective_from: null,
          status: "DEFAULT",
        },
        message: "Default price is being used because no price is set yet.",
      });
    }

    const { _id, createdAt, updatedAt, __v, ...cleanPrice } = price.toObject();

    res.json({
      currentPrice: {
        price: cleanPrice.price,
        effective_from: cleanPrice.effective_from,
        status: cleanPrice.status,
      },
    });
  } catch (err) {
    res.status(500).send("server error");
  }
};

exports.getPriceHistory = async (req, res, next) => {
  try {
    if (!memoryStore.isDbConnected(mongoose)) {
      return res.json(memoryStore.getPriceHistory());
    }

    const DEFAULT_PRICE = 5.0;

    const prices = await BottlePrice.find().sort({ effective_from: -1 });

    const defaultPriceRow = {
      price: DEFAULT_PRICE,
      effective_from: null,
      status: "DEFAULT",
      message: "System default price",
    };

    if (prices.length === 0) {
      return res.json([defaultPriceRow]);
    }

    const result = [
      ...prices.map((p) => {
        const { _id, createdAt, updatedAt, __v, ...clean } = p.toObject();

        return {
          ...clean,
          status: clean.status ?? "ARCHIVED",
        };
      }),
      defaultPriceRow,
    ];

    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("server error");
  }
};
