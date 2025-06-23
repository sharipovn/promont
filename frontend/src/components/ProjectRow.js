// ProjectRow.jsx
import React from 'react';
import { Button } from 'react-bootstrap';
import HoverText from './HoverText';
import { formatDateTime } from '../utils/formatDateTime';
import { useI18n } from '../context/I18nProvider';

export default function ProjectRow({ project, onEdit }) {
  const { returnTitle } = useI18n();

  return (
    <div
      className="financial-row d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
      style={{ minHeight: '75px'}}
    >
      {/* Left Info */}
      <div className="flex-grow-1">
            <h6 className="text-success mb-1 fs-6">
            {project.project_name}{' '}
            <span className="text-secondary">({Number(project.total_price).toLocaleString()} {returnTitle('create_proj.uzs')})</span>
            </h6>
        <div className="text-light small">
          <strong>{returnTitle('app.created_by')}:</strong>{' '}
          <strong>{project.create_user_fio}</strong>{' '}
          <span className="text-info">({project.start_date}-{project.end_date})</span>
        </div>
      </div>

      {/* Action */}
      <div className="d-flex align-items-center">
        <Button
          variant="outline-warning"
          className="financial-action-btn edit-btn"
          size="sm"
          onClick={() => onEdit(project)}
        >
          {returnTitle('app.edit')}
        </Button>
      </div>
    </div>
  );
}
