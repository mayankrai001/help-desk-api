const Ticket = require("../models/ticket");
const generateTicketId = require("../utils/generateTicketId");
const { sendEmail } = require("../services/email");
const {
  ticketCreatedTemplate,
  ticketStatusUpdatedTemplate,
} = require("../utils/emailTemplate");

const createTicketService = async (payload, userId) => {
  const ticketId = generateTicketId();

  const ticket = await Ticket.create({
    ticketId,
    userId,
    category: payload.category,
    priority: payload.priority,
    description: payload.description,
  });
  const html = ticketCreatedTemplate(ticket);

  await sendEmail(
    process.env.ADMIN_EMAIL,
    `New Ticket Raised - ${ticket.ticketId}`,
    html,
  );
  return ticket;
};

const getUserTicketsService = async (userId) => {
  const tickets = await Ticket.find({ userId }).sort({ createdAt: -1 });

  return tickets;
};

const getAllTicketsService = async () => {
  const tickets = await Ticket.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  return tickets;
};

const updateTicketStatusService = async (ticketId, status) => {
  const ticket = await Ticket.findByIdAndUpdate(
    ticketId,
    { status },
    { new: true },
  );

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  const html = ticketStatusUpdatedTemplate(ticket);

  await sendEmail(
    ticket.userId.email,
    `Ticket Status Updated - ${ticket.ticketId}`,
    html,
  );

  return ticket;
};

module.exports = {
  createTicketService,
  getUserTicketsService,
  getAllTicketsService,
  updateTicketStatusService,
};
