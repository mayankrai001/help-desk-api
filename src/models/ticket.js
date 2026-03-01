const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    userEmail: {
      type: String,
    },

    category: {
      type: String,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
    },

    description: {
      type: String,
    },

    status: {
      type: String,
      enum: ["Received", "In Progress", "Completed"],
      default: "Received",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Ticket", ticketSchema);
