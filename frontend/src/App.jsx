import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import JoinRoom from './components/joinRoom/JoinRoom.jsx';
import ChatRoom from './components/chatRoom/ChatRoom.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<JoinRoom />} />
        <Route path="/chat/:roomName" element={<ChatRoom />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;