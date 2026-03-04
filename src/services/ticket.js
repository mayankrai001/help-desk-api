const Ticket = require("../models/ticket");
const generateTicketId = require("../utils/generateTicketId");
const { sendEmail } = require("../services/email");
const {
  ticketCreatedTemplate,
  ticketStatusUpdatedTemplate,
} = require("../utils/emailTemplate");

const createTicketService = async (payload, userId, organizationId) => {
  const ticketId = generateTicketId();

  const ticket = await Ticket.create({
    ticketId,
    userId,
    organizationId,
    userEmail: payload.userEmail,
    category: payload.category,
    priority: payload.priority,
    description: payload.description,
  });
  const html = ticketCreatedTemplate(ticket);

  try {
    await sendEmail(
      process.env.ADMIN_EMAIL,
      `New Ticket Raised - ${ticket.ticketId}`,
      html,
    );
  } catch (error) {
    console.error("Email failed:", error.message);
  }
  return ticket;
};

const getUserTicketsService = async (userId, organizationId) => {
  const tickets = await Ticket.find({ userId, organizationId }).sort({
    createdAt: -1,
  });

  return tickets;
};

const getAllTicketsService = async (organizationId) => {
  const tickets = await Ticket.find({ organizationId })
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  return tickets;
};

const updateTicketStatusService = async (ticketId, status, organizationId) => {
  const ticket = await Ticket.findOne({
    _id: ticketId,
    organizationId,
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  ticket.status = status;
  await ticket.save();

  const html = ticketStatusUpdatedTemplate(ticket);

  try {
    await sendEmail(
      ticket.userEmail,
      `Ticket Status Updated - ${ticket.ticketId}`,
      html,
    );
  } catch (error) {
    console.error("Email failed:", error.message);
  }

  return ticket.populate("userId", "name email");
};

module.exports = {
  createTicketService,
  getUserTicketsService,
  getAllTicketsService,
  updateTicketStatusService,
};
