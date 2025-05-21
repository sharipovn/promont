import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import CustomPagination from '../components/CustomPagination';
import Alert from '../components/Alert';
import VerifyTechDirRow from '../components/VerifyTechDirRow';
import { FaCheckCircle } from 'react-icons/fa';
import './FinProjectConfirmScreen.css';

export default function VerifyTechDirScreen() {
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(() => {
    return createAxiosInstance(navigate, setUser, setAccessToken);
  }, [navigate, setUser, setAccessToken]);

  const fetchProjects = useCallback(() => {
    axiosInstance
      .get('/projects-confirm/tech-dir/', {
        params: { page: currentPage, tech_dir_confirmed: false },
      })
      .then((res) => {
        setProjects(res.data.results);
        setTotalPages(Math.ceil(res.data.count / 8));
      })
      .catch((err) => {
        console.error('❌ Error fetching projects for tech dir:', err);
        setMessage('❌ Failed to load projects for technical director verification.');
        setTimeout(() => setMessage(null), 3000);
      });
  }, [axiosInstance, currentPage]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, currentPage]);

  return (
    <div className="container-fluid">
      <div className="d-flex" style={{ minHeight: '95vh' }}>
        {/* Sidebar */}
        <div style={{ width: '18%' }}>
          <Sidebar />
        </div>

        {/* Main Content */}
        <div style={{ width: '82%', padding: '1rem' }}>
          <h5 className="text-info mb-4 d-flex align-items-center gap-2">
            <FaCheckCircle /> Technical Director Review
          </h5>

          <Alert message={message} type="info" />

          <div className="custom-scroll d-flex flex-column gap-2 px-1" style={{ height: '64vh', overflowY: 'auto' }}>
            {projects.map((proj) => (
              <VerifyTechDirRow key={proj.project_code} proj={proj} onVerified={fetchProjects} />
            ))}
          </div>

          <div className="d-flex justify-content-center mt-4">
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
