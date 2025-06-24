import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Row, Col, Form, Spinner } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';
import { IoIosArrowDown } from "react-icons/io";
import Select from 'react-select';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../context/I18nProvider';
import {CONSTANTS} from '../constants/app_constants'
import './ViewModal.css';

export default function ViewModal({ show, onHide, project, onVerified }) {
  console.log('project:',project)

  const { returnTitle } = useI18n()

  const [showRefuse, setShowRefuse] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedGip, setSelectedGip] = useState(null);
  const [parts, setParts] = useState([]);
  const [gipUsers, setGipUsers] = useState([]);
  const [loadingParts, setLoadingParts] = useState(true);
  const [loadingGips, setLoadingGips] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRefusing, setIsRefusing] = useState(false);

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(() => {
    return createAxiosInstance(navigate, setUser, setAccessToken);
  }, [navigate, setUser, setAccessToken]);


  useEffect(() => {
  if (show && project?.last_status?.latest_action === CONSTANTS.TECH_DIR_REFUSED) {
    setComment(project.last_status.comment || '');
    setShowRefuse(true); // 🔥 Auto-expand refusal section
    setSelectedGip(null)
  } else {
    setComment('');
    setShowRefuse(false); // 🧹 Reset on modal close or other status
  }
}, [show, project]);



  // 🔁 Fetch finance parts
    useEffect(() => {
      if (show && project?.project_code) {
        setLoadingParts(true);
        axiosInstance
          .get(`/projects-financial-parts/${project.project_code}/`, {
            params: { send_to_tech_dir: true },
          })
          .then((res) => setParts(res.data))
          .catch((err) => console.error("❌ Failed to load finance parts", err))
          .finally(() => setLoadingParts(false));
      }
    }, [axiosInstance, show, project?.project_code]);


  // 🔁 Fetch GIP users
  useEffect(() => {
    if (show) {
      setLoadingGips(true);
      axiosInstance
        .get(`/users-with-capability/?capability=CAN_CREATE_TECH_PARTS`)
        .then((res) => setGipUsers(res.data))
        .catch((err) => console.error("❌ Failed to load GIP users", err))
        .finally(() => setLoadingGips(false));
    }
  }, [axiosInstance,show]);

    const handleRefuse = async () => {
        if (!comment.trim()) {
          alert("Please enter a reason.");
          return;
        }

        setIsRefusing(true);
        try {
          await axiosInstance.post('/projects/tech-dir/refuse/', {
            project_code: project.project_code,
            comment,
          });

          setShowRefuse(false);
          setComment('');
          onVerified?.(); // optionally refresh parent
          onHide(); // close modal
        } catch (err) {
          alert("❌ Refusal failed.");
          console.error(err);
        } finally {
          setIsRefusing(false);
        }
    };

    const handleVerifyConfirm = async () => {
      if (!selectedGip) {
        alert('Please select a Project Manager (GIP).');
        return;
      }

      setIsVerifying(true);
      try {
        await axiosInstance.post('/projects/tech-dir/verify/', {
          project_code: project.project_code,
          gip_user_id: selectedGip.value
        });

        onVerified?.(); // 🔁 refresh parent
        onHide();       // ✅ close modal
      } catch (err) {
        alert("❌ Verification failed.");
        console.error(err);
      } finally {
        setIsVerifying(false);
      }
    };


  const gipOptions = gipUsers.map((user) => ({
    value: user.user_id,
    label: `${user.fio} (${user.position || '---'})`,
  }));

  const selectStyles = useMemo(() => ({
    control: (base) => ({
      ...base,
      backgroundColor: '#2e3e5b',
      borderColor: '#334155',
      color: 'white',
    }),
    menu: (base) => ({ ...base, backgroundColor: '#2e3e5b' }),
    option: (base, { isFocused }) => ({
      ...base,
      backgroundColor: isFocused ? '#3e5e95' : '#2e3e5b',
      color: 'white',
    }),
    singleValue: (base) => ({ ...base, color: 'white' }),
  }), []);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      backdrop="static"
      dialogClassName="custom-fin-modal"
    >
      <Modal.Body className="viewmodal-body">
        <h5 className="viewmodal-title">{returnTitle('tec_dir_confirm.check_and_verify_(by_tech_dir)')}</h5>

        {loadingParts ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="light" />
          </div>
        ) : (
          <>
            <div className="viewmodal-table">
              <Row className="fw-bold mb-2 px-2">
                <Col>{returnTitle('fn_part.fs_part_name')}</Col>
                <Col>{returnTitle('fn_part.fs_part_price')}</Col>
                <Col>{returnTitle('fn_part.fs_part_start_date')}</Col>
                <Col>{returnTitle('fn_part.fs_finish_date')}</Col>
                <Col>{returnTitle('fn_part.financier_fio')}</Col>
              </Row>
              {parts.map((part, index) => (
                <Row key={index} className="border-top py-2 px-2">
                  <Col>{part.fs_part_name || '-'}</Col>
                  <Col>{Number(part.fs_part_price || 0).toLocaleString()} {returnTitle(`currency.${project?.currency_name?.toLowerCase()}`)}</Col>
                  <Col>{part.fs_start_date}</Col>
                  <Col>{part.fs_finish_date}</Col>
                  <Col>{part.financier_fio || '-'}</Col>
                </Row>
              ))}
            </div>

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
              <div style={{ minWidth: '250px', maxWidth: '350px', flexGrow: 1 }}>
                <label className="text-light mb-1">{returnTitle('tec_dir_confirm.assign_project_manager')}</label>
                <Select
                  className='rounded border'
                  options={gipOptions}
                  value={selectedGip}
                  onChange={setSelectedGip}
                  placeholder={loadingGips ? returnTitle('app.loading')+'...' : returnTitle('tec_dir_confirm.select_project_manager')}
                  styles={selectStyles}
                  isClearable
                  isDisabled={loadingGips}
                  required
                />
              </div>

              <div className="d-flex flex-wrap gap-3 ms-auto">
                <Button
                  className="viewmodal-btn-confirm"
                  disabled={showRefuse || !selectedGip || isVerifying}
                  onClick={handleVerifyConfirm}
                >
                  {isVerifying ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" /> {returnTitle('tec_dir_confirm.verifying')}
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="me-2" /> {returnTitle('tec_dir_confirm.verify_and_confirm')}
                    </>
                  )}
                </Button>


                <Button
                  className="viewmodal-btn-refuse"
                  onClick={() => setShowRefuse(!showRefuse)}
                >
                  <IoIosArrowDown className="me-2" /> {returnTitle('app.refuse')}
                </Button>
              </div>
            </div>

            {showRefuse && (
              <>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder={returnTitle('app.write_refusal_reason_here')+"..."}
                  className="viewmodal-textarea mb-3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
                <div className="d-flex justify-content-end">
                  <Button
                    className="viewmodal-btn-refuse-submit"
                    onClick={handleRefuse}
                    disabled={isRefusing}
                  >
                    {isRefusing ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" /> {returnTitle('app.confirming_refusal')}
                      </>
                    ) : returnTitle('app.confirm_refusal')}
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        <div className="d-flex justify-content-end mt-4">
          <Button className="viewmodal-btn-cancel" onClick={onHide}>
            {returnTitle('app.cancel')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
