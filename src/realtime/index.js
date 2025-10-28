let io = null;

/**
 * Initialize Realtime with Socket.io
 */
export function initRealtime(serverIO) {
  io = serverIO;

  io.on("connection", (socket) => {
    console.log("👤 New client connected", socket.id);

    // When a staff member joins a hotel's realtime room
    socket.on("joinHotelRoom", (hotelId) => {
      socket.join(`hotel:${hotelId}`);
      console.log(`🏨 Socket ${socket.id} joined room hotel:${hotelId}`);
    });

    // Allow clients to leave
    socket.on("leaveHotelRoom", (hotelId) => {
      socket.leave(`hotel:${hotelId}`);
      console.log(`🚪 Socket ${socket.id} left room hotel:${hotelId}`);
    });

    // Allow Staff to connect to their hotel room
    socket.on("joinHotel", ({ hotelId, role }) => {
      socket.join(`hotel:${hotelId}`);
      socket.join(`hotel:${hotelId}:${role}`);
      console.log(`👤 User joined hotel ${hotelId} as ${role}`);
    });
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected", socket.id);
    });
  });
}

/**
 * Broadcast helpers
 */
export function broadcastServiceRequest(hotelId, request) {
  if (!io) return;
  io.to(`hotel:${hotelId}`).emit("serviceRequest:new", {
    title: `🛎️ New ${request.type}`,
    message: `${request.message}`,
    customerId: request.customerId,
    createdAt: request.createdAt,
  });
}

export function broadcastBookingUpdate(hotelId, booking) {
  if (!io) return;
  io.to(`hotel:${hotelId}`).emit("booking:update", booking);
}

export function broadcastNotification(hotelId, notification) {
  if (!io) return;
  const msg = {
    type: notification.type || "General",
    title: notification.title || "🔔 Notification",
    message: notification.message || "New event received.",
    meta: notification.meta || {},
    timestamp: new Date().toISOString(),
  };

  // Determine target roles by type
  const roleTargets = [];
  switch (notification.type) {
    case "ServiceRequest":
      if (notification.meta?.type === "Room Cleaning") roleTargets.push("housekeeping", "manager");
      else if (notification.meta?.type === "Maintenance") roleTargets.push("staff", "manager");
      else roleTargets.push("staff", "manager", "reception");
      break;

    case "BookingUpdate":
    case "CheckIn":
    case "CheckOut":
      roleTargets.push("reception", "manager", 'hotelOwner');
      break;

    case "Payment":
      roleTargets.push("manager", "accountant", 'hotelOwner');
      break;

    default:
      roleTargets.push("manager", "staff", "reception", 'hotelOwner');
      break;
  }

  // Send to base hotel channel (for global dashboard views)
  io.to(`hotel:${hotelId}`).emit("notification:new", msg);

  // Send to each specific role channel
  for (const role of roleTargets) {
    io.to(`hotel:${hotelId}:${role}`).emit("notification:new", msg);
  }
}
