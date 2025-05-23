import React, { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import HoverText from './HoverText';
import EditDepartmentModal from './EditDepartmentModal';
import { useI18n } from '../context/I18nProvider';

export default function DepartmentRow({ dept, onUpdated }) {
  const { returnTitle } = useI18n();
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <div className="financial-row d-flex flex-column flex-md-row justify-content-between align-items-center gap-3" style={{ minHeight: '62px' }}>
        <div className="flex-grow-1">
          <h6 className="text-success mb-1 fs-6"><HoverText>{dept.department_name}</HoverText></h6>
          {dept.parent_name && (
            <div className="text-light mb-1 fs-6">
              <strong>{returnTitle('add_depart.parent_department')}:</strong> {dept.parent_name}
            </div>
          )}
        </div>
        <div className="d-flex gap-2">
          <button className="financial-action-btn edit-btn" onClick={() => setShowEditModal(true)}>
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
    </>
  );
}
