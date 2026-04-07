const express = require("express");
const {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/suppliersController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getSuppliers);
router.post("/", authorize("admin", "manager"), createSupplier);
router.put("/:id", authorize("admin", "manager"), updateSupplier);
router.delete("/:id", authorize("admin"), deleteSupplier);

module.exports = router;
