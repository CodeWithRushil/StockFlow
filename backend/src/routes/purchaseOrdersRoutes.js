const express = require("express");
const {
  getPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
} = require("../controllers/purchaseOrdersController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getPurchaseOrders);
router.post("/", authorize("admin", "manager"), createPurchaseOrder);
router.put("/:id", authorize("admin", "manager"), updatePurchaseOrder);

module.exports = router;
