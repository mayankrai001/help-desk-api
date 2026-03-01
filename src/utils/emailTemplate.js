const ticketCreatedTemplate = (ticket) => {
  return `
    <h2>New Ticket Raised</h2>

    <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
    <p><strong>Category:</strong> ${ticket.category}</p>
    <p><strong>Priority:</strong> ${ticket.priority}</p>

    <p><strong>Description:</strong></p>
    <p>${ticket.description}</p>

    <p>Please check the admin dashboard.</p>
  `;
};

const ticketStatusUpdatedTemplate = (ticket) => {
  return `
    <h2>Ticket Status Updated</h2>

    <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>

    <p>Your ticket status is now:</p>

    <h3>${ticket.status}</h3>

    <p>Our team is working on your request.</p>
  `;
};

module.exports = {
  ticketCreatedTemplate,
  ticketStatusUpdatedTemplate,
};
