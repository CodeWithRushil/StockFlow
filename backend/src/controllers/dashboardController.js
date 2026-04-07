const Product = require("../models/Product");
const Sale = require("../models/Sale");
const asyncHandler = require("../utils/asyncHandler");

const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalProducts, totalSales, revenueResult, lowStockCount] = await Promise.all([
    Product.countDocuments({ deletedAt: null }),
    Sale.countDocuments(),
    Sale.aggregate([{ $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }]),
    Product.countDocuments({ $expr: { $and: [{ $lte: ["$quantity", "$threshold"] }, { $eq: ["$deletedAt", null] }] } }),
  ]);

  res.json({
    totalProducts,
    totalSales,
    totalRevenue: revenueResult[0]?.totalRevenue || 0,
    lowStockCount,
  });
});

module.exports = { getDashboardStats };
