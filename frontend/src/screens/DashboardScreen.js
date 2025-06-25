import React, { useState, useEffect, useMemo,useCallback,useRef } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ProjectCard from '../components/ProjectCard';
import CustomPagination from '../components/CustomPagination';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import ProjectFilters from '../components/ProjectFilters';
import { Spinner } from 'react-bootstrap';
import { useI18n } from '../context/I18nProvider';
import { VscError } from "react-icons/vsc";
import Alert from '../components/Alert';





export default function DashboardScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [projects, setProjects] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { returnTitle } = useI18n();

  const requestIdRef = useRef(0); // 🆕 uniq ID saqlovchi ref

  const [filters, setFilters] = useState({
    start_date_from: '',
    start_date_to: '',
    end_date_from: '',
    end_date_to: '',
    financier_confirmed: false,
    gip_confirmed: false,
    total_price_from: '',
    total_price_to: '',
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
    const requestId = ++requestIdRef.current; // har bir chaqirishda ID o‘sadi
    setLoading(true);
    setProjects([]); // eski ma’lumotlar yo‘qoladi
    const params = {
      page: currentPage,
    };
    if (filters.start_date_from) params.start_date_from = filters.start_date_from;
    if (filters.start_date_to) params.start_date_to = filters.start_date_to;
    if (filters.end_date_from) params.end_date_from = filters.end_date_from;
    if (filters.end_date_to) params.end_date_to = filters.end_date_to;
    if (filters.financier_confirmed) params.financier_confirmed = true;
    if (filters.gip_confirmed) params.gip_confirmed = true;
    if (searchQuery) params.search = searchQuery;

    // ✅ Add total price filters
    if (filters.total_price_from) params.total_price_from = filters.total_price_from;
    if (filters.total_price_to) params.total_price_to = filters.total_price_to;
  
    axiosInstance
      .get('/projects/', { params })
      .then((res) => {
            if (requestId === requestIdRef.current) {
            setProjects(res.data.results);
            setTotalPages(Math.ceil(res.data.count / 10));
            setError('');
          } else {
            console.warn('⚠️ Old response ignored (requestId mismatch)');
          }
      })
      .catch((err) => {
          console.error('❌ Error fetching projects:', err);
          setError(returnTitle('dashboard.failed_to_load_projects'));
        })
    .finally(() => {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    });
  }, [axiosInstance, filters, currentPage, searchQuery]);
  
  

  useEffect(() => {
    fetchProjects();
  }, [filters, currentPage, fetchProjects,searchQuery]);
  

  return (
    <div className="container-fluid">
      {error && (
      <Alert
        type="danger"
        message={
          <span className="d-flex align-items-center gap-2">
            <VscError /> {error}
          </span>
        }
      />
    )}
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        {sidebarVisible && (
          <div style={{ width: '18%', transition: 'width 0.3s ease' }}>
            <Sidebar />
          </div>
        )}

        {/* Main Content Area */}
        <div
          className="flex-grow-1 d-flex flex-column  aligne-items-start"
          style={{ transition: 'margin-left 0.3s ease', width: sidebarVisible ? '82%' : '100%', height: '95vh' }}
        >
          {/* Topbar */}
          <Topbar
            sidebarVisible={sidebarVisible}
            toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Main Page Content */}
          <div className="p-1 d-flex flex-column border-0">

              {/* Filter Component */}
                <ProjectFilters filters={filters} handleInputChange={handleInputChange} />
              {/* card part here */}
              
              {/* Wrapper with spinner + grid */}
                  <div className="p-2 position-relative">

                    {/* 🔄 Spinner loading holatda */}
                    {loading && (
                    <div className="d-flex flex-column justify-content-center align-items-center mb-2 text-info" style={{ minHeight: '60vh' }}>
                      <Spinner animation="border" variant="info" role="status" style={{ width: '5rem', height: '5rem' }} />
                      <span className="mt-2 fw-semibold" style={{ fontSize: '1rem' }}>
                        {returnTitle('app.loading')}
                      </span>
                    </div>


                    )}

                {/* 📦 Grid qismi */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gridTemplateRows: 'repeat(2, 1fr)',
                    columnGap: '0.5rem',
                    rowGap: '0.5rem',
                    maxHeight: '68vh',
                    width: '100%',
                  }}
                >
                  {projects.map((proj) => (
                    <div key={proj.project_code} style={{ height: '100%' }}>
                      <ProjectCard proj={proj} />
                    </div>
                  ))}

                  {/* 🔲 Bo‘sh joylar to‘ldiruvchi */}
                  {!loading && projects.length > 0 &&
                    Array.from({ length: 10 - projects.length }).map((_, idx) => (
                      <div key={`empty-${idx}`} />
                    ))}

                  {/* ❌ Ma'lumot yo‘q holat */}
                  {!loading && projects.length === 0 && (
                    <div className="d-flex flex-column justify-content-center  align-items-center mb-2 text-info" style={{ gridColumn: '1 / -1',minHeight:'60vh'}}>
                      <span style={{ fontSize: '2.5rem' }}>{returnTitle('dashboard.not_found_projects')}</span>
                    </div>
                  )}
                </div>
              </div>


              {/* ✅ Pagination centered below the grid */}
              <div className="d-flex justify-content-center mt-2 p-1" style={{ minWidth: 0 }}>
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
