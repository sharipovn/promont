import React, { useEffect, useState } from 'react';
import './ProjectStatusLine.css';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import {formatDateTime} from '../utils/formatDateTime'
import { useI18n } from '../context/I18nProvider';



export default function ProjectStatusLine({ project }) {
  
  const {returnTitle}=useI18n()
  const [phases, setPhases] = useState([]);
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuth();


  useEffect(() => {
    const axiosInstance = createAxiosInstance(navigate, setUser, setAccessToken);
    const fetchPhases = async () => {
      try {
        const res = await axiosInstance.get(`/projects/${project.project_code}/phase-progress/`);
        setPhases(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch phase progress', err);
      }
    };

    if (project?.project_code) {
      fetchPhases();
    }
  }, [project, navigate, setUser, setAccessToken]);

  const phaseMap = {};
  for (const p of phases) {
    phaseMap[p.phase_key] = p;
  }

  const latestOrder = phases.length > 0 ? Math.max(...phases.map(p => p.order || 0)) : -1;

const PHASES = [
  { key: 'CREATED', name: 'status_line.fin_dir_created_project', color: '#FF7F0E', order: 1 }, // Orange
  { key: 'SENT_TO_FINANCIER', name: 'status_line.sent_to_financier', color: '#FFD700', order: 2 }, // Gold
  { key: 'FINANCIER_CONFIRMED', name: 'status_line.financier_confirmed_created_project', color: '#1E90FF', order: 3 }, // DodgerBlue
  { key: 'FIN_PARTS_CREATED', name: 'status_line.financial_parts_created', color: '#00CED1', order: 4 }, // DarkTurquoise
  { key: 'SENT_TO_TECH_DIR', name: 'status_line.sent_to_tech_dir', color: '#00FA9A', order: 5 }, // MediumSpringGreen
  { key: 'TECH_DIR_CONFIRMED_AND_ATTACHED_GIP', name: 'status_line.tech_dir_confirmed_and_attached_gip', color: '#32CD32', order: 6 }, // LimeGreen
  { key: 'SENT_TO_GIP', name: 'status_line.sent_to_gip', color: '#BA55D3', order: 7 }, // MediumOrchid
  { key: 'GIP_CONFIRMED', name: 'status_line.gip_confirmed', color: '#FF69B4', order: 8 }, // HotPink
  { key: 'GIP_CREATED_TECHNICAL_PARTS', name: 'status_line.technical_parts_created', color: '#A0522D', order: 9 }, // Sienna
  { key: 'WORK_ORDER_CREATED', name: 'status_line.work_orders_created', color: '#4682B4', order: 10 }, // SteelBlue
];


  return (
    <div className="status-line-wrapper">
      <div className="status-line">
        {PHASES.map((phase, index) => {
          const action = phaseMap[phase.key];
          const isPassed = phase.order < latestOrder;
          const isCurrent = phase.order === latestOrder;

          const showTooltip = isPassed || isCurrent;

          const bgColor = isPassed || isCurrent ? phase.color : '#ffffff';
          const borderColor = isCurrent ? 'white' : (isPassed ? phase.color : '#ccc'); // cyan border for current
          const borderWidth = isCurrent ? '3px' : '2px';

          return (
            <React.Fragment key={phase.key}>
              <div className={`status-dot ${isCurrent ? 'current' : ''}`}
                style={{
                  backgroundColor: bgColor,
                      borderColor,
                      borderWidth,
                }}
              >
                {showTooltip && (
                  <span className="tooltip rounded-2 p-2" style={{ fontSize: '0.8em'}}>
                    <strong>{returnTitle(`${phase.name}`)}</strong><br />
                    <span style={{ color: '#ccc' }}>
                      {formatDateTime(action?.performed_at)}
                    </span>
                  </span>
                )}
              </div>

              {index < PHASES.length - 1 && (
                <div
                  className={`connector ${isPassed ? 'passed' : ''}`}
                  style={{ color: phase.color }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

    </div>
  );
}
