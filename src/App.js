// file: frontend/src/App.js - PHIÊN BẢN HOÀN CHỈNH CÓ NÚT ĐĂNG XUẤT

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('https://piconnect-server.onrender.com'); 

function App() {
  const [user, setUser] = useState(null); 
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sdkReady, setSdkReady] = useState(false);
// Thêm hàm này vào bên trong function App()

const handleTip = async (messageToTip) => {
    console.log("Chuẩn bị tip cho tin nhắn:", messageToTip);

    // Dữ liệu cho thanh toán
    const paymentData = {
        amount: 0.1, // Số Pi muốn tip
        memo: `Tip cho tin nhắn của ${messageToTip.author} trên PiConnect!`, // Ghi chú giao dịch
        metadata: { messageId: messageToTip.id }, // Dữ liệu kèm theo để xử lý trên backend
    };

    // Các hàm callback để xử lý luồng thanh toán
    const callbacks = {
        onReadyForServerApproval: (paymentId) => {
            console.log("onReadyForServerApproval", paymentId);
            // Ở phiên bản nâng cao, chúng ta sẽ gửi paymentId này về backend để phê duyệt
            // fetch(`${API_URL}/payment/approve`, { method: 'POST', body: JSON.stringify({ paymentId }) });
            alert(`Sẵn sàng gửi 0.1 Pi, paymentId: ${paymentId}. Backend sẽ cần xác thực ở bước tiếp theo.`);
        },
        onReadyForServerCompletion: (paymentId, txid) => {
            console.log("onReadyForServerCompletion", paymentId, txid);
            // Gửi thông tin về backend để ghi nhận giao dịch đã hoàn tất
            // fetch(`${API_URL}/payment/complete`, { method: 'POST', body: JSON.stringify({ paymentId, txid }) });
            alert(`Đã tip thành công 0.1 Pi! Mã giao dịch (txid): ${txid}`);
        },
        onCancel: (paymentId) => {
            console.log("onCancel", paymentId);
            alert("Bạn đã hủy giao dịch tip.");
        },
        onError: (error, payment) => {
            console.log("onError", error);
            alert("Đã có lỗi xảy ra trong quá trình tip.");
        },
    };

    try {
        // Gọi hàm tạo thanh toán của Pi SDK
        await window.Pi.createPayment(paymentData, callbacks);
    } catch (err) {
        console.error('Lỗi khi gọi createPayment:', err);
    }
};
  useEffect(() => {
    if (window.Pi) {
      window.Pi.init({ version: "2.0", sandbox: true });
      setSdkReady(true);
    } else {
      console.warn("Pi SDK not found. Running in standard browser mode.");
    }

    socket.on('receiveMessage', (data) => {
      setChatHistory((prev) => [...prev, { ...data, type: 'received' }]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const handleAuthenticate = async () => {
    if (!sdkReady) {
        alert("Vui lòng mở ứng dụng này trong Pi Browser để đăng nhập.");
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

  // --- HÀM MỚI ĐƯỢC THÊM VÀO ĐÂY ---
  const handleLogout = () => {
    setUser(null); // Đăng xuất bằng cách xóa thông tin người dùng
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
          {/* --- DÒNG H2 NÀY ĐÃ ĐƯỢC SỬA ĐỔI --- */}
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
    {/* NÚT TIP ĐƯỢC THÊM VÀO ĐÂY */}
    {/* Chỉ hiển thị nút Tip cho tin nhắn của người khác và khi đã đăng nhập */}
    {msg.type === 'received' && user && (
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