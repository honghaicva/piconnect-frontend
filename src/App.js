// file: frontend/src/App.js - PHIÊN BẢN SỬA LỖI PI SDK TIMING

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('https://piconnect-server.onrender.com'); 

function App() {
  const [user, setUser] = useState(null); 
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    // --- LOGIC MỚI ĐỂ XỬ LÝ TIMING ---
    const initPiSdk = () => {
      if (window.Pi) {
        console.log("Pi SDK đã sẵn sàng!");
        window.Pi.init({ version: "2.0", sandbox: true });
      } else {
        console.error("Không tìm thấy Pi SDK!");
      }
    };

    // Đợi cho toàn bộ trang được tải xong rồi mới thử khởi tạo SDK
    // Điều này cho Pi Browser thêm thời gian.
    window.addEventListener('load', initPiSdk);

    // --- Phần còn lại giữ nguyên ---
    socket.on('receiveMessage', (data) => {
      setChatHistory((prev) => [...prev, { ...data, type: 'received' }]);
    });

    // Dọn dẹp listener khi component bị hủy
    return () => {
      window.removeEventListener('load', initPiSdk);
      socket.off('receiveMessage');
    };
  }, []);

  const handleAuthenticate = async () => {
    // Thêm một lần kiểm tra nữa ngay trước khi đăng nhập để đảm bảo
    if (!window.Pi) {
        alert("Không thể thực hiện. Vui lòng chắc chắn bạn đang dùng Pi Browser và đã tải lại trang.");
        return;
    }

    try {
      const scopes = ['username', 'payments'];
      const piUser = await window.Pi.authenticate(scopes, () => {});
      setUser(piUser);
    } catch (err) {
      console.error("Xác thực thất bại:", err);
    }
  };

  // ... hàm sendMessage và phần return JSX giữ nguyên như cũ ...
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && user) { 
      const messageData = {
        author: user.username, 
        content: message,
      };
      socket.emit('sendMessage', messageData);
      setChatHistory((prev) => [...prev, { ...messageData, type: 'sent' }]);
      setMessage('');
    }
  };

  return (
    <div className="App">
      {/* Toàn bộ phần JSX trong return() giữ nguyên, không thay đổi */}
      {!user ? (
        <div className="login-container">
          <h2>Chào mừng đến PiConnect</h2>
          <p>Mạng xã hội nhắn tin dành riêng cho Pioneers</p>
          <button className="login-button" onClick={handleAuthenticate}>
            Đăng nhập với Pi
          </button>
          <div className="login-footer">
            <a href="/terms">Điều khoản Dịch vụ</a> | <a href="/privacy">Chính sách Quyền riêng tư</a>
          </div>
        </div>
      ) : (
        <div className="chat-container">
          <h2>
            PiConnect Messenger 
            <span className="welcome-user">(Chào, {user.username}!)</span>
            <button className="logout-button" onClick={() => setUser(null)}>Đăng xuất</button>
          </h2>
          <div className="chat-window">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`message-container ${msg.type}`}>
                <div className={`message ${msg.type}`}>
                  <div className="message-content">
                      {msg.type === 'received' && <p className="message-author">{msg.author}</p>}
                      <p>{msg.content}</p>
                  </div>
                  {msg.type === 'received' && (
                      <button className="tip-button" onClick={() => handleTip(msg)}>
                          💸 Tip 1 π
                      </button>
                  )}
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
      )}
    </div>
  );
}

export default App;