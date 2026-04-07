const Product = require("../models/Product");
const PurchaseOrder = require("../models/PurchaseOrder");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");

const getPurchaseOrders = asyncHandler(async (req, res) => {
  const orders = await PurchaseOrder.find()
    .populate("supplierId", "companyName")
    .sort({ createdAt: -1 });
  const mapped = orders.map((o) => ({ ...o.toObject(), supplierName: o.supplierId?.companyName || "" }));
  res.json(mapped);
});

const createPurchaseOrder = asyncHandler(async (req, res) => {
  const { supplierId, items, status } = req.body;
  if (!supplierId || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("supplierId and items are required");
  }

  const normalizedItems = [];
  let totalAmount = 0;
  for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(item.productId)) {
      res.status(400);
      throw new Error(`Invalid productId: ${item.productId}`);
    }
    const product = await Product.findById(item.productId);
    if (!product) {
      res.status(400);
      throw new Error("Invalid product in purchase order");
    }
    const lineTotal = item.quantity * item.unitPrice;
    totalAmount += lineTotal;
    normalizedItems.push({
      productId: product._id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    });
  }

  const order = await PurchaseOrder.create({
    supplierId,
    items: normalizedItems,
    status: status || "Draft",
    totalAmount,
  });

  if (order.status === "Received") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: item.quantity } });
    }
  }

  const populated = await order.populate("supplierId", "companyName");
  res.status(201).json({ ...populated.toObject(), supplierName: populated.supplierId?.companyName || "" });
});

const updatePurchaseOrder = asyncHandler(async (req, res) => {
  const existing = await PurchaseOrder.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error("Purchase order not found");
  }

  const previousStatus = existing.status;
  Object.assign(existing, req.body);
  await existing.save();

  if (previousStatus !== "Received" && existing.status === "Received") {
    for (const item of existing.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: item.quantity } });
    }
  }

  const populated = await existing.populate("supplierId", "companyName");
  res.json({ ...populated.toObject(), supplierName: populated.supplierId?.companyName || "" });
});

module.exports = { getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder };
