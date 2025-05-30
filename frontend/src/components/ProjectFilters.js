import React from 'react';
import { useI18n } from '../context/I18nProvider';



export default function ProjectFilters({ filters, handleInputChange }) {

  const { returnTitle } = useI18n();
  // Utility to format input with commas
  const formatWithCommas = (value) => {
    if (!value) return '';
    const raw = value.toString().replace(/\D/g, '');
    return Number(raw).toLocaleString();
  };

  return (
    <div className="card p-3 rounded-4 shadow-lg dashboard-screen-card border">
      <div className="d-flex flex-wrap align-items-end gap-2">

        {/* Date Filters */}
        <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
          <label className="form-label dboard-filter-input-label">{returnTitle('proj_filter.start_date_from')}</label>
          <input
            type="date"
            name="start_date_from"
            value={filters.start_date_from}
            onChange={handleInputChange}
            className="form-control dboard-filter-input"
          />
        </div>

        <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
          <label className="form-label dboard-filter-input-label">{returnTitle('proj_filter.start_date_to')}</label>
          <input
            type="date"
            name="start_date_to"
            value={filters.start_date_to}
            onChange={handleInputChange}
            className="form-control dboard-filter-input"
          />
        </div>

        <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
          <label className="form-label dboard-filter-input-label">{returnTitle('proj_filter.end_date_from')}</label>
          <input
            type="date"
            name="end_date_from"
            value={filters.end_date_from}
            onChange={handleInputChange}
            className="form-control dboard-filter-input"
          />
        </div>

        <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
          <label className="form-label dboard-filter-input-label">{returnTitle('proj_filter.end_date_to')}</label>
          <input
            type="date"
            name="end_date_to"
            value={filters.end_date_to}
            onChange={handleInputChange}
            className="form-control dboard-filter-input"
          />
        </div>

        {/* Price Filters */}
        <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
          <label className="form-label dboard-filter-input-label">{returnTitle('proj_filter.total_price_from')}</label>
          <input
            type="text"
            name="total_price_from"
            placeholder='–'
            value={formatWithCommas(filters.total_price_from)}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '');
              handleInputChange({ target: { name: 'total_price_from', value: raw } });
            }}
            className="form-control dboard-filter-input"
          />
        </div>

        <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
          <label className="form-label dboard-filter-input-label">{returnTitle('proj_filter.total_price_to')}</label>
          <input
            type="text"
            name="total_price_to"
            placeholder='–'
            value={formatWithCommas(filters.total_price_to)}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '');
              handleInputChange({ target: { name: 'total_price_to', value: raw } });
            }}
            className="form-control dboard-filter-input"
          />
        </div>

        {/* Checkboxes */}
        <div className="form-check d-flex align-items-center mt-2" style={{ flex: '1 1 120px', minWidth: '120px' }}>
          <input
            className="form-check-input me-2"
            type="checkbox"
            name="financier_confirmed"
            checked={filters.financier_confirmed}
            onChange={handleInputChange}
          />
          <label className="form-check-label dboard-filter-input-label" htmlFor="financierConfirmed">
            {returnTitle('proj_filter.confirmed_financier')}
          </label>
        </div>

        <div className="form-check d-flex align-items-center mt-2" style={{ flex: '1 1 120px', minWidth: '120px' }}>
          <input
            className="form-check-input me-2"
            type="checkbox"
            name="gip_confirmed"
            checked={filters.gip_confirmed}
            onChange={handleInputChange}
          />
          <label className="form-check-label dboard-filter-input-label" htmlFor="gipConfirmed">
            {returnTitle('proj_filter.confirmed_gip')}
          </label>
        </div>

      </div>
    </div>
  );
}
