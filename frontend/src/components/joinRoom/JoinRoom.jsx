import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../../api';
import './joinRoom.scss';

const RECENT_ROOMS_KEY = 'orbit-recent-rooms';
const USERNAME_KEY = 'orbit-username';

const getRecentRooms = () => {
  try {
    const rooms = JSON.parse(localStorage.getItem(RECENT_ROOMS_KEY) || '[]');
    return Array.isArray(rooms) ? rooms.filter((room) => typeof room === 'string') : [];
  } catch {
    return [];
  }
};

const normalizeRoom = (room) =>
  room
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 40);

const JoinRoom = () => {
  const [username, setUsername] = useState(
    () => localStorage.getItem(USERNAME_KEY) || '',
  );
  const [room, setRoom] = useState('');
  const [recentRooms, setRecentRooms] = useState(getRecentRooms);
  const [publicRooms, setPublicRooms] = useState([]);
  const [roomsError, setRoomsError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const loadRooms = async () => {
      try {
        const response = await fetch(apiUrl('/api/rooms/'), {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Room list request failed (${response.status}).`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('The server returned an invalid room list.');
        setPublicRooms(data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Unable to load rooms:', error);
          setRoomsError('Rooms could not be loaded right now.');
        }
      }
    };
    loadRooms();
    return () => controller.abort();
  }, []);

  const joinRoom = (roomName) => {
    const cleanUsername = username.trim();
    const cleanRoom = normalizeRoom(roomName);
    if (!cleanUsername || !cleanRoom) return;

    localStorage.setItem(USERNAME_KEY, cleanUsername);
    const nextRooms = [
      cleanRoom,
      ...recentRooms.filter((recentRoom) => recentRoom !== cleanRoom),
    ].slice(0, 5);
    localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(nextRooms));
    setRecentRooms(nextRooms);
    navigate(`/chat/${encodeURIComponent(cleanRoom)}`, {
      state: { username: cleanUsername },
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    joinRoom(room);
  };

  return (
    <main className="home-page">
      <header className="home-nav">
        <a className="brand" href="/" aria-label="Orbit home">
          <span className="brand-mark">✳</span>
          <span>orbit</span>
        </a>
        <span className="nav-note"><span className="live-dot" /> A little closer, wherever you are</span>
      </header>

      <section className="home-layout">
        <div className="home-copy">
          <div className="eyebrow"><span /> YOUR PEOPLE. YOUR SPACE.</div>
          <h1>Good conversations<br />start <span>here.</span></h1>
          <p className="home-description">
            A calm little corner of the internet for the conversations that matter.
            Pick a room, bring your people, and make yourself at home.
          </p>
          <div className="home-highlights">
            <div className="highlight-icon">↗</div>
            <div>
              <strong>Simple by design</strong>
              <span>No accounts, no noise. Just real-time conversation.</span>
            </div>
          </div>
          <div className="home-art" aria-hidden="true">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-center">✳</div>
            <div className="art-bubble bubble-one">hey, you made it 👋</div>
            <div className="art-bubble bubble-two">this is our spot 💜</div>
            <div className="art-avatar avatar-one">J</div>
            <div className="art-avatar avatar-two">M</div>
            <div className="art-avatar avatar-three">A</div>
          </div>
        </div>

        <section className="join-panel" aria-labelledby="join-heading">
          <div className="panel-heading">
            <div className="panel-icon">✳</div>
            <div>
              <p className="panel-kicker">WELCOME TO ORBIT</p>
              <h2 id="join-heading">Find your people.</h2>
            </div>
          </div>
          <p className="panel-description">Add your name and choose a room to jump in.</p>

          <form onSubmit={handleSubmit} className="join-form">
            <label htmlFor="username">YOUR NAME</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="What should we call you?"
              maxLength={80}
              autoComplete="nickname"
              required
              autoFocus
            />
            <label htmlFor="room">ROOM NAME</label>
            <div className="room-input-wrap">
              <span>#</span>
              <input
                type="text"
                id="room"
                value={room}
                onChange={(event) => setRoom(event.target.value)}
                placeholder="e.g. weekend-plans"
                maxLength={40}
                required
              />
            </div>
            <p className="input-hint">Room names are shared — invite anyone to join.</p>
            <button type="submit" className="join-button" disabled={!username.trim() || !normalizeRoom(room)}>
              Join the conversation <span aria-hidden="true">↗</span>
            </button>
          </form>

          {(recentRooms.length > 0 || publicRooms.length > 0 || roomsError) && (
            <div className="room-discovery">
              {recentRooms.length > 0 && (
                <div className="room-group">
                  <div className="section-label">PICK UP WHERE YOU LEFT OFF</div>
                  <div className="room-chips">
                    {recentRooms.map((recentRoom) => (
                      <button key={recentRoom} type="button" onClick={() => joinRoom(recentRoom)}>
                        <span>#</span>{recentRoom}<span className="chip-arrow">↗</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {publicRooms.length > 0 && (
                <div className="room-group">
                  <div className="section-label">ROOMS AROUND ORBIT</div>
                  <div className="room-chips">
                    {publicRooms.slice(0, 6).map((publicRoom) => (
                      <button key={publicRoom.id} type="button" onClick={() => joinRoom(publicRoom.name)}>
                        <span>#</span>{publicRoom.name}<span className="chip-arrow">↗</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {roomsError && <p className="rooms-error">{roomsError}</p>}
            </div>
          )}
          <div className="privacy-note"><span>✦</span> A shared room, a fresh start. No account needed.</div>
        </section>
      </section>
      <footer className="home-footer"><span>MADE FOR THE MOMENTS IN BETWEEN</span><span>✳ &nbsp; ORBIT CHAT</span></footer>
    </main>
  );
};

export default JoinRoom;
