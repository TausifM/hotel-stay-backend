let ioInstance = null;

export function initRealtime(io) {
  ioInstance = io;
  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
    // client should join tenant room after auth
    socket.on('join-tenant', (tenantId) => {
      socket.join(`tenant:${tenantId}`);
    });
    socket.on('disconnect', () => console.log('socket disconnected', socket.id));
  });
}

export function ioEmit(tenantId, event, payload) {
  if (!ioInstance) return;
  ioInstance.to(`tenant:${tenantId}`).emit(event, payload);
}
