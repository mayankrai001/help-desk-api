const {
  createTicketService,
  getUserTicketsService,
  getAllTicketsService,
  updateTicketStatusService,
} = require("../services/ticket");

const {
  successResponse,
  errorResponse,
} = require("../middlewares/responseHandler");

const createTicket = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (!organizationId) {
      return errorResponse(
        res,
        "Session invalid. Please log in again.",
        401,
      );
    }
    const ticket = await createTicketService(
      req.body,
      req.user.id,
      organizationId,
    );

    return successResponse(res, ticket, "Ticket created successfully", 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getMyTickets = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (!organizationId) {
      return errorResponse(
        res,
        "Session invalid. Please log in again.",
        401,
      );
    }
    const tickets = await getUserTicketsService(req.user.id, organizationId);

    return successResponse(res, tickets);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getAllTickets = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (!organizationId) {
      return errorResponse(
        res,
        "Session invalid. Please log in again.",
        401,
      );
    }
    const tickets = await getAllTicketsService(organizationId);

    return successResponse(res, tickets);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (!organizationId) {
      return errorResponse(
        res,
        "Session invalid. Please log in again.",
        401,
      );
    }
    const ticket = await updateTicketStatusService(
      req.params.id,
      req.body.status,
      organizationId,
    );

    return successResponse(res, ticket, "Ticket status updated");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus,
};
