import React from 'react';
import {
  FaProjectDiagram,
  FaMoneyBillAlt,
  FaCalendarAlt,
  FaUserTie,
  FaUserEdit,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';

export default function ProjectCard({ proj }) {
  const {
    project_name,
    total_price,
    start_date,
    end_date,
    financier_fio,
    create_user_fio,
    financier_confirm,
    gip_confirm,
    create_date
  } = proj;

  const isNew = !financier_confirm;
  const daysOld = Math.floor((new Date() - new Date(create_date)) / (1000 * 60 * 60 * 24));

  return (
    <div
      className="p-3 text-white"
      style={{
        background: 'linear-gradient(145deg, #2e3548, #1e2330)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '1rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        height: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,255,255,0.3)';
        e.currentTarget.style.background = 'linear-gradient(145deg, #2b3d5a, #1a2233)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
        e.currentTarget.style.background = 'linear-gradient(145deg, #2e3548, #1e2330)';
      }}
    >
      {/* Sarlavha */}
      <h6 className="mb-2 fw-bold d-flex align-items-center gap-2" style={{ color: '#00f0ff' }}>
        <FaProjectDiagram /> {project_name} {isNew && (
          <span className="badge bg-success">Yangi</span>
        )}
      </h6>

      {/* Narxi */}
      <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-1 mb-1 small">
        <span className="d-flex align-items-center gap-2 text-warning">
          <FaMoneyBillAlt /> Narxi:
        </span>
        <span className="text-end">{Number(total_price).toLocaleString()} UZS</span>
      </div>

      {/* Muddati */}
      <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-1 mb-1 small">
        <span className="d-flex align-items-center gap-2 text-light" style={{ fontFamily: 'consolas' }}>
          <FaCalendarAlt /> Muddati:
        </span>
        <span className="text-end text-light" style={{ fontFamily: 'consolas' }}>
          {start_date} — {end_date}
        </span>
      </div>

      {/* Moliyachi */}
      <div className="d-flex justify-content-between align-items-center border-bottom border-success pb-1 mb-1 small">
        <span className="d-flex align-items-center gap-2 text-light">
          <FaUserTie /> Moliyachi:
        </span>
        <span className="text-end text-light">{financier_fio}</span>
      </div>

      {/* Yaratuvchi */}
      <div
        title={`Created by: ${create_user_fio}`}
        className="small text-secondary d-flex align-items-center gap-2"
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: 400,
          fontSize: '0.85rem',
          marginBottom: '6px'
        }}
      >
        <FaUserEdit className="text-secondary" /> {create_user_fio}
      </div>

      {/* Tasdiqlanmagan bo‘lsa */}
      {!financier_confirm && (
        <div className="d-flex align-items-center justify-content-between mt-2 small">
          <span className="text-warning d-flex align-items-center gap-2">
            <FaExclamationTriangle /> Moliyachi hali tasdiqlamagan
          </span>
          <span className="badge bg-light text-dark">{daysOld} kun oldin</span>
        </div>
      )}

      {/* Tasdiqlangan bo‘lsa */}
      {financier_confirm && (
        <div className="d-flex align-items-center justify-content-between mt-2 small">
          <span className="text-success d-flex align-items-center gap-2">
            <FaCheckCircle /> Moliyachi tasdiqladi
          </span>
          <span className="badge bg-light text-dark">{daysOld} kun oldin</span>
        </div>
      )}
    </div>
  );
}
