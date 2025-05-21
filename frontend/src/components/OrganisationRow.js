import React from 'react';
import { FaEdit } from 'react-icons/fa';
import HoverText from './HoverText';
import './FinArchiveRow.css';

export default function OrganisationRow({ org }) {
  return (
    <div className="financial-row d-flex flex-column flex-md-row justify-content-between align-items-center gap-3" style={{minHeight:'62px'}}>
      <div className="flex-grow-1">
        <h6 className="text-success mb-1 fs-6 fs-md-6 fs-lg-4 fs-xl-3">
          <HoverText>{org.partner_name}</HoverText>
        </h6>
        <div className="text-light mb-1 fs-6 fs-md-6 fs-lg-4 fs-xl-3">
          <strong>INN:</strong> {org.partner_inn}
        </div>
      </div>

      <div className="d-flex flex-row align-items-center gap-3 mt-2 mt-md-0">
        <button
          className="financial-action-btn edit-btn"
          onClick={() => console.log('✏️ Edit', org.partner_code)}
        >
          <FaEdit size={14} /> Update
        </button>
      </div>
    </div>
  );
}
