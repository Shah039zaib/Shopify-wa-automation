'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { conversationsApi } from '@/services/api';
import { Conversation, Message } from '@/types';
import { cn, formatPhoneNumber, timeAgo, truncate } from '@/lib/utils';
import socketService from '@/services/socket';
import {
  Search,
  Send,
  Phone,
  MoreVertical,
  User,
  Bot,
  RefreshCw,
} from 'lucide-react';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    // Listen for new messages
    socketService.on('new_message', handleNewMessage);

    return () => {
      socketService.off('new_message', handleNewMessage);
    };
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await conversationsApi.getAll({ limit: 50 });
      setConversations(response.data.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      // Mock data for demo
      setConversations([
        {
          id: '1',
          customer_id: 'c1',
          whatsapp_account_id: 'wa1',
          status: 'active',
          messages_count: 15,
          last_message_at: new Date().toISOString(),
          customer_name: 'Ahmed Khan',
          phone_number: '923001234567',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          customer_id: 'c2',
          whatsapp_account_id: 'wa1',
          status: 'active',
          messages_count: 8,
          last_message_at: new Date(Date.now() - 3600000).toISOString(),
          customer_name: 'Sara Ali',
          phone_number: '923009876543',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await conversationsApi.getMessages(conversationId);
      setMessages(response.data.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      // Mock messages
      setMessages([
        {
          id: 'm1',
          conversation_id: conversationId,
          sender: 'customer',
          message_text: 'Assalam o alaikum, mujhe Shopify store banana hai',
          message_type: 'text',
          media_url: null,
          ai_used: null,
          read_at: null,
          timestamp: new Date(Date.now() - 600000).toISOString(),
        },
        {
          id: 'm2',
          conversation_id: conversationId,
          sender: 'bot',
          message_text: 'Walaikum assalam! Ji bilkul, hum Shopify store creation service provide karte hain. Aap konsa package dekhna chahein ge? Hamare 3 packages hain: Basic (Rs. 15,000), Standard (Rs. 25,000), aur Premium (Rs. 45,000).',
          message_type: 'text',
          media_url: null,
          ai_used: 'claude',
          read_at: null,
          timestamp: new Date(Date.now() - 540000).toISOString(),
        },
        {
          id: 'm3',
          conversation_id: conversationId,
          sender: 'customer',
          message_text: 'Standard package mein kya kya milta hai?',
          message_type: 'text',
          media_url: null,
          ai_used: null,
          read_at: null,
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
      ]);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    if (selectedConversation?.id) {
      socketService.leaveConversation(selectedConversation.id);
    }
    setSelectedConversation(conversation);
    socketService.joinConversation(conversation.id);
    fetchMessages(conversation.id);
  };

  const handleNewMessage = (data: { conversation_id: string; message: string; sender: string }) => {
    if (data.conversation_id === selectedConversation?.id) {
      const newMsg: Message = {
        id: Date.now().toString(),
        conversation_id: data.conversation_id,
        sender: data.sender as 'customer' | 'bot' | 'admin',
        message_text: data.message,
        message_type: 'text',
        media_url: null,
        ai_used: null,
        read_at: null,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      await conversationsApi.sendMessage(selectedConversation.id, newMessage);

      // Add message locally
      const newMsg: Message = {
        id: Date.now().toString(),
        conversation_id: selectedConversation.id,
        sender: 'admin',
        message_text: newMessage,
        message_type: 'text',
        media_url: null,
        ai_used: null,
        read_at: null,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.phone_number?.includes(searchTerm)
  );

  return (
    <MainLayout title="Conversations">
      <div className="flex h-[calc(100vh-8rem)] gap-6">
        {/* Conversations List */}
        <Card className="w-96 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-light"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="spinner"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={cn(
                    'flex items-center p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors',
                    selectedConversation?.id === conversation.id && 'bg-whatsapp-light/10'
                  )}
                >
                  <div className="w-12 h-12 bg-whatsapp-light/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-whatsapp-dark" />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">
                        {conversation.customer_name || 'Unknown'}
                      </p>
                      <span className="text-xs text-gray-500">
                        {conversation.last_message_at
                          ? timeAgo(conversation.last_message_at)
                          : '-'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatPhoneNumber(conversation.phone_number || '')}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge status={conversation.status} />
                      <span className="text-xs text-gray-400">
                        {conversation.messages_count} messages
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-whatsapp-light/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-whatsapp-dark" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedConversation.customer_name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatPhoneNumber(selectedConversation.phone_number || '')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex animate-slide-in',
                      message.sender === 'customer' ? 'justify-start' : 'justify-end'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[70%] px-4 py-2 rounded-lg shadow-sm',
                        message.sender === 'customer'
                          ? 'chat-bubble-customer'
                          : 'chat-bubble-bot'
                      )}
                    >
                      <p className="text-sm text-gray-900">{message.message_text}</p>
                      <div className="flex items-center justify-end mt-1 space-x-2">
                        {message.ai_used && (
                          <span className="flex items-center text-xs text-gray-400">
                            <Bot className="w-3 h-3 mr-1" />
                            {message.ai_used}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {timeAgo(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-light"
                  />
                  <Button
                    onClick={handleSendMessage}
                    isLoading={sendingMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the list to start chatting</p>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}

// Need to import MessageSquare at the top
import { MessageSquare } from 'lucide-react';
