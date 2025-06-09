import React from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { formatDateTime } from '../utils/formatDateTime';
import HoverText from './HoverText';
import { useI18n } from '../context/I18nProvider';
import { CONSTANTS } from '../constants/app_constants'; // or wherever your constants are defined

export default function ProjectConfirmRow({ proj, onConfirm, onRefuse }) {

    const {returnTitle}=useI18n()
    console.log('proj:',proj)

  return (
    <div
      className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 shadow-lg rounded-4 px-4 py-3"
      style={{
        background: 'linear-gradient(145deg, #1c2331, #10141d)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      id={`project-${proj.project_code}`}
    >
      <div className="flex-grow-1 text-light">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="text-info mb-0">
            <HoverText>{proj.project_name}</HoverText>
          </h6>
        </div>
        <div className="small">
          <strong>{returnTitle('fin_confirm.created_by')}  :</strong>  {proj.create_user_fio}{' '}
          <span className="normal-style">({formatDateTime(proj.create_date)})</span>
        </div>
      </div>

      <div className="d-flex gap-2 mt-2 mt-md-0">
        <button className="btn-icon-green  rounded-3" onClick={() => onConfirm(proj)}>
          <FaCheckCircle className="me-1" size={14} /> {returnTitle('fin_confirm.confirm')}
        </button>
        

        {proj.last_status?.latest_action === CONSTANTS.FINANCIER_REFUSED ? (
          <button className="btn-icon-red rounded-1 border disabled bg-dark">
            {returnTitle(`project_phase.${proj.last_status?.latest_action.toLowerCase()}`)}
          </button>
        ) : (
          <button className="btn-icon-red  rounded-3" onClick={() => onRefuse(proj)}>
            <FaTimesCircle className="me-1" size={14} /> {returnTitle('fin_confirm.refuse')}
          </button>
        )}



      </div>
    </div>
  );
}
