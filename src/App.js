// file: frontend/src/App.js - PHIÊN BẢN NÂNG CẤP TÍCH HỢP PI SDK

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

// Kết nối đến Backend trên Render.com
const socket = io('https://piconnect-server.onrender.com'); 

function App() {
  // --- STATE MỚI ---
  // user state để lưu thông tin người dùng sau khi đăng nhập. null = chưa đăng nhập.
  const [user, setUser] = useState(null); 
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  // --- useEffect được cập nhật ---
  useEffect(() => {
    // Khởi tạo Pi SDK khi ứng dụng được tải
    // Sandbox: true có nghĩa là chúng ta đang trong môi trường thử nghiệm
    window.Pi.init({ version: "2.0", sandbox: true });

    // Lắng nghe tin nhắn từ server (không thay đổi)
    socket.on('receiveMessage', (data) => {
      setChatHistory((prev) => [...prev, { ...data, type: 'received' }]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []); // Chạy 1 lần duy nhất khi component được tải


  // --- HÀM MỚI: Xử lý Đăng nhập ---
  const handleAuthenticate = async () => {
    try {
      // Các quyền chúng ta cần từ người dùng
      const scopes = ['username', 'payments'];

      // Gọi hàm xác thực của Pi SDK
      const piUser = await window.Pi.authenticate(scopes, () => { /* Hàm xử lý thanh toán chưa hoàn tất, tạm bỏ trống */ });
      
      // Nếu thành công, lưu thông tin người dùng vào state
      setUser(piUser);
      console.log(`Chào mừng, ${piUser.username}`);

    } catch (err) {
      // Xử lý nếu người dùng hủy hoặc có lỗi
      console.error("Xác thực thất bại:", err);
      alert("Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };


  // --- HÀM sendMessage được cập nhật ---
  const sendMessage = (e) => {
    e.preventDefault();
    // Chỉ gửi tin nhắn nếu đã đăng nhập (user không còn là null) và có nội dung
    if (message.trim() && user) { 
      const messageData = {
        // Lấy tên tác giả trực tiếp từ đối tượng user đã đăng nhập
        author: user.username, 
        content: message,
      };
      socket.emit('sendMessage', messageData);
      setChatHistory((prev) => [...prev, { ...messageData, type: 'sent' }]);
      setMessage('');
    }
  };


  // --- GIAO DIỆN (JSX) được cập nhật ---
  return (
    <div className="App">
      {/* Đây là Conditional Rendering:
          - Nếu user là null (chưa đăng nhập), hiển thị màn hình đăng nhập.
          - Nếu user đã có thông tin (đã đăng nhập), hiển thị màn hình chat.
      */}
      {!user ? (
        // Màn hình khi chưa đăng nhập
        <div className="login-container">
          <h2>Chào mừng đến PiConnect</h2>
          <p>Mạng xã hội nhắn tin dành riêng cho Pioneers</p>
          <button className="login-button" onClick={handleAuthenticate}>
            Đăng nhập với Pi
          </button>
        </div>
      ) : (
        // Màn hình khi đã đăng nhập
        <div className="chat-container">
          <h2>PiConnect Messenger <span className="welcome-user">(Chào, {user.username}!)</span></h2>
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
      )}
    </div>
  );
}

export default App;