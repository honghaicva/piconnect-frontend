// file: frontend/src/App.js - PHIÊN BẢN SỬA LỖI MÀN HÌNH TRẮNG

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

// Kết nối đến Backend trên Render.com
const socket = io('https://piconnect-server.onrender.com'); 

function App() {
  const [user, setUser] = useState(null); 
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sdkReady, setSdkReady] = useState(false); // Thêm state để biết SDK đã sẵn sàng chưa

  useEffect(() => {
    // KIỂM TRA XEM PI SDK CÓ TỒN TẠI KHÔNG TRƯỚC KHI GỌI
    if (window.Pi) {
      window.Pi.init({ version: "2.0", sandbox: true });
      setSdkReady(true); // Đánh dấu SDK đã sẵn sàng
    } else {
      // Cung cấp một thông báo dự phòng nếu chạy ngoài Pi Browser
      console.warn("Pi SDK not found. Running in standard browser mode.");
      // Trong chế độ này, nút đăng nhập sẽ không hoạt động, nhưng app sẽ không bị trắng màn hình.
    }

    socket.on('receiveMessage', (data) => {
      setChatHistory((prev) => [...prev, { ...data, type: 'received' }]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const handleAuthenticate = async () => {
    // Chỉ thực hiện đăng nhập nếu SDK đã sẵn sàng
    if (!sdkReady) {
        alert("Vui lòng mở ứng dụng này trong Pi Browser để đăng nhập.");
        return;
    }

    try {
      const scopes = ['username', 'payments'];
      const piUser = await window.Pi.authenticate(scopes, () => {});
      setUser(piUser);
      console.log(`Chào mừng, ${piUser.username}`);
    } catch (err) {
      console.error("Xác thực thất bại:", err);
      alert("Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };

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
      {!user ? (
        <div className="login-container">
          <h2>Chào mừng đến PiConnect</h2>
          <p>Mạng xã hội nhắn tin dành riêng cho Pioneers</p>
          <button className="login-button" onClick={handleAuthenticate}>
            Đăng nhập với Pi
          </button>
        </div>
      ) : (
        <div className="chat-container">
          <h2>PiConnect Messenger <span className="welcome-user">(Chào, {user.username}!)</span></h2>
          <div className="chat-window">
            {/* Nội dung chat */}
          </div>
          <form className="message-form" onSubmit={sendMessage}>
            {/* Form gửi tin nhắn */}
          </form>
        </div>
      )}
    </div>
  );
}

export default App;