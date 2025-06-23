import React, { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import HoverText from './HoverText';
import EditOrganisationModal from './EditOrganisationModal';
import { useI18n } from '../context/I18nProvider';

export default function OrganisationRow({ org, onUpdated }) {
  const { returnTitle } = useI18n();
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <div className="financial-row d-flex flex-column flex-md-row justify-content-between align-items-center gap-3" style={{ minHeight: '62px' }}>
        <div className="flex-grow-1">
          <h6 className="text-success mb-1 fs-6">
            <HoverText>{org.partner_name}</HoverText>
          </h6>
          <div className="text-light mb-1 fs-6">
            <strong>{returnTitle('add_part.inn')}:</strong> {org.partner_inn}
          </div>
        </div>

        <div className="d-flex flex-row align-items-center gap-3 mt-2 mt-md-0">
          <button
            className="financial-action-btn edit-btn"
            onClick={() => setShowEditModal(true)}
          >
            <FaEdit size={14} /> {returnTitle('app.update')}
          </button>
        </div>
      </div>

      <EditOrganisationModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        organisation={org}
        onUpdated={onUpdated}
      />
    </>
  );
}
