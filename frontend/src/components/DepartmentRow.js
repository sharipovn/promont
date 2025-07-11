import React, { useState } from 'react';
import { FaEdit, FaUsers } from 'react-icons/fa';
import { CgListTree } from "react-icons/cg";
import HoverText from './HoverText';
import EditDepartmentModal from './EditDepartmentModal';
import DepartmentPositionsModal from './DepartmentPositionsModal';
import { useI18n } from '../context/I18nProvider';
import { formatDateTime } from '../utils/formatDateTime';
import { FaStar } from 'react-icons/fa';



export default function DepartmentRow({ dept, onUpdated }) {
  const { returnTitle } = useI18n();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPositionsModal, setShowPositionsModal] = useState(false);

  return (
    <>
      <div className="financial-row d-flex flex-column flex-md-row justify-content-between align-items-center gap-3" style={{ minHeight: '75px' }}>
        <div className="flex-grow-1">
          <h6 className="text-success mb-1 fs-6 d-flex align-items-center">
            <HoverText>{dept.department_name}</HoverText>
            {dept.is_for_all && <FaStar className="ms-2 text-warning" />}
          </h6>
          <span className="text-secondary mb-1 fs-6">{returnTitle('add_depart.created')} : {formatDateTime(dept.create_time)}</span>
          <div className="text-light mb-1 fs-6">
            <strong>{returnTitle('add_depart.parent_department')}:</strong>{' '}
            {dept.parent_name ? dept.parent_name : returnTitle('add_depart.no_parent')}
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            className="financial-action-btn rounded send-btn"
            style={{ fontSize: '0.9rem', fontWeight: 500 }}
            onClick={() => setShowPositionsModal(true)}
          >
            <CgListTree className="me-2" size={16} />
            {returnTitle('add_depart.manage_positions')}
            <span
              className="ms-2 bg-white text-dark rounded-circle d-flex justify-content-center align-items-center"
              style={{ width: 22, height: 22, fontSize: '0.75rem', fontWeight: 600 }}
            >
              {dept.job_positions?.length || 0}
            </span>
          </button>


          <button className="financial-action-btn rounded edit-btn" onClick={() => setShowEditModal(true)}>
            <FaEdit size={14} /> {returnTitle('app.update')}
          </button>
        </div>
      </div>

      <EditDepartmentModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        department={dept}
        onUpdated={onUpdated}
      />

      <DepartmentPositionsModal
        show={showPositionsModal}
        onHide={() => setShowPositionsModal(false)}
        department={dept}  // 👈 full department object
        onUpdated={onUpdated}
      />

    </>
  );
}
