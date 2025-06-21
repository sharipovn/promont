import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '../components/Sidebar';

export default function WorkWithStaffScreen() {

    

  return (
    <div className="container-fluid">
      <div className="d-flex" style={{ minHeight: '95vh' }}>
        <div style={{ width: '18%' }}>
          <Sidebar />
        </div>
        <div style={{ width: '82%', padding: '1rem' }}>
          <h5 className="text-info">Staff Management Placeholder</h5>
        </div>
      </div>
    </div>
  );
}
