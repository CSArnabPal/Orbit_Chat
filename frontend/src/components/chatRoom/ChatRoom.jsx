import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import './chatRoom.scss';

const getInitials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
};

const ChatRoom = () => {
  const { roomName = '' } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const username = state?.username || localStorage.getItem('orbit-username') || 'Guest';
  const [search, setSearch] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const {
    messages,
    message,
    setMessage,
    isLoading,
    error,
    setError,
    sendChatMessage,
    messagesEndRef,
    isConnected,
    isConnecting,
    isOffline,
  } = useChat(roomName, username);

  const visibleMessages = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? messages.filter(
          (item) =>
            item.content.toLowerCase().includes(query) ||
            item.username.toLowerCase().includes(query),
        )
      : messages;
  }, [messages, search]);

  const handleSubmit = (event) => {
    event.preventDefault();
    sendChatMessage();
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus('Invite link copied');
      window.setTimeout(() => setCopyStatus(''), 2200);
    } catch (copyError) {
      console.error('Unable to copy the invite link:', copyError);
      setCopyStatus('Copy is unavailable in this browser');
      window.setTimeout(() => setCopyStatus(''), 3000);
    }
  };

  return (
    <main className="chat-page">
      <aside className="chat-sidebar">
        <Link className="brand" to="/" aria-label="Back to Orbit home">
          <span className="brand-mark">✳</span><span>orbit</span>
        </Link>
        <div className="sidebar-rule" />
        <div className="sidebar-section-label">YOUR SPACE</div>
        <div className="sidebar-room active"><span className="sidebar-hash">#</span><span>{roomName}</span><span className="room-live-dot" /></div>
        <div className="sidebar-tip">
          <span className="tip-spark">✦</span>
          <strong>Good things happen here.</strong>
          <p>Share this room with someone who should be part of the conversation.</p>
          <button type="button" onClick={handleCopyInvite}>Copy invite link <span>↗</span></button>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-rule" />
          <div className="profile-chip">
            <div className="profile-avatar">{getInitials(username)}</div>
            <div className="profile-info"><strong>{username}</strong><span>Your Orbit profile</span></div>
            <span className="profile-status" title="You are here" />
          </div>
        </div>
      </aside>

      <section className="chat-main">
        <header className="chat-topbar">
          <div className="room-title">
            <div className="room-title-mark">#</div>
            <div><h1>{roomName}</h1><p>A little corner of Orbit</p></div>
          </div>
          <div className="chat-top-actions">
            <div className={`connection-pill ${isConnected ? 'connected' : ''}`}>
              <span />{isConnected ? 'Connected' : isOffline ? 'Offline' : 'Connecting'}
            </div>
            <button className="top-icon-button" type="button" onClick={handleCopyInvite} aria-label="Copy room invite link" title="Copy invite link">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l3-3A5 5 0 0 0 13 2.93l-1.72 1.71M14 11a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 11 21.07l1.71-1.71" /></svg>
            </button>
            <button className="leave-button" type="button" onClick={() => navigate('/')}>Leave room <span>↗</span></button>
          </div>
        </header>

        <div className="message-toolbar">
          <div className="message-count"><span /> {messages.length} {messages.length === 1 ? 'message' : 'messages'}</div>
          <label className="message-search">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            <input aria-label="Search messages" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this room" />
            {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search">×</button>}
          </label>
        </div>

        <section className="messages-area" aria-label="Messages">
          {isLoading ? (
            <div className="chat-state"><div className="loading-spinner" /><span>Getting the room ready…</span></div>
          ) : visibleMessages.length === 0 ? (
            <div className="empty-chat">
              <div className="empty-chat-icon">{search ? '⌕' : '✳'}</div>
              <h2>{search ? 'No messages found' : 'It’s quiet in here.'}</h2>
              <p>{search ? 'Try another word or search for a person.' : 'Break the ice with a hello. You never know where it might lead.'}</p>
              {search && <button type="button" onClick={() => setSearch('')}>Clear search</button>}
            </div>
          ) : (
            <div className="message-list">
              <div className="conversation-start"><span>✳</span><p>You’re in <strong>#{roomName}</strong>. Say hello to everyone.</p></div>
              {visibleMessages.map((item) => {
                const isOwnMessage = item.username === username;
                return (
                  <article key={item.id} className={`message-row ${isOwnMessage ? 'own-message' : ''}`}>
                    {!isOwnMessage && <div className="message-avatar">{getInitials(item.username)}</div>}
                    <div className="message-column">
                      <div className="message-meta">
                        {!isOwnMessage && <strong>{item.username}</strong>}
                        <time dateTime={item.timestamp}>{formatMessageTime(item.timestamp)}</time>
                      </div>
                      <div className="message-bubble">{item.content}</div>
                    </div>
                  </article>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </section>

        {error && <div className="chat-alert" role="alert"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}
        {!isConnected && (
          <div className="connection-notice">
            {isOffline
              ? 'Connection unavailable. Refresh this page to try again.'
              : isConnecting
                ? 'Connecting to the room…'
                : 'Your connection dropped. We’re trying to bring you back.'}
          </div>
        )}

        <div className="composer-wrap">
          <form className="message-composer" onSubmit={handleSubmit}>
            <textarea
              aria-label="Write a message"
              value={message}
              onChange={(event) => setMessage(event.target.value.slice(0, 2000))}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  sendChatMessage();
                }
              }}
              placeholder={`Message #${roomName}`}
              rows={1}
              maxLength={2000}
            />
            <div className="composer-footer">
              <span>Enter to send <span className="shortcut-divider">·</span> Shift + Enter for a new line</span>
              <div className="composer-actions">
                <span className={message.length > 1850 ? 'character-count near-limit' : 'character-count'}>{message.length}/2000</span>
                <button type="submit" disabled={!message.trim()} aria-label="Send message" title="Send message">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                  <span>Send</span>
                </button>
              </div>
            </div>
          </form>
          <p className="composer-footnote">A little kindness goes a long way. <span>✦</span></p>
        </div>
      </section>
      {copyStatus && <div className="copy-toast" role="status">{copyStatus}</div>}
    </main>
  );
};

export default ChatRoom;
