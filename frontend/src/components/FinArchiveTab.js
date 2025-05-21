import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import CustomPagination from '../components/CustomPagination';
import Alert from '../components/Alert';
import FinArchiveRow from '../components/FinArchiveRow';

export default function FinArchiveTab({ refresh, onRefreshHandled }) {
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
      .get('projects-confirm/financier/', {
        params: { page: currentPage, financier_confirmed: true },
      })
      .then((res) => {
        setProjects(res.data.results);
        setTotalPages(Math.ceil(res.data.count / 8));
      })
      .catch((err) => {
        console.error('❌ Error fetching archive projects:', err);
        setMessage('Failed to load confirmed projects.');
        setTimeout(() => setMessage(null), 3000);
      });
  }, [axiosInstance, currentPage]);

    useEffect(() => {
    fetchProjects();
      }, [currentPage, fetchProjects]);

  useEffect(() => {
      if (refresh) {
        fetchProjects();         // 🔄 Refresh list on demand
        onRefreshHandled?.();    // ✅ Reset trigger in parent
      }
    }, [refresh, fetchProjects, onRefreshHandled]);


  return (
    <>
      <div className="mt-3">
        <h5 className="text-success mb-4">Confirmed Projects Archive</h5>
        <Alert message={message} type="info" />
        <div className="custom-scroll d-flex flex-column gap-2 px-1" style={{ height: '64vh', overflowY: 'auto' }}>
          {projects.map((proj) => (
            <FinArchiveRow key={proj.project_code} proj={proj}  onCreated={fetchProjects} />
          ))}
        </div>
      </div>
      <div className="d-flex justify-content-center mt-4">
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
