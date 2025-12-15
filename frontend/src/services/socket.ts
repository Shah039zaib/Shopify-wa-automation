import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    if (this.socket?.connected) return;

    const token = Cookies.get('accessToken');

    this.socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');

      // Authenticate after connection
      if (token) {
        this.socket?.emit('authenticate', { token });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Setup default event listeners
    this.setupDefaultListeners();
  }

  private setupDefaultListeners() {
    // New message event
    this.socket?.on('new_message', (data) => {
      this.emit('new_message', data);
    });

    // WhatsApp events
    this.socket?.on('whatsapp_qr', (data) => {
      this.emit('whatsapp_qr', data);
    });

    this.socket?.on('whatsapp_ready', (data) => {
      this.emit('whatsapp_ready', data);
    });

    this.socket?.on('whatsapp_disconnected', (data) => {
      this.emit('whatsapp_disconnected', data);
    });

    // Typing indicators
    this.socket?.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });

    this.socket?.on('user_stopped_typing', (data) => {
      this.emit('user_stopped_typing', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a conversation room
  joinConversation(conversationId: string) {
    this.socket?.emit('join_conversation', { conversationId });
  }

  // Leave a conversation room
  leaveConversation(conversationId: string) {
    this.socket?.emit('leave_conversation', { conversationId });
  }

  // Start typing indicator
  startTyping(conversationId: string) {
    this.socket?.emit('typing_start', { conversationId });
  }

  // Stop typing indicator
  stopTyping(conversationId: string) {
    this.socket?.emit('typing_stop', { conversationId });
  }

  // Send message via socket
  sendMessage(conversationId: string, message: string, accountId: string) {
    this.socket?.emit('send_message', { conversationId, message, accountId });
  }

  // Custom event subscription
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  // Unsubscribe from event
  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  // Emit to local listeners
  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
