import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import * as webSocket from 'react-use-websocket';

const useWebSocket = webSocket.default?.default ?? webSocket.default;
const { ReadyState } = webSocket;
import { apiUrl, chatSocketUrl } from '../api';

const mergeMessages = (current, incoming) => {
  const messagesById = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => messagesById.set(item.id, item));
  return [...messagesById.values()].sort(
    (first, second) => new Date(first.timestamp) - new Date(second.timestamp),
  );
};

export const useChat = (roomName, username) => {
  const [roomState, setRoomState] = useState({
    roomName,
    messages: [],
    isLoading: true,
    error: '',
  });
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const isCurrentRoom = roomState.roomName === roomName;
  const messages = useMemo(
    () => (isCurrentRoom ? roomState.messages : []),
    [isCurrentRoom, roomState.messages],
  );
  const isLoading = !isCurrentRoom || roomState.isLoading;
  const error = isCurrentRoom ? roomState.error : '';

  const { sendMessage, readyState } = useWebSocket(chatSocketUrl(roomName), {
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'error') {
          setRoomState((current) => ({
            ...current,
            roomName,
            error: data.message,
          }));
          return;
        }
        if (data.id && data.content && data.timestamp) {
          setRoomState((current) => ({
            ...current,
            roomName,
            messages: mergeMessages(
              current.roomName === roomName ? current.messages : [],
              [data],
            ),
            error: '',
          }));
        }
      } catch (parseError) {
        console.error('Unable to read a message from the chat server:', parseError);
        setRoomState((current) => ({
          ...current,
          roomName,
          error: 'A message could not be displayed. Please reconnect.',
        }));
      }
    },
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          apiUrl(`/api/rooms/${encodeURIComponent(roomName)}/messages/`),
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`Message history request failed (${response.status}).`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('The server returned an invalid message history.');
        }
        setRoomState((current) => ({
          roomName,
          messages: mergeMessages(
            current.roomName === roomName ? current.messages : [],
            data,
          ),
          isLoading: false,
          error: '',
        }));
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          console.error('Unable to load message history:', fetchError);
          setRoomState((current) => ({
            roomName,
            messages: current.roomName === roomName ? current.messages : [],
            isLoading: false,
            error: 'Could not load messages. Check your connection and try again.',
          }));
        }
      }
    };

    fetchMessages();
    return () => controller.abort();
  }, [roomName]);

  const setError = useCallback((nextError) => {
    setRoomState((current) => ({ ...current, roomName, error: nextError }));
  }, [roomName]);
  const isConnecting =
    readyState === ReadyState.CONNECTING ||
    readyState === ReadyState.UNINSTANTIATED;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendChatMessage = useCallback(() => {
    const content = message.trim();
    if (!content || content.length > 2000) return false;

    sendMessage(JSON.stringify({ message: content, username }));
    setMessage('');
    setError('');
    return true;
  }, [message, username, sendMessage, setError]);

  return {
    messages,
    message,
    setMessage,
    isLoading,
    error,
    setError,
    sendChatMessage,
    messagesEndRef,
    isConnected: readyState === ReadyState.OPEN,
    isConnecting,
    isOffline: readyState === ReadyState.CLOSED,
  };
};
