import React, { createContext, useContext, useRef, useState, useEffect, ReactNode, useCallback } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/hooks/use-toast';

interface WebSocketContextState {
  // Transcript WebSocket
  transcriptSocket: WebSocket | null;
  transcriptConnected: boolean;
  connectTranscriptSocket: (roomId: string) => void;
  disconnectTranscriptSocket: () => void;
  
  // Notes WebSocket
  notesSocket: WebSocket | null;
  notesConnected: boolean;
  connectNotesSocket: (roomId: string) => void;
  disconnectNotesSocket: () => void;
  sendNoteUpdate: (content: string) => void;
}

const WebSocketContext = createContext<WebSocketContextState | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Transcript WebSocket state
  const transcriptSocketRef = useRef<WebSocket | null>(null);
  const [transcriptConnected, setTranscriptConnected] = useState(false);
  
  // Notes WebSocket state
  const notesSocketRef = useRef<WebSocket | null>(null);
  const [notesConnected, setNotesConnected] = useState(false);
  
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  // Reconnection state
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notesReconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const notesReconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 2000; // 2 seconds

  // Helper function to get WebSocket state as a string
  const getWebSocketStateString = (ws: WebSocket | null): string => {
    if (!ws) return 'null';
    
    switch (ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return `UNKNOWN (${ws.readyState})`;
    }
  };

  // Connect to transcript WebSocket - memoized with useCallback
  const connectTranscriptSocket = useCallback((roomId: string) => {
    if (!roomId) return;
    
    // Store the room ID for reconnections
    setCurrentRoomId(roomId);
    
    // Don't reconnect if already connected to the same room
    if (transcriptSocketRef.current?.readyState === WebSocket.OPEN) {
      console.log(`Already connected to transcript service for room ${roomId}`);
      return;
    }
    
    try {
      const wsUrl = API_ENDPOINTS.TRANSCRIPT_WS(roomId);
      console.log(`Attempting to connect to transcript service at: ${wsUrl}`);
      
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log(`Connected to transcript sharing service for room ${roomId}`);
        setTranscriptConnected(true);
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
        
        // Send a ping message to verify the connection is working
        try {
          socket.send(JSON.stringify({ type: 'ping' }));
          console.log('Sent ping message to transcript service');
        } catch (pingError) {
          console.error('Error sending ping message:', pingError);
        }
      };
      
      socket.onerror = (error) => {
        console.error('Transcript WebSocket error:', error);
        setTranscriptConnected(false);
        toast({
          title: 'Connection Error',
          description: 'Error connecting to transcript service. Retrying...',
          variant: 'destructive'
        });
      };
      
      socket.onclose = (event) => {
        console.log(`Transcript WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
        setTranscriptConnected(false);
        
        // Attempt to reconnect unless this was a clean close
        if (reconnectAttemptsRef.current < maxReconnectAttempts && event.code !== 1000 && currentRoomId) {
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts}) in ${reconnectDelay}ms...`);
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectTranscriptSocket(currentRoomId);
          }, reconnectDelay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error('Maximum reconnection attempts reached. Giving up.');
          toast({
            title: 'Connection Failed',
            description: 'Could not connect to transcript service after multiple attempts.',
            variant: 'destructive'
          });
        }
      };
      
      transcriptSocketRef.current = socket;
    } catch (error) {
      console.error('Error connecting to transcript service:', error);
      setTranscriptConnected(false);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to transcript service.',
        variant: 'destructive'
      });
    }
  }, [toast, currentRoomId]); // Depends on toast and currentRoomId

  // Connect to notes WebSocket - memoized with useCallback
  const connectNotesSocket = useCallback((roomId: string) => {
    if (!roomId) return;
    
    // Store the room ID for reconnections
    setCurrentRoomId(roomId);
    
    // Don't reconnect if already connected to the same room
    if (notesSocketRef.current?.readyState === WebSocket.OPEN) {
      console.log(`Already connected to notes service for room ${roomId}`);
      return;
    }
    
    try {
      const wsUrl = API_ENDPOINTS.NOTES_WS(roomId);
      console.log(`Attempting to connect to notes service at: ${wsUrl}`);
      
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log(`Connected to notes sharing service for room ${roomId}`);
        setNotesConnected(true);
        notesReconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
        
        // Send a ping message to verify the connection is working
        try {
          socket.send(JSON.stringify({ type: 'ping' }));
          console.log('Sent ping message to notes service');
        } catch (pingError) {
          console.error('Error sending ping message:', pingError);
        }
      };
      
      socket.onerror = (error) => {
        console.error('Notes WebSocket error:', error);
        setNotesConnected(false);
        toast({
          title: 'Connection Error',
          description: 'Error connecting to notes service. Retrying...',
          variant: 'destructive'
        });
      };
      
      socket.onclose = (event) => {
        console.log(`Notes WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
        setNotesConnected(false);
        
        // Attempt to reconnect unless this was a clean close
        if (notesReconnectAttemptsRef.current < maxReconnectAttempts && event.code !== 1000 && currentRoomId) {
          console.log(`Attempting to reconnect notes (${notesReconnectAttemptsRef.current + 1}/${maxReconnectAttempts}) in ${reconnectDelay}ms...`);
          
          if (notesReconnectTimeoutRef.current) {
            clearTimeout(notesReconnectTimeoutRef.current);
          }
          
          notesReconnectTimeoutRef.current = setTimeout(() => {
            notesReconnectAttemptsRef.current++;
            connectNotesSocket(currentRoomId);
          }, reconnectDelay);
        } else if (notesReconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error('Maximum reconnection attempts reached for notes. Giving up.');
          toast({
            title: 'Connection Failed',
            description: 'Could not connect to notes service after multiple attempts.',
            variant: 'destructive'
          });
        }
      };
      
      notesSocketRef.current = socket;
    } catch (error) {
      console.error('Error connecting to notes service:', error);
      setNotesConnected(false);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to notes service.',
        variant: 'destructive'
      });
    }
  }, [toast, currentRoomId]);

  // Disconnect from transcript WebSocket - memoized with useCallback
  const disconnectTranscriptSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (transcriptSocketRef.current) {
      console.log('Closing transcript WebSocket connection');
      transcriptSocketRef.current.close(1000, 'Intentional disconnect');
      transcriptSocketRef.current = null;
      setTranscriptConnected(false);
    }
  }, []);

  // Disconnect from notes WebSocket - memoized with useCallback
  const disconnectNotesSocket = useCallback(() => {
    if (notesReconnectTimeoutRef.current) {
      clearTimeout(notesReconnectTimeoutRef.current);
      notesReconnectTimeoutRef.current = null;
    }
    
    if (notesSocketRef.current) {
      console.log('Closing notes WebSocket connection');
      notesSocketRef.current.close(1000, 'Intentional disconnect');
      notesSocketRef.current = null;
      setNotesConnected(false);
    }
  }, []);

  // Send note update through WebSocket
  const sendNoteUpdate = useCallback((content: string) => {
    if (notesSocketRef.current?.readyState === WebSocket.OPEN) {
      try {
        notesSocketRef.current.send(JSON.stringify({
          type: 'update',
          content,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error sending note update:', error);
      }
    } else {
      console.warn('Notes WebSocket not connected. Cannot send update.');
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnectTranscriptSocket();
      disconnectNotesSocket();
      setCurrentRoomId(null);
    };
  }, [disconnectTranscriptSocket, disconnectNotesSocket]);

  // Create a context value that directly exposes the refs
  const contextValue = {
    transcriptSocket: transcriptSocketRef.current,
    transcriptConnected,
    connectTranscriptSocket,
    disconnectTranscriptSocket,
    
    notesSocket: notesSocketRef.current,
    notesConnected,
    connectNotesSocket,
    disconnectNotesSocket,
    sendNoteUpdate
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}; 