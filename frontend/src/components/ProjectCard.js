import React from 'react';
import { FaWrench } from 'react-icons/fa';

export default function ProjectCard({ title, generated, sent, imported, diff }) {
  return (
    <div
      className="card text-white p-3"
      style={{
        background: 'linear-gradient(145deg, #2e3548, #1e2330)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        width: '100%',
        height: '20vh',
      }}
    >
      <h6 className="mb-3 fw-bold d-flex align-items-center gap-2" style={{ color: '#00f0ff' }}>
        <FaWrench /> {title}
      </h6>

      <p className="mb-1 small d-flex justify-content-between">
        <span>Shakllangan:</span>
        <span className="text-success">{generated} kWh</span>
      </p>

      <p className="mb-1 small d-flex justify-content-between">
        <span>Uzatilgan:</span>
        <span className="text-warning">{sent} kWh</span>
      </p>

      <p className="mb-1 small d-flex justify-content-between">
        <span>Yeb yuborilgan:</span>
        <span className="text-warning">{imported} kWh</span>
      </p>

      <p className="mb-0 small d-flex justify-content-between">
        <span>Farq:</span>
        <span className="text-danger">{diff} kWh</span>
      </p>
    </div>
  );
}
