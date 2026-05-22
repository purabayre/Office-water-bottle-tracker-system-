const express = require("express");
const router = express.Router();
const pdfController = require("../controllers/pdfController");
const { heavyLimiter } = require("../middleware/rateLimiter");

router.get("/monthly", heavyLimiter, pdfController.generateMonthlyPDF);

module.exports = router;
