const configuredApiUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = (
  configuredApiUrl ||
  (import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : 'https://orbit-chat-j0xx.onrender.com') // <-- Fallback directly to your live backend!
).replace(/\/+$/, '');

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export const chatSocketUrl = (roomName) => {
  const url = new URL(
    `/ws/chat/${encodeURIComponent(roomName)}/`,
    API_BASE_URL,
  );

  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
};