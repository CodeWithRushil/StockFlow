require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const productsRoutes = require("./routes/productsRoutes");
const suppliersRoutes = require("./routes/suppliersRoutes");
const salesRoutes = require("./routes/salesRoutes");
const purchaseOrdersRoutes = require("./routes/purchaseOrdersRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

/** On Render, free web services idle after ~15m; ping public URL periodically to reduce cold starts. */
const scheduleKeepAlivePing = () => {
  const url =
    process.env.KEEPALIVE_URL ||
    (process.env.RENDER_EXTERNAL_URL ? `${process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "")}/api/health` : null);
  if (!url) return;

  const cron = require("node-cron");
  cron.schedule("*/10 * * * *", async () => {
    try {
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) console.warn(`Keepalive ping: ${res.status} ${url}`);
    } catch (e) {
      console.warn("Keepalive ping failed:", e.message);
    }
  });
  console.log("Keepalive cron scheduled (every 10 min) ->", url);
};

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/purchase-orders", purchaseOrdersRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      scheduleKeepAlivePing();
    });
  })
  .catch((err) => {
    console.error("Database connection failed", err);
    process.exit(1);
  });
