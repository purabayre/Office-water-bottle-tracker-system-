const express = require("express");
const router = express.Router();

const exportController = require("../controllers/exportController");
const { heavyLimiter } = require("../middleware/rateLimiter");

router.get("/monthly", heavyLimiter, exportController.exportMonthlyReport);

module.exports = router;
