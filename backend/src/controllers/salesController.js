const Product = require("../models/Product");
const Sale = require("../models/Sale");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");

const buildSaleId = async () => {
  const count = await Sale.countDocuments();
  return `INV-${String(count + 1).padStart(5, "0")}`;
};

const getSales = asyncHandler(async (req, res) => {
  const sales = await Sale.find()
    .populate("soldBy", "name")
    .sort({ createdAt: -1 });
  const mapped = sales.map((s) => ({ ...s.toObject(), soldByName: s.soldBy?.name || "" }));
  res.json(mapped);
});

const deleteSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id);
  if (!sale) {
    res.status(404);
    throw new Error("Sale not found");
  }

  // Restore stock quantities before removing the sale.
  for (const item of sale.items) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: item.quantity } });
  }

  await sale.deleteOne();
  res.json({ message: "Sale deleted and stock restored" });
});

const createSale = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("items is required");
  }

  const processedItems = [];
  let totalAmount = 0;

  for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(item.productId)) {
      res.status(400);
      throw new Error(`Invalid productId: ${item.productId}`);
    }
    const product = await Product.findById(item.productId);
    if (!product || product.deletedAt) {
      res.status(400);
      throw new Error("Invalid product in sale items");
    }
    if (product.quantity < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    product.quantity -= item.quantity;
    await product.save();

    const unitPrice = item.unitPrice ?? product.price;
    const total = unitPrice * item.quantity;
    totalAmount += total;
    processedItems.push({
      productId: product._id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice,
      total,
    });
  }

  const sale = await Sale.create({
    saleId: await buildSaleId(),
    items: processedItems,
    totalAmount,
    soldBy: req.user._id,
  });
  const populated = await sale.populate("soldBy", "name");
  res.status(201).json({ ...populated.toObject(), soldByName: populated.soldBy?.name || "" });
});

module.exports = { getSales, createSale, deleteSale };
