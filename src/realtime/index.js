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
  io.to(`hotel:${hotelId}`).emit("serviceRequest:new", request);
}

export function broadcastBookingUpdate(hotelId, booking) {
  if (!io) return;
  io.to(`hotel:${hotelId}`).emit("booking:update", booking);
}

export function broadcastNotification(hotelId, notification) {
  if (!io) return;
  io.to(`hotel:${hotelId}`).emit("notification:new", notification);
}
