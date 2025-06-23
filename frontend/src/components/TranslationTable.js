import React, { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import EditTranslationModal from './EditTranslationModal';
import './TranslationTable.css';
import { useI18n } from '../context/I18nProvider';
import {formatDateOnly} from '../utils/formatDateTime'
import HoverText from './HoverText'

export default function TranslationTable({ translations, onUpdated }) {
  const [editingTranslation, setEditingTranslation] = useState(null);
  const { returnTitle } = useI18n();
  console.log('translations:',translations)

  
  return (
    <>
      <div
        className="table-responsive rounded-4 custom-scroll"
        style={{
          backgroundColor: '#2e3a4b',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          maxHeight: '75vh',
        }}
      >
        <table className="custom-dark-table w-100 ">
          <thead>
            <tr className="text-uppercase small">
              <th className="ps-4" style={{ width: '20%' }}>{returnTitle('internalization.key')}</th>
              <th>{returnTitle('internalization.en')}</th>
              <th>{returnTitle('internalization.ru')}</th>
              <th>{returnTitle('internalization.uz')}</th>
              <th>{returnTitle('internalization.update_time')}</th>
              <th>{returnTitle('internalization.translated')}</th>
              <th className="text-center" style={{ width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {translations.map((tr) => (
              <tr key={tr.translation_id}>
                <td className="ps-4 py-3 fw-semibold text-info">{tr.key}</td>
                <td className="py-3">{tr.en || <span className="text-muted">—</span>}</td>
                <td className="py-3">{tr.ru || <span className="text-muted">—</span>}</td>
                <td className="py-3">{tr.uz || <span className="text-muted">—</span>}</td>
                <td className="py-3">{formatDateOnly(tr.update_time) || <span className="text-muted">—</span>}</td>
                <td className="py-3"><HoverText>{tr.translated_by_fio || <span className="text-muted">—</span>}</HoverText></td>
                <td className="text-center py-3">
                  <button
                    onClick={() => setEditingTranslation(tr)}
                    className="edit-btn-icon"
                    title={returnTitle('app.edit')}
                  >
                    <FaEdit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingTranslation && (
        <EditTranslationModal
          show={!!editingTranslation}
          onHide={() => setEditingTranslation(null)}
          translation={editingTranslation}
          onUpdated={onUpdated}
        />
      )}
    </>
  );
}
