/**
 * WebSocket (Socket.io) Handler
 * Real-time communication between server and frontend
 */

const { logger } = require('../utils/logger');

// Store connected clients
const connectedClients = new Map();

/**
 * Initialize Socket.io
 */
function initializeSocket(io) {
  logger.info('Initializing WebSocket handlers...');

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Store client
    connectedClients.set(socket.id, {
      socket,
      connectedAt: new Date(),
      userId: null,
      rooms: []
    });

    // Handle authentication
    socket.on('authenticate', async (data) => {
      try {
        const { token, userId } = data;

        // Update client info
        const clientInfo = connectedClients.get(socket.id);
        if (clientInfo) {
          clientInfo.userId = userId;
        }

        // Join user-specific room
        socket.join(`user_${userId}`);

        socket.emit('authenticated', { success: true });
        logger.info(`Client ${socket.id} authenticated as user ${userId}`);
      } catch (error) {
        logger.error('Socket authentication error:', error);
        socket.emit('authenticated', { success: false, error: error.message });
      }
    });

    // Join conversation room
    socket.on('join_conversation', (data) => {
      const { conversationId } = data;
      socket.join(`conversation_${conversationId}`);

      const clientInfo = connectedClients.get(socket.id);
      if (clientInfo) {
        clientInfo.rooms.push(`conversation_${conversationId}`);
      }

      logger.info(`Client ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (data) => {
      const { conversationId } = data;
      socket.leave(`conversation_${conversationId}`);

      const clientInfo = connectedClients.get(socket.id);
      if (clientInfo) {
        clientInfo.rooms = clientInfo.rooms.filter(r => r !== `conversation_${conversationId}`);
      }

      logger.info(`Client ${socket.id} left conversation ${conversationId}`);
    });

    // Handle typing indicator
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        conversationId,
        userId: connectedClients.get(socket.id)?.userId
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
        conversationId,
        userId: connectedClients.get(socket.id)?.userId
      });
    });

    // Handle manual message send (from dashboard)
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, message, accountId } = data;

        // Emit to conversation room
        io.to(`conversation_${conversationId}`).emit('message_sending', {
          conversationId,
          message,
          status: 'sending'
        });

        logger.info(`Manual message queued for conversation ${conversationId}`);
      } catch (error) {
        logger.error('Error handling send_message:', error);
        socket.emit('message_error', { error: error.message });
      }
    });

    // Ping/Pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Disconnect handler
    socket.on('disconnect', (reason) => {
      connectedClients.delete(socket.id);
      logger.info(`Client disconnected: ${socket.id} (${reason})`);
    });

    // Error handler
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  logger.info('WebSocket handlers initialized');
}

/**
 * Emit event to specific user
 */
function emitToUser(io, userId, event, data) {
  io.to(`user_${userId}`).emit(event, data);
}

/**
 * Emit event to conversation
 */
function emitToConversation(io, conversationId, event, data) {
  io.to(`conversation_${conversationId}`).emit(event, data);
}

/**
 * Get connected clients count
 */
function getConnectedCount() {
  return connectedClients.size;
}

/**
 * Get all connected clients
 */
function getConnectedClients() {
  const clients = [];
  connectedClients.forEach((info, id) => {
    clients.push({
      socketId: id,
      userId: info.userId,
      connectedAt: info.connectedAt,
      rooms: info.rooms
    });
  });
  return clients;
}

module.exports = {
  initializeSocket,
  emitToUser,
  emitToConversation,
  getConnectedCount,
  getConnectedClients
};
