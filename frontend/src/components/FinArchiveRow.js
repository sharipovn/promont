import React, { useState, useMemo } from 'react';
import HoverText from './HoverText';
import { formatDateTime } from '../utils/formatDateTime';
import './FinArchiveRow.css';
import FinancialPartsModal from './FinancialPartsModal';
import UpdateFinancialPartsModal from './UpdateFinancialPartsModal';
import Alert from './Alert';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { FaPlusCircle, FaEdit, FaPaperPlane } from 'react-icons/fa';
import { ImCheckboxChecked } from "react-icons/im";
import { BsFillSendCheckFill } from "react-icons/bs";
import { useI18n } from '../context/I18nProvider';





export default function FinArchiveRow({ proj, onCreated }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);

  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sended, setSended] = useState(proj.all_sent_to_tech_dir);

  const hasFinancialParts = proj.finance_parts_count > 0;
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const handleClick = () => {
    hasFinancialParts ? setShowUpdateModal(true) : setShowModal(true);
  };

  const handleSendToTechDir = async () => {
    setIsSending(true);
    setErrorMessage('');
    try {
      await axiosInstance.put(`/projects-financial-parts/${proj.project_code}/send-to-tech-dir/`);
      setSended(true); // ✅ Disable button immediately
      onCreated?.();   // 🔄 Refresh parent list
    } catch (err) {
      console.error('❌ Send error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to send to tech director.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseAndRefresh = (setter) => {
    setSended(false); // 🟡 Assume newly created parts are not sent
    setter(false);
    onCreated?.();
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}

      <div className="financial-row d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="text-success mb-0">
              <HoverText>{proj.project_name}</HoverText>
            </h6>
          </div>
          <div className="small text-light">
            <strong>{returnTitle('create_fpart.created_by')}:</strong> {proj.create_user_fio}{' '}
            <span className="normal-style">({formatDateTime(proj.create_date)})</span>
          </div>
        </div>

        <div className="d-flex flex-row align-items-center gap-2 mt-3 mt-md-0">
          {proj.finance_parts_count > 0 && (
            <span className="fs-parts-badge">
              {proj.finance_parts_count} Part{proj.finance_parts_count > 1 ? 's' : ''}
            </span>
          )}

          {hasFinancialParts ? (
            <>
              <button className="financial-action-btn edit-btn   rounded" onClick={handleClick}>
                <FaEdit size={14} /> {returnTitle('create_fpart.edit_parts')}
              </button>

              <button
                className="financial-action-btn send-btn  rounded"
                onClick={handleSendToTechDir}
                disabled={sended || isSending}
              >
                {sended ? (
                  <>
                    <BsFillSendCheckFill size={14} /> <ImCheckboxChecked style={{color:'yellow'}}/> {returnTitle('create_fpart.sent_to_tech_dir')}
                  </>
                ) : isSending ? (
                  'Sending...'
                ) : (
                  <>
                    <FaPaperPlane size={14} /> {returnTitle('create_fpart.send_to_tech_dir')}
                  </>
                )}
              </button>
            </>
          ) : (
            <button className="financial-action-btn create-btn rounded" onClick={handleClick}>
              <FaPlusCircle size={14} /> {returnTitle('create_fpart.make_financial_parts')}
            </button>
          )}
        </div>
      </div>

      <FinancialPartsModal
        show={showModal}
        onHide={() => setShowModal(false)}
        project={proj}
        onCreated={() => handleCloseAndRefresh(setShowModal)}
      />
      <UpdateFinancialPartsModal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        project={proj}
        onUpdated={() => handleCloseAndRefresh(setShowUpdateModal)}
      />
    </>
  );
}
