import { useState, useEffect, useRef, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface ChatbotResponse {
  message?: string;
  Message?: string; // C# PascalCase
  timestamp?: string;
  Timestamp?: string; // C# PascalCase
  isError?: boolean;
  IsError?: boolean; // C# PascalCase
}

export function useJennaChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Determine WebSocket URL based on environment
  const getWebSocketUrl = () => {
    // Check if we're in production (Railway)
    if (window.location.hostname.includes('railway.app')) {
      return 'wss://rentassured-api-production.up.railway.app/ws/chatbot';
    }
    // Local development - connect directly to backend API on port 5087
    return 'ws://localhost:5087/ws/chatbot';
  };

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);

    try {
      const ws = new WebSocket(getWebSocketUrl());

      ws.onopen = () => {
        console.log('Jenna AI WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;

        // Send welcome message from Jenna
        setMessages((prev) => [
          ...prev,
          {
            id: `welcome-${Date.now()}`,
            role: 'assistant',
            content: "Hi! I'm Jenna, your AI assistant for RentAssured. I can help you with platform features, tenant vetting, document requirements, and property management questions. How can I assist you today?",
            timestamp: new Date(),
          },
        ]);
      };

      ws.onmessage = (event) => {
        try {
          console.log('Raw WebSocket message:', event.data);
          const response: ChatbotResponse = JSON.parse(event.data);
          console.log('Parsed response:', response);

          // Handle C# PascalCase vs camelCase
          const message = response.message || response.Message || '';
          const timestampStr = response.timestamp || response.Timestamp;
          const isError = response.isError || response.IsError || false;

          // Handle timestamp - C# DateTime serializes differently
          let timestamp = new Date();
          if (timestampStr) {
            timestamp = new Date(timestampStr);
            // If invalid, use current time
            if (isNaN(timestamp.getTime())) {
              console.warn('Invalid timestamp received:', timestampStr);
              timestamp = new Date();
            }
          }

          const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: message,
            timestamp: timestamp,
            isError: isError,
          };

          setMessages((prev) => [...prev, newMessage]);
          setIsSending(false);
        } catch (error) {
          console.error('Failed to parse chatbot response:', error, 'Raw data:', event.data);
          setIsSending(false);
        }
      };

      ws.onerror = (error) => {
        console.error('Jenna AI WebSocket error:', error);
        console.error('WebSocket URL:', getWebSocketUrl());
        console.error('WebSocket readyState:', ws.readyState);
        setIsConnecting(false);
      };

      ws.onclose = () => {
        console.log('Jenna AI WebSocket disconnected');
        setIsConnected(false);
        setIsConnecting(false);
        wsRef.current = null;

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Attempting to reconnect in ${delay}ms... (attempt ${reconnectAttemptsRef.current})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    if (!content.trim()) {
      return;
    }

    // Add user message to UI
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    // Send to backend
    const request = {
      message: content.trim(),
    };

    wsRef.current.send(JSON.stringify(request));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    messages,
    isConnected,
    isConnecting,
    isSending,
    sendMessage,
    clearMessages,
    connect,
    disconnect,
  };
}
