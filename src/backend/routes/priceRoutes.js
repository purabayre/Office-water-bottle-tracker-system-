const express = require("express");
const router = express.Router();

const priceController = require("../controllers/priceController");
const { generalLimiter } = require("../middleware/rateLimiter");

router.post("/set", generalLimiter, priceController.setPrice);
router.get("/current", generalLimiter, priceController.getCurrentPrice);
router.get("/history", generalLimiter, priceController.getPriceHistory);

module.exports = router;
