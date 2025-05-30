import React from 'react';
import './ProjectStatusLine.css';

const phases = [
  { color: '#FF7F0E', name: 'Initiated' },
  { color: '#FFD700', name: 'Planning' },
  { color: '#1E90FF', name: 'Design' },
  { color: '#A9A9A9', name: 'Development' },
  { color: '#F5DEB3', name: 'Testing' },
  { color: '#B0B0B0', name: 'Deployed' },
  { color: '#B0B0B0', name: 'Completed' },
  { color: '#B0B0B0', name: 'Closed' },
];

export default function ProjectStatusLine({ currentPhaseIndex }) {
  return (
    <div className="status-line-wrapper">
      <div className="status-line">
        {phases.map((phase, index) => (
          <React.Fragment key={index}>
            {index !== 0 && <div className="connector" />}
            <div
              className={`status-dot ${index === currentPhaseIndex ? 'current' : ''}`}
              style={{
                backgroundColor: index < currentPhaseIndex ? phase.color : '#ffffff',
              }}
            >
              <span className="tooltip">{phase.name}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
