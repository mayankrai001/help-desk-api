const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const adminMiddleware = require("../middlewares/checkRole");

const {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus,
} = require("../controllers/ticket");

router.post("/", authMiddleware, createTicket);

router.get("/my", authMiddleware, getMyTickets);

router.get("/admin", authMiddleware, adminMiddleware, getAllTickets);

router.patch(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  updateTicketStatus,
);

module.exports = router;
