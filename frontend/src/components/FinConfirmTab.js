import React, { useState, useEffect, useMemo,useCallback} from 'react';
import { Table, Spinner } from 'react-bootstrap';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import CustomPagination from '../components/CustomPagination';

export default function FinConfirmTab() {
  const [projects, setProjects] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(() => {
    return createAxiosInstance(navigate, setUser, setAccessToken);
  }, [navigate, setUser, setAccessToken]);

  const fetchProjects = useCallback(() => {
    const params = {
      page: currentPage,
    };
      axiosInstance
        .get('projects-confirm/financier/', { params })
        .then((res) => {
          setProjects(res.data.results);
          setTotalPages(Math.ceil(res.data.count / 8)); // 20 = page_size
        })
        .catch((err) => console.error('❌ Error fetching projects:', err));
    }, [axiosInstance,currentPage]);
    

  useEffect(() => {
    fetchProjects();
  }, [currentPage, fetchProjects]);


  return (
    <div className="mt-3">
      <h5 className="text-info mb-4">Tasdiqlanmagan loyihalar ro'yxati</h5>
  
      <div className="d-flex flex-column gap-3">
        {projects.map((proj, i) => (
          <div
            key={proj.project_code}
            className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 shadow-sm rounded-4 px-4 py-3"
            style={{
              background: 'linear-gradient(145deg, #222b3c, #151b28)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-info mb-0">{i + 1}. {proj.project_name}</h6>
                <span className="badge bg-light text-dark">{proj.total_price.toLocaleString()} so‘m</span>
              </div>
  
              <div className="text-light small">
                <div><strong>Muddat:</strong> {proj.start_date} → {proj.end_date}</div>
                <div><strong>Yaratgan:</strong> {proj.create_user_fio}</div>
              </div>
            </div>
  
            <div className="d-flex align-items-center mt-3 mt-md-0">
              <span className="badge bg-warning text-dark">Tasdiqlanmagan</span>
            </div>
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
    </div>
  );
  
}
