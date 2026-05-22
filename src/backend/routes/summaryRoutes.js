const express = require("express");
const router = express.Router();

const summaryController = require("../controllers/summaryController");
const { generalLimiter } = require("../middleware/rateLimiter");

router.get("/", generalLimiter, summaryController.getMonthlySummary);

module.exports = router;
