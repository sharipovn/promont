import React from 'react';

export default function ProjectFilters({ filters, handleInputChange }) {
  return (
    <div className="card p-3 rounded-4 shadow-lg dashboard-screen-card border">
      <div className="d-flex flex-wrap align-items-end gap-2">

        <div style={{ flex: '1 1 160px', minWidth: '160px' }}>
          <label className="form-label dboard-filter-input-label">Start Date From</label>
          <input
            type="date"
            name="start_date_from"
            value={filters.start_date_from}
            onChange={handleInputChange}
            className="form-control dboard-filter-input"
          />
        </div>

        <div style={{ flex: '1 1 160px', minWidth: '160px' }}>
          <label className="form-label dboard-filter-input-label">Start Date To</label>
          <input
            type="date"
            name="start_date_to"
            value={filters.start_date_to}
            onChange={handleInputChange}
            className="form-control dboard-filter-input"
          />
        </div>

        <div style={{ flex: '1 1 160px', minWidth: '160px' }}>
          <label className="form-label dboard-filter-input-label">End Date From</label>
          <input
            type="date"
            name="end_date_from"
            value={filters.end_date_from}
            onChange={handleInputChange}
            className="form-control dboard-filter-input"
          />
        </div>

        <div style={{ flex: '1 1 160px', minWidth: '160px' }}>
          <label className="form-label dboard-filter-input-label">End Date To</label>
          <input
            type="date"
            name="end_date_to"
            value={filters.end_date_to}
            onChange={handleInputChange}
            className="form-control dboard-filter-input"
          />
        </div>

        <div className="form-check d-flex align-items-center mt-2" style={{ flex: '1 1 180px', minWidth: '180px' }}>
          <input
            className="form-check-input me-2"
            type="checkbox"
            name="financier_confirmed"
            checked={filters.financier_confirmed}
            onChange={handleInputChange}
          />
          <label className="form-check-label dboard-filter-input-label" htmlFor="financierConfirmed">
            Confirmed (Financier)
          </label>
        </div>

        <div className="form-check d-flex align-items-center mt-2" style={{ flex: '1 1 160px', minWidth: '160px' }}>
          <input
            className="form-check-input me-2"
            type="checkbox"
            name="gip_confirmed"
            checked={filters.gip_confirmed}
            onChange={handleInputChange}
          />
          <label className="form-check-label dboard-filter-input-label" htmlFor="gipConfirmed">
            Confirmed (GIP)
          </label>
        </div>

      </div>
    </div>
  );
}
