import React from 'react';

export default function NoAccessScreen() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color:'white',
      }}
    >
      <div>
        <h2>🚫 Access Denied</h2>
        <p>You do not have permission to view this screen.</p>
      </div>
    </div>
  );
}
