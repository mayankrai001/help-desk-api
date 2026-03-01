const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth");
const ticketRoutes = require("./src/routes/ticket");
const issueCategoryRoutes = require("./src/routes/issueCategory");

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/tickets", ticketRoutes);
app.use("/categories", issueCategoryRoutes);

app.get("/", (req, res) => {
  res.send("Ticketing API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
