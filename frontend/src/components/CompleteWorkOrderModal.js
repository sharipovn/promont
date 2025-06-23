import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useI18n } from '../context/I18nProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import Alert from './Alert';
import { FaTimes } from 'react-icons/fa';

export default function CompleteWorkOrderModal({ show, onHide, order, onCompleted }) {
  console.log('opened order:',order)
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const MAX_FILE_SIZE_MB = 10;

  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [
    navigate, setUser, setAccessToken,
  ]);
  

  const [woAnswer, setWoAnswer] = useState('');
  const [woRemark, setWoRemark] = useState('');
  const [newFiles, setNewFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [removedFileIds, setRemovedFileIds] = useState([]);

  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (show) {
      setLocked(false); // ✅ Reset lock when modal opens
    }
  }, [show]);



  useEffect(() => {
    if (order) {
      setWoAnswer(order.wo_answer || '');
      setWoRemark(order.wo_remark || '');
      setExistingFiles(order.files || []);
      setNewFiles([]);
      setRemovedFileIds([]); // ✅ reset deleted files
      setAlert({ show: false, variant: '', message: '' }); // ✅ reset alert
    }
  }, [order, show]);

      const handleFileChange = (e) => {
      if (e.target.files?.length) {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = [];

        selectedFiles.forEach((file) => {
          const fileSizeMB = file.size / (1024 * 1024); // Convert bytes to MB
          if (fileSizeMB > MAX_FILE_SIZE_MB) {
            setAlert({
              show: true,
              variant: 'danger',
              message: `${file.name} ${returnTitle('complete_wo.file_size_exceeding_from_max_size')} (${MAX_FILE_SIZE_MB}MB)`
            });
          } else {
            validFiles.push(file);
          }
        });

        if (validFiles.length > 0) {
          setNewFiles((prev) => [...prev, ...validFiles]);
        }

        e.target.value = '';
      }
    };

  const removeNewFile = (index) => {
    const updated = [...newFiles];
    updated.splice(index, 1);
    setNewFiles(updated);
  };

    const removeExistingFile = (index) => {
      const fileToRemove = existingFiles[index];
      if (fileToRemove?.id) {
        setRemovedFileIds(prev => [...prev, fileToRemove.id]);
      }
      const updated = [...existingFiles];
      updated.splice(index, 1);
      setExistingFiles(updated);
    };


  const handleSubmit = async () => {
    if (!woAnswer.trim()) {
      setAlert({ show: true, variant: 'danger', message: returnTitle('complete_wo.answer_required') });
      return;
    }

    if (existingFiles.length === 0 && newFiles.length === 0) {
    setAlert({
      show: true,
      variant: 'danger',
      message: returnTitle('complete_wo.answer_file_required'),
    });
    return;}

    const formData = new FormData();
    formData.append('wo_answer', woAnswer.trim());
    formData.append('wo_remark', woRemark.trim());
    formData.append('deleted_file_ids', JSON.stringify(removedFileIds)); // ✅ Add this
    newFiles.forEach(f => formData.append('files', f));

    setLoading(true);
    try {
      await axiosInstance.post(`/complete-work-order/complete/${order.wo_id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLocked(true); // ✅ Lock after success
      setAlert({ show: true, variant: 'success', message: returnTitle('complete_wo.confirm_success') });
      setTimeout(() => {
        onHide();
        onCompleted();
      }, 800);
    } catch (err) {
      setAlert({ show: true, variant: 'danger', message: returnTitle('complete_wo.confirm_failed') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content border-0 rounded" size="lg">
      <Modal.Body className="p-4 rounded-3" style={{ backgroundColor: "rgb(49, 62, 82)", border: "1px solid rgba(255, 255, 255, 0.452)" }}>
        <h5 className="text-success mb-3">
          {returnTitle('complete_wo.complete_title')} ({order?.wo_name})
        </h5>

        {alert.show && (
          <Alert
            variant={alert.variant}
            message={alert.message}
            onClose={() => setAlert({ ...alert, show: false })}
          />
        )}

        <Form.Group className="mb-3">
          <Form.Label className="text-light fw-bold">
            {returnTitle('complete_wo.answer')} <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            className="text-light border rounded-2 fw-normal"
            style={{ backgroundColor: "rgb(41, 50, 62)" }}
            value={woAnswer}
            onChange={(e) => setWoAnswer(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="text-light fw-bold">
            {returnTitle('complete_wo.remark')} ({returnTitle('complete_wo.optional')})
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            className="text-light border rounded-2 fw-normal"
            style={{ backgroundColor: "rgb(41, 50, 62)" }}
            value={woRemark}
            onChange={(e) => setWoRemark(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="text-light fw-bold">
            {returnTitle('complete_wo.upload_file')} (.pdf,.doc,.docx,.jpg,.png)
          </Form.Label>

          <div className="mb-2">
            {existingFiles.map((f, i) => (
              <div key={i} className="bg-dark rounded px-3 py-2 mb-1 d-flex justify-content-between align-items-center">
                <a href={f.file_url} className="text-info small text-truncate" target="_blank" rel="noopener noreferrer">{f.original_name || f.name || `File ${i + 1}`}</a>
                 {!order?.finished && ( <FaTimes className="text-danger cursor-pointer" onClick={() => removeExistingFile(i)} />)}
              </div>
            ))}
          </div>

          {newFiles.map((f, i) => (
            <div key={i} className="bg-secondary rounded px-3 py-2 mb-1 d-flex justify-content-between align-items-center">
              <span className="text-light small text-truncate">{f.name}</span>
               {!order?.finished && ( <FaTimes className="text-danger cursor-pointer" onClick={() => removeNewFile(i)} /> )}
            </div>
          ))}

           {!order?.finished && ( 
                <Form.Control
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  multiple
                  className="text-light border-0 rounded-2 fw-normal mt-2"
                  style={{ backgroundColor: "rgb(49, 62, 82)" }}
                  onChange={handleFileChange}
                />
            )}
          <small className="text-info">{returnTitle('complete_wo.max_file_size')}</small>
        </Form.Group>

        <div className="d-flex justify-content-end gap-3">
          <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
            {returnTitle('app.cancel')}
          </Button>

          {!order?.finished && (
            <Button variant="success" onClick={handleSubmit} disabled={loading || locked}>
              {loading
                ? returnTitle('complete_wo.sending')
                : returnTitle(order?.wo_answer ? 'complete_wo.update_complete' : 'complete_wo.complete_work_order')}
            </Button>
          )}


        </div>
      </Modal.Body>
    </Modal>
  );
}
