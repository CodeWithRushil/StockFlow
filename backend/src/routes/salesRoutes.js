const express = require("express");
const { getSales, createSale, deleteSale } = require("../controllers/salesController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getSales);
router.post("/", authorize("admin", "manager", "staff"), createSale);
router.delete("/:id", authorize("admin"), deleteSale);

module.exports = router;
