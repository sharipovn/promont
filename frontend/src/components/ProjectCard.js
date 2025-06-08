import React,{useState} from 'react';
import HoverText from './HoverText';
import ProjectStatusLine from './ProjectStatusLine';
import ProjectTreeModal from './ProjectTreeModal';
import { useI18n } from '../context/I18nProvider';

import {
  FaUserTie,
  FaRegCircle,
  FaSpinner, 
  FaCheckCircle 
} from 'react-icons/fa';
import { RiProgress7Line } from "react-icons/ri";
import { TbPercentage75 } from "react-icons/tb";
import { FaFolderOpen } from "react-icons/fa6";
import { FaCoins } from "react-icons/fa6";
import { FaBusinessTime } from "react-icons/fa";

export default function ProjectCard({ proj }) {
  const [showModal, setShowModal] = useState(false);
  console.log('projects:',proj)

  const {returnTitle}=useI18n()

  function getWorkOrderStatusAndPercent(confirmedCount, totalCount) {
    let percent = 0;
    let statusKey = 'project_card.not_started';  // По умолчанию – не начато (default: not started)

    const confirmed = Number(confirmedCount) || 0;
    const total = Number(totalCount) || 0;

    if (total === 0 && confirmed === 0) {
      // Оба значения равны 0 (Both 0 → not started)
      percent = 0;
      statusKey = 'project_card.not_started';
    } else if (total > 0) {
      percent = Math.round((confirmed / total) * 100);

      if (percent === 100) {
        statusKey = 'project_card.completed';  // Завершено
      } else if (percent < 50) {
        statusKey = 'project_card.in_progress';  // В процессе
      } else {
        statusKey = 'project_card.nearly_done';  // Почти завершено
      }
    }

    return {
      percent,
      statusTextWo: returnTitle(statusKey),
      statusKey,
    };
  }




    const { percent, statusTextWo, statusKey } = getWorkOrderStatusAndPercent(
        proj.work_order_confirmed_count,
        proj.work_order_count
      );
    const statusIcons = {
      'project_card.not_started': <FaRegCircle size={'1rem'}  className="text-light" />,       // ⚪ Not started
      'project_card.in_progress': <FaSpinner size={'1rem'} className="text-primary" />,           // 🔄 In progress
      'project_card.nearly_done': <RiProgress7Line size={'1.5rem'} className="text-warning" />,     // ⌛ Almost done
      'project_card.completed': <FaCheckCircle size={'1rem'} className="text-success" />,         // ✅ Completed
    };



    function getDeadlineStatus(endDateStr, percent) {
      const now = new Date();
      const endDate = new Date(endDateStr);

      if (isNaN(endDate.getTime())) {
        console.log('Invalid date:', endDateStr);
        return null;
      }

      const diffDays = Math.floor((endDate - now) / (1000 * 60 * 60 * 24));
      percent = Number(percent) || 0;

      let statusKey = '';

      if (diffDays > 0 && percent < 100) {
        statusKey = 'project_card.days_left';  // Срок впереди, не завершено
      } else if (diffDays === 0 && percent < 100) {
        statusKey = 'project_card.today_is_deadline';  // Сегодня крайний срок
      } else if (diffDays === 0 && percent === 100) {
        statusKey = 'project_card.completed_on_time';  // Завершено в срок
      } else if (diffDays < 0 && percent < 100) {
        statusKey = 'project_card.not_completed_in_time';  // Не завершено в срок
      } else if (diffDays < 0 && percent === 100) {
        statusKey = 'project_card.completed_on_time';  // Завершено после срока
      } else if (diffDays > 0 && percent === 100) {
        statusKey = 'project_card.completed_early';  // Завершено досрочно
      } else {
        console.log('Unmatched condition:', endDateStr, percent);
        return null;
      }

      const rawText = returnTitle(statusKey) || '';
      const statusText = rawText.replace('{days}', diffDays);

      return {
        statusText,
        statusKey,
        diffDays,
      };
    }



    const deadlineInfo = getDeadlineStatus(proj.end_date, percent);
    
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
      <h6 className="mb-3 fw-bold d-flex align-items-center gap-2 fs-sm" style={{ color: '#00f0ff' }} onClick={() => setShowModal(true)}>
        <FaFolderOpen  size={'1rem'}/> <HoverText>{proj.project_name}</HoverText>
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
            <FaCoins size="1rem" />
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
              {Number(proj.total_price).toLocaleString()} UZS
            </HoverText>
          </span>
        </div>


      {/* Muddati */}
      <div
          className="d-flex justify-content-between align-items-center border-bottom border-secondary fs-xs pb-1 mb-3 small"
          style={{ minWidth: 0 }}
        >
          <span className="d-flex align-items-center gap-2 text-light">
            <FaBusinessTime size="1rem" />
          </span>
          <HoverText>{proj.start_date} — {proj.end_date}</HoverText>
        </div>



      {/* ✅ Completion */}
      <div className="d-flex justify-content-between align-items-center fs-xs small mb-3 flex-wrap gap-2">
          <span className="text-light d-flex align-items-center gap-2">
            <TbPercentage75 size={'1rem'} /> {returnTitle('dashboard.completion')}:
          </span>
          <div className="d-flex align-items-center gap-2 flex-grow-1">
            <span className="text-info fw-semibold">{proj.work_order_confirmed_count}/{proj.work_order_count}
              ({proj.work_order_count > 0
                ? `${percent}%`
                : '0%'})
            </span>
            <div className="progress flex-grow-1" style={{ height: '6px' }}>
              <div
                className="progress-bar bg-info"
                role="progressbar"
                style={{
                  width:
                    proj.work_order_count > 0
                      ? `${(proj.work_order_confirmed_count / proj.work_order_count) * 100}%`
                      : '0%',
                }}
                aria-valuenow={
                  proj.work_order_count > 0
                    ? Math.round((proj.work_order_confirmed_count / proj.work_order_count) * 100)
                    : 0
                }
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
          <HoverText maxWidth="100%">{proj.financier_fio}</HoverText>
        </span>
      </div>


    <ProjectStatusLine currentPhaseIndex={4} />
      {/* status  */}
        <div className="d-flex align-items-center justify-content-between mt-3 small">
          <span className="text-success d-flex align-items-center gap-1 small">
            {statusIcons[statusKey]}{statusTextWo}
          </span>
          <span className="badge bg-light text-dark small">
            {deadlineInfo.statusText}
          </span>
        </div>

      <ProjectTreeModal
        show={showModal}
        onHide={() => setShowModal(false)}
        project={proj}
      />
    </div>
    
  );
}
