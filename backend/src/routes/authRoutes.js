const express = require("express");
const {
  login,
  register,
  me,
  listUsers,
  createUserByAdmin,
  updateUserRole,
  deleteUser,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", protect, authorize("admin"), register);
router.post("/login", login);
router.get("/me", protect, me);
router.get("/users", protect, authorize("admin"), listUsers);
router.post("/users", protect, authorize("admin"), createUserByAdmin);
router.put("/users/:id/role", protect, authorize("admin"), updateUserRole);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
