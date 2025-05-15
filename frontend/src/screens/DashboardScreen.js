import React, { useState, useEffect, useMemo,useCallback} from 'react';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ProjectCard from '../components/ProjectCard';
import CustomPagination from '../components/CustomPagination';
import { createAxiosInstance } from '../utils/createAxiosInstance';





export default function DashboardScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [projects, setProjects] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    start_date_from: '',
    start_date_to: '',
    end_date_from: '',
    end_date_to: '',
    financier_confirmed: false,
    gip_confirmed: false,
  });

  const { setAccessToken, setUser } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(() => {
    return createAxiosInstance(navigate, setUser, setAccessToken);
  }, [navigate, setUser, setAccessToken]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const fetchProjects = useCallback(() => {
    const params = {
      page: currentPage,
    };
    if (filters.start_date_from) params.start_date_from = filters.start_date_from;
    if (filters.start_date_to) params.start_date_to = filters.start_date_to;
    if (filters.end_date_from) params.end_date_from = filters.end_date_from;
    if (filters.end_date_to) params.end_date_to = filters.end_date_to;
    if (filters.financier_confirmed) params.financier_confirmed = true;
    if (filters.gip_confirmed) params.gip_confirmed = true;
  
    axiosInstance
      .get('/projects/', { params })
      .then((res) => {
        setProjects(res.data.results);
        setTotalPages(Math.ceil(res.data.count / 10)); // 20 = page_size
      })
      .catch((err) => console.error('❌ Error fetching projects:', err));
  }, [axiosInstance, filters, currentPage]);
  
  

  useEffect(() => {
    fetchProjects();
  }, [filters, currentPage, fetchProjects]);
  

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
                    <input type="date" name="start_date_from" value={filters.start_date_from} onChange={handleInputChange} className="form-control dboard-filter-input" />
                  </div>

                  <div>
                    <label className="form-label   dboard-filter-input-label">Start Date To</label>
                    <input type="date" name="start_date_to" value={filters.start_date_to} onChange={handleInputChange} className="form-control dboard-filter-input" />
                  </div>
                  <div>
                    <label className="form-label  dboard-filter-input-label">End Date From</label>
                    <input type="date" name="end_date_from" value={filters.end_date_from} onChange={handleInputChange} className="form-control dboard-filter-input" />
                  </div>
                  <div>
                    <label className="form-label  dboard-filter-input-label">End Date To</label>
                    <input type="date" name="end_date_to" value={filters.end_date_to} onChange={handleInputChange} className="form-control dboard-filter-input" />
                  </div>
                  <div className="form-check mt-4">
                  <input className="form-check-input" type="checkbox" name="financier_confirmed" checked={filters.financier_confirmed} onChange={handleInputChange} />
                    <label className="form-check-label   dboard-filter-input-label" htmlFor="financierConfirmed">
                      Confirmed by Financier
                    </label>
                  </div>
                  <div className="form-check mt-4">
                  <input className="form-check-input" type="checkbox" name="gip_confirmed" checked={filters.gip_confirmed} onChange={handleInputChange} />
                    <label className="form-check-label   dboard-filter-input-label" htmlFor="gipConfirmed">
                      Confirmed by GIP
                    </label>
                  </div>
                </div>
              </div>
              {/* card part here */}
              
              {/* Project Cards Grid */}
              <div
                className=" p-2"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '1rem',
                }}
              >
                {projects.map((proj) => (
                  <div key={proj.project_code}>
                    <ProjectCard proj={proj} />
                  </div>
                ))}
              </div>

              {/* ✅ Pagination centered below the grid */}
              <div className="d-flex justify-content-center mt-4">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>





              {/* card part here */}
              
          </div>

        </div>
      </div>
    </div>
  );
}
