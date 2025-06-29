// Dán mã này vào file: frontend/src/App.js

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

// Kết nối đến Backend.
const socket = io('https://piconnect-backend.onrender.com');

function App() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Yêu cầu người dùng nhập tên khi vào app
    const user = prompt("Chào mừng đến PiConnect! Vui lòng nhập tên của bạn:");
    setUsername(user || `User${Math.floor(Math.random() * 1000)}`);

    // Lắng nghe tin nhắn mới từ server
    socket.on('receiveMessage', (data) => {
      setChatHistory((prev) => [...prev, { ...data, type: 'received' }]);
    });

    // Dọn dẹp listener khi component không còn được sử dụng
    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && username) {
      const messageData = {
        author: username,
        content: message,
      };
      // Gửi tin nhắn đến server
      socket.emit('sendMessage', messageData);
      // Hiển thị tin nhắn của chính mình ngay lập tức
      setChatHistory((prev) => [...prev, { ...messageData, type: 'sent' }]);
      setMessage('');
    }
  };

  return (
    <div className="App">
      <h2>PiConnect Messenger</h2>
      <div className="chat-window">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`message-container ${msg.type}`}>
            <div className={`message ${msg.type}`}>
              {msg.type === 'received' && <p className="message-author">{msg.author}</p>}
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
      <form className="message-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
        />
        <button type="submit">Gửi</button>
      </form>
    </div>
  );
}

export default App;