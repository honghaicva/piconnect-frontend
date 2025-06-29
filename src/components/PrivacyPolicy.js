import React from 'react';
import { Link } from 'react-router-dom';

function PrivacyPolicy() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', lineHeight: '1.6' }}>
      {/* Nút quay về trang chủ */}
      <Link to="/">&larr; Quay lại trang chủ</Link>
      <hr/>
      <h1>Chính sách Quyền riêng tư cho PiConnect</h1>
      {/* DÁN TOÀN BỘ NỘI DUNG MẪU PRIVACY POLICY VÀO ĐÂY */}
      <p><strong>Ngày hiệu lực:</strong> 29 tháng 6 năm 2025</p>
      <p>Cảm ơn bạn đã sử dụng PiConnect...</p>
    </div>
  );
}
export default PrivacyPolicy;