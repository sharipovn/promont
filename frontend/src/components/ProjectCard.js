import React from 'react';
import HoverText from './HoverText';
import {
  FaProjectDiagram,
  FaMoneyBillAlt,
  FaCalendarAlt,
  FaUserTie,
  FaUserEdit,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import { TbPercentage75 } from "react-icons/tb";

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
        maxHeight : '33vh',
        fontFamily:'Exo2Variable',
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
      <h6 className="mb-3 fw-bold d-flex align-items-center gap-2 fs-sm" style={{ color: '#00f0ff' }}>
        <FaProjectDiagram  size={'1rem'}/> <HoverText>{project_name}</HoverText> {isNew && (
          <span className="badge bg-success">Yangi</span>
        )}
      </h6>

      {/* Narxi */}
      <div
          className="d-flex align-items-center border-bottom border-secondary fs-xs pb-1 mb-3 small"
          style={{ minWidth: 0 }}
        >
          <span
            className="d-flex align-items-center gap-2 text-warning"
            style={{ whiteSpace: 'nowrap' }}
          >
            <FaMoneyBillAlt size="1rem" /> Narxi:
          </span>

          <span
            className="text-end text-light ms-2"
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexGrow: 1,
            }}
          >
            <HoverText maxWidth="100%">
              {Number(total_price).toLocaleString()} UZS
            </HoverText>
          </span>
        </div>


      {/* Muddati */}
      <div
          className="d-flex justify-content-between align-items-center border-bottom border-secondary fs-xs pb-1 mb-3 small"
          style={{ minWidth: 0 }}
        >
          <span className="d-flex align-items-center gap-2 text-light">
            <FaCalendarAlt size="1rem" /> Muddati:
          </span>
          <HoverText>{start_date} — {end_date}</HoverText>
        </div>



      {/* ✅ Completion */}
      <div className="d-flex justify-content-between align-items-center  fs-xs small mb-3">
        <span className="text-light d-flex align-items-center gap-2">
        <TbPercentage75  size={'1rem'}/>Completion:
        </span>
        <div className="d-flex align-items-center gap-2">
          <span className="text-info fw-semibold">60%</span>
          <div
            className="progress"
            style={{
              width: '120px',
              height: '6px',
              backgroundColor: '#e9ecef',
            }}
          >
            <div
              className="progress-bar bg-info"
              role="progressbar"
              style={{ width: '60%' }}
              aria-valuenow="60"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      </div>
      {/* ✅ Completion */}

      {/* Moliyachi */}
      <div
        className="d-flex align-items-center border-bottom fs-xs border-success pb-1 mb-3 small"
        style={{ minWidth: 0 }}
      >
        <span className="d-flex align-items-center gap-2 text-light" style={{ whiteSpace: 'nowrap' }}>
          <FaUserTie size="1rem" />
          Moliyachi:
        </span>

        <span
          className="text-light ms-2"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexGrow: 1,
          }}
        >
          <HoverText maxWidth="100%">{financier_fio}</HoverText>
        </span>
      </div>




      {/* Yaratuvchi */}
      <div
        className="d-flex align-items-center border-bottom border-secondary fs-xs pb-1 mb-3 small"
        style={{ minWidth: 0 }}
      >
        <span className="d-flex align-items-center gap-2 text-light" style={{ whiteSpace: 'nowrap' }}>
          <FaUserEdit size="1rem" /> Created:
        </span>

        <span
          className="text-light ms-2"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexGrow: 1,
          }}
        >
          <HoverText maxWidth="100%">{create_user_fio}</HoverText>
        </span>
      </div>




      {/* Tasdiqlanmagan bo‘lsa */}
      {!financier_confirm && (
        <div className="d-flex align-items-center justify-content-between mt-3 small">
          <span className="text-warning d-flex align-items-center gap-2">
            <FaExclamationTriangle size={'1rem'}/>Tasdiqlanmagan
          </span>
          <span className="badge bg-light text-dark">
            {daysOld === 0 ? 'Bugun' : `${daysOld} kun oldin`}
          </span>
        </div>
      )}

      {/* Tasdiqlangan bo‘lsa */}
      {financier_confirm && (
        <div className="d-flex align-items-center justify-content-between mt-2 small">
          <span className="text-success d-flex align-items-center gap-2">
            <FaCheckCircle  size={'1.5rem'} /> Tasdiqlangan
          </span>
          <span className="badge bg-light text-dark">{daysOld} kun oldin</span>
        </div>
      )}
    </div>
  );
}
