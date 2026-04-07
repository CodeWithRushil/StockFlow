const express = require("express");
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productsController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getProducts);
router.post("/", authorize("admin", "manager"), createProduct);
router.put("/:id", authorize("admin", "manager"), updateProduct);
router.delete("/:id", authorize("admin"), deleteProduct);

module.exports = router;
