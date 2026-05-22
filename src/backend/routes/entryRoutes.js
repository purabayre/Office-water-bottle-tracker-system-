const express = require("express");
const router = express.Router();

const entryController = require("../controllers/entryController");
const { generalLimiter } = require("../middleware/rateLimiter");

router.post("/add", generalLimiter, entryController.addEntry);
router.get("/month", generalLimiter, entryController.getMonthlyEntries);
router.put("/update/:id", generalLimiter, entryController.updateEntry);
router.delete("/delete/:id", generalLimiter, entryController.deleteEntry);

module.exports = router;
