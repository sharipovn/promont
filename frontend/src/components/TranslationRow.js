import React, { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import EditTranslationModal from './EditTranslationModal';

export default function TranslationRow({ translation, onUpdated }) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <div className="financial-row d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div className="flex-grow-1">
          <h6 className="text-success mb-1">{translation.key}</h6>
          <div className="text-light small">
            <div>EN: {translation.en}</div>
            <div>RU: {translation.ru}</div>
            <div>UZ: {translation.uz}</div>
          </div>
        </div>
        <div className="d-flex">
          <button className="financial-action-btn edit-btn" onClick={() => setShowEditModal(true)}>
            <FaEdit size={14} /> Edit
          </button>
        </div>
      </div>
      <EditTranslationModal show={showEditModal} onHide={() => setShowEditModal(false)} translation={translation} onUpdated={onUpdated} />
    </>
  );
}
