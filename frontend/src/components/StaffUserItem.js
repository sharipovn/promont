import React from 'react';
import './StaffUserItem.css';
import { useI18n } from '../context/I18nProvider';

export default function StaffUserItem({ staff, isActive, onClick }) {
  const { returnTitle } = useI18n();

  return (
    <li
      className={`list-group-item rounded staff-item d-flex align-items-center gap-2 py-2 ${isActive ? 'active-staff' : ''}`}
      onClick={onClick}
    >
      <img
        src={staff.profile_image}
        alt=""
        className="staff-avatar rounded-circle"
      />
      <div className="d-flex flex-column">
        <span className="fw-semibold text-light d-flex align-items-center gap-2">
          {staff.fio}
          {staff.on_vocation && (
            <span className="badge bg-warning text-dark">{returnTitle('staff.on_vocation')}</span>
          )}
          {staff.on_business_trip && (
            <span className="badge bg-warning text-dark">{returnTitle('staff.on_business_trip')}</span>
          )}
        </span>
        <span className="text-success small">{staff.position_name}</span>
      </div>
    </li>
  );
}
