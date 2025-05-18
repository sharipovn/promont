// components/ProjectFilters.js
import React from 'react';

export default function ProjectFilters({ filters, handleInputChange }) {
  return (
    <div className="card p-3 rounded-4 shadow-lg dashboard-screen-card border" style={{ maxHeight: '12vh' }}>
      <div className="d-flex flex-wrap gap-4 align-items-end">
        <div>
          <label className="form-label dboard-filter-input-label">Start Date From</label>
          <input
            type="date"
            name="start_date_from"
            value={filters.start_date_from}
            onChange={handleInputChange}
            className="form-control dboard-filter-input"
          />
        </div>

        <div>
          <label className="form-label dboard-filter-input-label">Start Date To</label>
          <input
            type="date"
            name="start_date_to"
            value={filters.start_date_to}
            onChange={handleInputChange}
            className="form-control dboard-filter-input"
          />
        </div>

        <div>
          <label className="form-label dboard-filter-input-label">End Date From</label>
          <input
            type="date"
            name="end_date_from"
            value={filters.end_date_from}
            onChange={handleInputChange}
            className="form-control dboard-filter-input"
          />
        </div>

        <div>
          <label className="form-label dboard-filter-input-label">End Date To</label>
          <input
            type="date"
            name="end_date_to"
            value={filters.end_date_to}
            onChange={handleInputChange}
            className="form-control dboard-filter-input"
          />
        </div>

        <div className="form-check mt-4">
          <input
            className="form-check-input"
            type="checkbox"
            name="financier_confirmed"
            checked={filters.financier_confirmed}
            onChange={handleInputChange}
          />
          <label className="form-check-label dboard-filter-input-label" htmlFor="financierConfirmed">
            Confirmed by Financier
          </label>
        </div>

        <div className="form-check mt-4">
          <input
            className="form-check-input"
            type="checkbox"
            name="gip_confirmed"
            checked={filters.gip_confirmed}
            onChange={handleInputChange}
          />
          <label className="form-check-label dboard-filter-input-label" htmlFor="gipConfirmed">
            Confirmed by GIP
          </label>
        </div>
      </div>
    </div>
  );
}
