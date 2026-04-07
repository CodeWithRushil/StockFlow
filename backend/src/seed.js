require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const Supplier = require("./models/Supplier");
const Product = require("./models/Product");

const seed = async () => {
  try {
    await connectDB();

    const email = "admin@stockflow.com";
    if (!(await User.findOne({ email }))) {
      await User.create({
        name: "StockFlow Admin",
        email,
        password: "admin123",
        role: "admin",
      });
      console.log("Default admin user created");
    } else {
      console.log("Default admin already exists");
    }

    let supplierCount = await Supplier.countDocuments();
    if (supplierCount === 0) {
      const created = await Supplier.insertMany([
        { companyName: "TechParts Inc", contactPerson: "Alice Johnson", email: "alice@techparts.com", phone: "555-0101" },
        { companyName: "Global Supply Co", contactPerson: "Bob Williams", email: "bob@globalsupply.com", phone: "555-0102" },
        { companyName: "FastShip Ltd", contactPerson: "Carol Davis", email: "carol@fastship.com", phone: "555-0103" },
      ]);
      console.log(`Seeded ${created.length} suppliers`);

      const [s1, s2, s3] = created;
      await Product.insertMany([
        { name: "Wireless Mouse", sku: "WM-001", category: "Electronics", price: 29.99, quantity: 150, threshold: 20, supplierId: s1._id },
        { name: "USB-C Cable", sku: "UC-002", category: "Electronics", price: 12.99, quantity: 8, threshold: 30, supplierId: s1._id },
        { name: "Notebook A5", sku: "NB-003", category: "Stationery", price: 4.99, quantity: 500, threshold: 50, supplierId: s2._id },
        { name: "Ballpoint Pen Pack", sku: "BP-004", category: "Stationery", price: 6.49, quantity: 12, threshold: 40, supplierId: s2._id },
        { name: "Monitor Stand", sku: "MS-005", category: "Accessories", price: 49.99, quantity: 75, threshold: 10, supplierId: s3._id },
      ]);
      console.log("Seeded starter products");
    } else {
      console.log("Suppliers already exist — skipping catalog seed");
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
