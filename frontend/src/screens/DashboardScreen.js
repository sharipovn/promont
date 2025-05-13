import React, { useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ProjectCard from '../components/ProjectCard';





export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);

   
  const fakeData = [...Array(8)].map((_, i) => ({
    title: `Station ${i + 1}`,
    generated: '1 000 000',
    sent: '950 000',
    imported: '1 950 000',
    diff: '50 000',
  }));

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        {sidebarVisible && (
          <div style={{ width: '18%', transition: 'width 0.3s ease' }}>
            <Sidebar />
          </div>
        )}

        {/* Main Content Area */}
        <div
          className="flex-grow-1 d-flex flex-column az aligne-items-start"
          style={{ transition: 'margin-left 0.3s ease', width: sidebarVisible ? '82%' : '100%', height: '95vh' }}
        >
          {/* Topbar */}
          <Topbar
            sidebarVisible={sidebarVisible}
            toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
          />

          {/* Main Page Content */}
          <div className="p-1 d-flex flex-column">
            <div className="card p-4 rounded-4 border-0 shadow-lg dashboard-screen-card">
                <div className="d-flex flex-wrap gap-4 align-items-end">
                  <div>
                    <label className="form-label dboard-filter-input-label">Start Date From</label>
                    <input  type="date"   className="form-control dboard-filter-input" />
                  </div>

                  <div>
                    <label className="form-label   dboard-filter-input-label">Start Date To</label>
                    <input type="date" className="form-control dboard-filter-input" />
                  </div>
                  <div>
                    <label className="form-label  dboard-filter-input-label">End Date From</label>
                    <input type="date" className="form-control dboard-filter-input" />
                  </div>
                  <div>
                    <label className="form-label  dboard-filter-input-label">End Date To</label>
                    <input type="date" className="form-control dboard-filter-input"  />
                  </div>
                  <div className="form-check mt-4">
                    <input className="form-check-input" type="checkbox" id="financierConfirmed" />
                    <label className="form-check-label   dboard-filter-input-label" htmlFor="financierConfirmed">
                      Confirmed by Financier
                    </label>
                  </div>
                  <div className="form-check mt-4">
                    <input className="form-check-input" type="checkbox" id="gipConfirmed" />
                    <label className="form-check-label   dboard-filter-input-label" htmlFor="gipConfirmed">
                      Confirmed by GIP
                    </label>
                  </div>
                </div>
              </div>
              /* card part here */
              
              <div
                className="border p-2"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '1rem',
                }}
              >
                {fakeData.map((item, index) => (
                  <div key={index}>
                    <ProjectCard {...item} />
                  </div>
                ))}
              </div>




              /* card part here */
              
          </div>

        </div>
      </div>
    </div>
  );
}
