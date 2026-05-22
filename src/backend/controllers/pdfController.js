const PDFDocument = require("pdfkit");
const BottleEntry = require("../models/BottleEntry");
const memoryStore = require("../services/memoryStore");
const mongoose = require("mongoose");

// helpers (same as tea controller)
const padRight = (text, length) => String(text ?? "").padEnd(length, " ");

const padLeft = (text, length) => String(text ?? "").padStart(length, " ");

exports.generateMonthlyPDF = async (req, res, next) => {
  try {
    let { month, year } = req.query;

    month = Number(month);
    year = Number(year);

    if (
      !month ||
      !year ||
      isNaN(month) ||
      isNaN(year) ||
      month < 1 ||
      month > 12
    ) {
      return res.status(400).json({
        message: "Valid month (1-12) and year required",
      });
    }

    const monthName = new Date(year, month - 1).toLocaleString("en-IN", {
      month: "long",
    });

    const entries = memoryStore.isDbConnected(mongoose)
      ? await BottleEntry.find({
          month,
          year,
        }).sort({ date: 1 })
      : memoryStore.getEntriesByMonth(month, year);

    if (!entries.length) {
      return res.status(404).json({ message: "No data found" });
    }
    const totaldays = new Set(
      entries.map((e) => new Date(e.date).toISOString().split("T")[0]),
    );

    const deliveryDays = totaldays.size;

    // ===== CALCULATIONS (same logic) =====
    let totalAmount = 0;
    let totalBottles = 0;

    for (const e of entries) {
      const qty = e.bottle_count || 0;
      const rate = e.price_per_bottle || 0;

      totalBottles += qty;
      totalAmount += qty * rate;
    }

    const currentPrice = entries[entries.length - 1]?.price_per_bottle || 0;

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=water-bill-${month}-${year}.pdf`,
    );

    doc.pipe(res);

    // ===== HEADER =====
    doc.font("Courier-Bold").fontSize(22).text("WATER BOTTLE TRACKER", {
      align: "center",
    });

    doc.moveDown(0.2);

    doc.font("Courier").fontSize(14).text(`(${monthName}-${year})`, {
      align: "center",
    });

    doc.moveDown(0.7);
    doc.text("-----------------------------------------------------------");
    doc.moveDown(1);

    // ===== INFO =====
    doc.font("Courier").fontSize(14);

    doc.text(`Total Bottles    : ${totalBottles}`);
    doc.text(`Delivery Days    : ${deliveryDays}`);
    doc.text(`Total Amount     : ${totalAmount}`);

    doc.moveDown(1);

    // ===== TABLE =====
    let index = 1;
    let rowCount = 0;
    const ROWS_PER_PAGE = 20;

    const drawTableHeader = () => {
      doc.font("Courier-Bold").fontSize(15);

      const header =
        padRight("#", 7) +
        padRight("Date", 13) +
        padRight("Per Bottle", 12) +
        padLeft("Bottles", 10) +
        padLeft("Total", 10);

      doc.text("--------------------------------------------------------");
      doc.text(header);
      doc.text("--------------------------------------------------------");

      doc.font("Courier").fontSize(14);
    };

    drawTableHeader();

    entries.forEach((e) => {
      if (rowCount === ROWS_PER_PAGE) {
        doc.addPage();
        drawTableHeader();
        rowCount = 0;
      }

      const dateObj = new Date(e.date);

      const formattedDate = dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      });

      const qty = e.bottle_count || 0;
      const rate = e.price_per_bottle || 0;
      const amount = qty * rate;

      const row =
        padRight(index, 7) +
        padRight(formattedDate, 11) +
        padLeft(rate, 14) +
        padLeft(qty, 13) +
        padLeft(amount, 11);

      doc.text(row);
      doc.moveDown(0.7);

      index++;
      rowCount++;
    });

    // ===== TOTAL =====
    doc.text("------------------------------------------------------------");

    const totalRow =
      padRight("Total", 27) +
      padLeft("", 8) +
      padLeft(totalBottles, 5) +
      padLeft(totalAmount, 9);

    doc.font("Courier-Bold").fontSize(16).text(totalRow);

    doc.text("-----------------------------------------------------");

    // ===== FOOTER =====
    doc.moveDown(1);
    doc.font("Courier").fontSize(14).text("Thank You! Visit Again", {
      align: "center",
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};
