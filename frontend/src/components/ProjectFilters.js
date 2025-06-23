import React from 'react';
import { useI18n } from '../context/I18nProvider';

export default function ProjectFilters({ filters, handleInputChange }) {
  const { returnTitle } = useI18n();

  const formatWithCommas = (value) => {
    if (!value) return '';
    const raw = value.toString().replace(/\D/g, '');
    return Number(raw).toLocaleString();
  };

  return (
    <div className="card px-3 py-1 rounded-4 shadow-lg dashboard-screen-card">
      {/* ✅ Row 1: Date + Price Filters */}
      <div className="row gx-2 gy-2 mb-2">
        {[
          { name: 'start_date_from', type: 'date', label: 'proj_filter.start_date_from' },
          { name: 'start_date_to', type: 'date', label: 'proj_filter.start_date_to' },
          { name: 'end_date_from', type: 'date', label: 'proj_filter.end_date_from' },
          { name: 'end_date_to', type: 'date', label: 'proj_filter.end_date_to' },
        ].map(({ name, type, label }) => (
          <div className="col-sm-2" key={name}>
            <label className="form-label dboard-filter-input-label small">{returnTitle(label)}</label>
            <input
              type={type}
              name={name}
              value={filters[name]}
              onChange={handleInputChange}
              className="form-control form-control-sm dboard-filter-input"
            />
          </div>
        ))}

        {[
          { name: 'total_price_from', label: 'proj_filter.total_price_from' },
          { name: 'total_price_to', label: 'proj_filter.total_price_to' },
        ].map(({ name, label }) => (
          <div className="col-sm-2" key={name}>
            <label className="form-label dboard-filter-input-label small">{returnTitle(label)}</label>
            <input
              type="text"
              name={name}
              placeholder="–"
              value={formatWithCommas(filters[name])}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                handleInputChange({ target: { name, value: raw } });
              }}
              className="form-control form-control-sm dboard-filter-input xsm-input"
            />
          </div>
        ))}
      </div>

      {/* ✅ Row 2: Checkbox Filters */}
      <div className="row gx-2">
        <div className="col-auto d-flex align-items-center form-check form-check-sm">
          <input
            className="form-check-input me-2"
            type="checkbox"
            name="financier_confirmed"
            checked={filters.financier_confirmed}
            onChange={handleInputChange}
            id="financier_confirmed"
          />
          <label className="form-check-label dboard-filter-input-label small" htmlFor="financier_confirmed">
            {returnTitle('proj_filter.confirmed_financier')}
          </label>
        </div>
        <div className="col-auto d-flex align-items-center form-check form-check-sm">
          <input
            className="form-check-input me-2 "
            type="checkbox"
            name="gip_confirmed"
            checked={filters.gip_confirmed}
            onChange={handleInputChange}
            id="gip_confirmed"
          />
          <label className="form-check-label dboard-filter-input-label small" htmlFor="gip_confirmed">
            {returnTitle('proj_filter.confirmed_gip')}
          </label>
        </div>
      </div>
    </div>
  );
}
