import React, { useState } from 'react';
import { LuCircleCheckBig } from "react-icons/lu";
import HoverText from './HoverText';
import { formatDateTime } from '../utils/formatDateTime';
import { useI18n } from '../context/I18nProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { VscGitPullRequestCreate } from "react-icons/vsc";
import GipFinPartsModal from './GipFinPartsModal';
import {Badge} from 'react-bootstrap';





export default function CreateTechnicalRow({ proj, onUpdated }) {
  const { returnTitle } = useI18n();
  const [loading, setLoading] = useState(false);
  const [showPartsModal, setShowPartsModal] = useState(false);
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuth();
  const axiosInstance = createAxiosInstance(navigate, setUser, setAccessToken);

  const handleConfirm = () => {
    setLoading(true);
    axiosInstance
      .post('/gip-projects/confirm-gip/', { project_code: proj.project_code })
      .then(() => onUpdated())
      .catch(() => alert('❌ Failed to confirm project'))
      .finally(() => setLoading(false));
  };


  return (
    <div className="financial-row d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
      {/* Info */}
      <div className="flex-grow-1">
        <h6 className="text-warning mb-1 fs-6"><HoverText>{proj.project_name}</HoverText></h6>
        <div className="text-light mb-1 fs-6">
          <strong>{returnTitle('app.created_by')}:</strong> {proj.create_user_fio} <span className="normal-style">({formatDateTime(proj.create_date)})</span>
        </div>
      </div>
      {/* Action */}
      <div className="d-flex flex-row align-items-center gap-3">
        
        {proj.technical_parts_count > 0 && (
          <div className="text-info small border rounded p-2">
            {returnTitle('gip.tech_parts_count')} {'  '} <Badge bg="warning" className='mx-1 text-primary'>{proj.technical_parts_count}</Badge> 
          </div>
        )}

        {!proj.gip_confirm ? (
          <span
            className="financial-action-btn send-btn text-primary d-flex align-items-center gap-2"
            style={{ cursor: 'pointer' }}
            onClick={handleConfirm}
          >
            <LuCircleCheckBig size={14} />
            {returnTitle('gip.confirm_and_accept')}
          </span>
        ) : (
          <span
            className="financial-action-btn send-btn text-success d-flex align-items-center gap-2"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowPartsModal(true)}
          >
            <VscGitPullRequestCreate size={14} />
            {returnTitle('gip.make_parts')}
          </span>
        )}
        <GipFinPartsModal
          show={showPartsModal}
          onHide={() => setShowPartsModal(false)}
          project={proj}
          onCreated={onUpdated}   // Yaratilgandan keyin ham projects yangilansin
          onUpdated={onUpdated}   // Yangilangandan keyin ham yangilansin
        />

      </div>
    </div>
  );
}
