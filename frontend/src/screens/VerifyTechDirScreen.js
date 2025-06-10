import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import CustomPagination from '../components/CustomPagination';
import Alert from '../components/Alert';
import VerifyTechDirRow from '../components/VerifyTechDirRow';
import { FaCheckCircle } from 'react-icons/fa';
import {Button} from 'react-bootstrap'
import { useI18n } from '../context/I18nProvider';
import './FinProjectConfirmScreen.css';




export default function VerifyTechDirScreen() {

  const { returnTitle } = useI18n()

  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filter, setFilter] = useState('all');

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(() => {
    return createAxiosInstance(navigate, setUser, setAccessToken);
  }, [navigate, setUser, setAccessToken]);

  const fetchProjects = useCallback(() => {

     const query = { page: currentPage };

      if (filter === 'verified') {
        query.tech_dir_confirmed = 'true';
      } else if (filter === 'not_verified') {
        query.tech_dir_confirmed = 'false';
      }

    axiosInstance
      .get('/projects-confirm/tech-dir/', { params: query })
      .then((res) => {
        setProjects(res.data.results);
        setTotalPages(Math.ceil(res.data.count / 8));
      })
      .catch((err) => {
        console.error('❌ Error fetching projects for tech dir:', err);
        setMessage(`❌ ${returnTitle('tec_verify.load_error')}`);
        setTimeout(() => setMessage(null), 3000);
      });
  }, [axiosInstance, currentPage,filter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, currentPage,filter]);


  return (
    <div className="container-fluid">
      <div className="d-flex" style={{ minHeight: '95vh' }}>
        <div style={{ width: '18%' }}>
          <Sidebar />
        </div>

        <div style={{ width: '82%', padding: '1rem' }}>

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <h5 className="text-info d-flex align-items-center gap-2 mb-0">
              <FaCheckCircle/> {returnTitle("tec_dir_confirm.technical_director_review")}
            </h5>

            <div className="d-flex flex-wrap gap-2">
                <Button
                  variant={filter === 'all' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilter('all')}
                >
                  {returnTitle('verify_tech_fin.all')}
                </Button>

                <Button
                  variant={filter === 'not_verified' ? 'warning' : 'outline-warning'}
                  onClick={() => setFilter('not_verified')}
                >
                  {returnTitle('tec_dir_confirm.not_verified')}
                </Button>

                <Button
                  variant={filter === 'verified' ? 'success' : 'outline-success'}
                  onClick={() => setFilter('verified')}
                >
                  {returnTitle('tec_dir_confirm.verified')}
                </Button>
              </div>

          </div>


          <Alert message={message} type="info" />

          <div className="custom-scroll d-flex flex-column gap-2 px-1" style={{ height: '64vh', overflowY: 'auto' }}>
            {projects.map((proj) => (
              <VerifyTechDirRow key={proj.project_code} proj={proj}  onVerified={fetchProjects} />
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
