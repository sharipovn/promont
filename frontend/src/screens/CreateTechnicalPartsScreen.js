import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import CustomPagination from '../components/CustomPagination';
import CreateTechnicalRow from '../components/CreateTechnicalRow';
import { useI18n } from '../context/I18nProvider';
import { FaCogs } from 'react-icons/fa';
import { CiSearch } from 'react-icons/ci';
import Alert from '../components/Alert';
import { Button } from 'react-bootstrap';
import './FinProjectConfirmScreen.css';

export default function CreateTechnicalPartsScreen() {
  const { returnTitle } = useI18n();
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { setUser, setAccessToken, user } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);

  const fetchProjects = useCallback(() => {
    const params = {
      page: currentPage,
      gip_attached: true,
      gip_user_id: user?.id,
    };

    if (filter === 'confirmed') params.gip_confirm = 'true';
    if (filter === 'not_confirmed') params.gip_confirm = 'false';
    if (searchQuery?.trim()) params.search = searchQuery.trim();

    axiosInstance
      .get('/gip-projects/', { params })
      .then((res) => {
        setProjects(res.data.results);
        setTotalPages(Math.ceil(res.data.count / 10));
      })
      .catch((err) => {
        console.error('❌ Error fetching GIP projects:', err);
        setMessage('❌ Failed to load GIP projects.');
        setTimeout(() => setMessage(null), 3000);
      });
  }, [axiosInstance, currentPage, user, filter, searchQuery]);

  useEffect(() => {
    if (user) fetchProjects();
  }, [fetchProjects, user]);

  return (
    <div className="container-fluid">
      <div className="d-flex" style={{ minHeight: '95vh' }}>
        <div style={{ width: '18%' }}>
          <Sidebar />
        </div>

        <div style={{ width: '82%', padding: '1rem' }}>
          <Alert message={message} type="info" />

          {/* Title + Search + Filters on one row */}
              <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
                
                {/* Title */}
                <h5 className="text-info d-flex align-items-center gap-2 mb-0">
                  <FaCogs /> {returnTitle('gip.technical_parts_creation')}
                </h5>

            {/* Search + Filter row */}
            <div className="d-flex flex-grow-1 justify-content-end align-items-center gap-2 flex-wrap">

              {/* Search bar with min-width */}
              <div className="translation-search-wrapper" style={{ minWidth: '240px' }}>
                <CiSearch className="search-icon" />
                <input
                  type="text"
                  className="translation-search-input"
                  placeholder={returnTitle('gip.search_by_project_name')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentPage(1);
                      fetchProjects();
                    }
                  }}
                />
              </div>

              {/* Filter buttons */}
              <Button
                variant={filter === 'all' ? 'primary' : 'outline-primary'}
                onClick={() => setFilter('all')}
              >
                {returnTitle('verify_tech_fin.all')}
              </Button>
              <Button
                variant={filter === 'not_confirmed' ? 'warning' : 'outline-warning'}
                onClick={() => setFilter('not_confirmed')}
              >
                {returnTitle('gip.not_confirmed')}
              </Button>
              <Button
                variant={filter === 'confirmed' ? 'success' : 'outline-success'}
                onClick={() => setFilter('confirmed')}
              >
                {returnTitle('gip.confirmed')}
              </Button>
            </div>
          </div>



          {/* Project List */}
          <div className="custom-scroll d-flex flex-column gap-2 px-1" style={{ height: '64vh', overflowY: 'auto' }}>
            {projects.map((proj) => (
              <CreateTechnicalRow key={proj.project_code} proj={proj} onUpdated={fetchProjects} />
            ))}
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-center mt-4">
            <CustomPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
