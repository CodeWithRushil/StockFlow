const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");

const mapProduct = (p) => {
  const supplier = p.supplierId;
  const supplierId = supplier && typeof supplier === "object" ? supplier._id : supplier;
  return {
    ...p.toObject(),
    supplierId: supplierId ? String(supplierId) : "",
    supplierName: supplier && typeof supplier === "object" ? supplier.companyName || "" : "",
  };
};

const getProducts = asyncHandler(async (req, res) => {
  const { includeDeleted, category, search, lowStock } = req.query;
  const filter = {};

  if (includeDeleted !== "true") filter.deletedAt = null;
  if (category) filter.category = category;
  if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { sku: { $regex: search, $options: "i" } }];
  if (lowStock === "true") filter.$expr = { $lte: ["$quantity", "$threshold"] };

  const products = await Product.find(filter).populate("supplierId", "companyName").sort({ createdAt: -1 });
  const mapped = products.map(mapProduct);
  res.json(mapped);
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  const populated = await product.populate("supplierId", "companyName");
  res.status(201).json(mapProduct(populated));
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(
    "supplierId",
    "companyName"
  );
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(mapProduct(product));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  product.deletedAt = new Date();
  await product.save();
  res.json({ message: "Product soft-deleted" });
});

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
