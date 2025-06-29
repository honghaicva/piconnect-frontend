// file: frontend/src/App.js - PHIÊN BẢN HOÀN CHỈNH VÀ ỔN ĐỊNH NHẤT

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import io from 'socket.io-client';
import './App.css';

// --- COMPONENT TRANG CHAT CHÍNH ---
function ChatPage() {
  const [user, setUser] = useState(null); 
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sdkReady, setSdkReady] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Kết nối đến Backend trên Render.com
    const newSocket = io('https://piconnect-server.onrender.com');
    setSocket(newSocket);

    // Xử lý timing của Pi SDK
    const initPiSdk = () => {
      if (window.Pi) {
        console.log("Pi SDK đã sẵn sàng!");
        window.Pi.init({ version: "2.0", sandbox: true });
        setSdkReady(true);
      } else {
        console.error("Không tìm thấy Pi SDK!");
      }
    };
    window.addEventListener('load', initPiSdk);

    // Lắng nghe tin nhắn từ server
    newSocket.on('receiveMessage', (data) => {
      setChatHistory((prev) => [...prev, { ...data, type: 'received' }]);
    });

    // Dọn dẹp listener khi component bị hủy
    return () => {
      window.removeEventListener('load', initPiSdk);
      newSocket.off('receiveMessage');
      newSocket.disconnect();
    };
  }, []);

  // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---

  const handleAuthenticate = async () => {
    if (!sdkReady) {
        alert("Vui lòng mở ứng dụng này trong Pi Browser và tải lại trang để đăng nhập.");
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

  const handleLogout = () => {
    setUser(null);
  };

  const handleTip = async (messageToTip) => {
    if (!sdkReady) {
      alert("Chức năng Tip chỉ hoạt động trong Pi Browser.");
      return;
    }
    const paymentData = {
      amount: 0.1,
      memo: `Tip cho tin nhắn của ${messageToTip.author} trên PiConnect!`,
      metadata: { messageId: messageToTip.id || messageToTip.timestamp }, 
    };
    const callbacks = {
      onReadyForServerApproval: (paymentId) => {
        alert(`Sẵn sàng gửi 0.1 Pi. Ở phiên bản nâng cao, backend sẽ xác thực paymentId: ${paymentId}`);
      },
      onReadyForServerCompletion: (paymentId, txid) => {
        alert(`Đã tip thành công 0.1 Pi! Mã giao dịch (txid): ${txid}`);
      },
      onCancel: (paymentId) => {
        alert("Bạn đã hủy giao dịch tip.");
      },
      onError: (error, payment) => {
        alert("Đã có lỗi xảy ra trong quá trình tip.");
      },
    };
    try {
      await window.Pi.createPayment(paymentData, callbacks);
    } catch (err) {
      console.error('Lỗi khi gọi createPayment:', err);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && user && socket) { 
      const messageData = {
        author: user.username, 
        content: message,
        timestamp: Date.now() // Thêm timestamp để có ID tin nhắn
      };
      socket.emit('sendMessage', messageData);
      setChatHistory((prev) => [...prev, { ...messageData, type: 'sent' }]);
      setMessage('');
    }
  };

  // --- GIAO DIỆN ---
  return (
    <div className="App">
      {!user ? (
        <div className="login-container">
          <h2>Chào mừng đến PiConnect</h2>
          <p>Mạng xã hội nhắn tin dành riêng cho Pioneers</p>
          <button className="login-button" onClick={handleAuthenticate}>
            Đăng nhập với Pi
          </button>
          <div className="login-footer">
            <Link to="/terms">Điều khoản Dịch vụ</Link> | <Link to="/privacy">Chính sách Quyền riêng tư</Link>
          </div>
        </div>
      ) : (
        <div className="chat-container">
          <h2>
            PiConnect Messenger 
            <span className="welcome-user">(Chào, {user.username}!)</span>
            <button className="logout-button" onClick={handleLogout}>Đăng xuất</button>
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
                      💸 Tip 0.1 π
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


// --- COMPONENT APP CHÍNH ĐỂ XỬ LÝ ROUTING ---
// Chúng ta sẽ giữ App.js cũ có tên là ChatPage và App mới sẽ quản lý các trang
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
    </Routes>
  );
}

export default App;