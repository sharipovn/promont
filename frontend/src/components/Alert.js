import React from 'react';

export default function Alert({ message, type = 'info' }) {
  if (!message) return null;

  return (
    <div
      className={`alert alert-${type} text-center fw-semibold shadow`}
      role="alert"
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1055,
        width: '90%',
        maxWidth: '600px',
        borderRadius: '8px',
        backgroundColor: 'rgba(13, 202, 240)',
        color: 'white',
        border: '1px solid #0dcaf0',
        animation: 'fadeInDown 0.5s ease-in-out',
      }}
    >
      {message}
    </div>
  );
}