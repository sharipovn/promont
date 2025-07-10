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
        className="table-wrapper  custom-scroll"
        style={{
          maxHeight: '75vh',
        }}
      >
        <table className="custom-dark-table w-100 ">
          <thead>
            <tr className="text-uppercase small">
              <th className="nowrap-cell">{returnTitle('internalization.key')}</th>
              <th className='nowrap-cell'>{returnTitle('internalization.en')}</th>
              <th className='nowrap-cell'>{returnTitle('internalization.ru')}</th>
              <th className='nowrap-cell'>{returnTitle('internalization.uz')}</th>
              <th className='nowrap-cell'>{returnTitle('internalization.update_time')}</th>
              <th className='nowrap-cell'>{returnTitle('internalization.translated')}</th>
              <th className="nowrap-cell text-center freeze-header-right" style={{ width: '60px' }}>{returnTitle('internalization.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {translations.map((tr) => (
              <tr key={tr.translation_id}>
                <td className="nowrap-cell fw-semibold text-info">{tr.key}</td>
                <td className="nowrap-cell py-3">{tr.en || <span className="text-muted">—</span>}</td>
                <td className="nowrap-cell py-3">{tr.ru || <span className="text-muted">—</span>}</td>
                <td className="nowrap-cell py-3">{tr.uz || <span className="text-muted">—</span>}</td>
                <td className="nowrap-cell py-3">{formatDateOnly(tr.update_time) || <span className="text-muted">—</span>}</td>
                <td className="nowrap-cell py-3"><HoverText>{tr.translated_by_fio || <span className="text-muted">—</span>}</HoverText></td>
                <td className="freeze-right nowrap-cell text-center py-3">
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
