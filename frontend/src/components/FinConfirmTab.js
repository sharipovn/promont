import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import CustomPagination from '../components/CustomPagination';
import ProjectConfirmRow from '../components/ProjectConfirmRow';
import ConfirmModal from '../components/ConfirmModal';
import Alert from '../components/Alert';
import { useI18n } from '../context/I18nProvider';
import RefuseModal from '../components/RefuseModal';

export default function FinConfirmTab({onProjectConfirmed }) {

  const {returnTitle}=useI18n()

  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [message, setMessage] = useState(null);

  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(() => {
    return createAxiosInstance(navigate, setUser, setAccessToken);
  }, [navigate, setUser, setAccessToken]);


  const handleConfirmProject = (project) => {
  axiosInstance.post('/projects-confirm/financier/confirm/', {
    project_code: project.project_code,
  })
  .then(() => {
    setMessage(`✅ Project "${project.project_name}" confirmed successfully.`);
    setShowModal(false);
    fetchProjects();
    if (onProjectConfirmed) onProjectConfirmed(); // 🔥 trigger parent to refresh archive

    // Auto-hide after 3 seconds
    setTimeout(() => setMessage(''), 3000);
  })
  .catch((error) => {
    console.error('❌ Confirmation error:', error);
    const errMsg =
      error.response?.data?.error || "An unexpected error occurred while confirming the project.";
    setMessage(`❌ ${errMsg}`);

    setTimeout(() => setMessage(''), 4000);
  });
};



  const fetchProjects = useCallback(() => {
    axiosInstance
      .get('projects-confirm/financier/', {
        params: { page: currentPage, financier_confirmed: false },
      })
      .then((res) => {
        setProjects(res.data.results);
        setTotalPages(Math.ceil(res.data.count / 8));
      })
      .catch((err) => console.error('❌ Error fetching projects:', err));
  }, [axiosInstance, currentPage]);



  const handleConfirmClick = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  


    const handleRefuse = (project) => {
      setSelectedProject(project);
      setShowRefuseModal(true);
    };


  
    const handleRefuseConfirm = async (project, comment) => {
        try {
          await axiosInstance.post('/projects-confirm/financier/refuse/', {
            project_code: project.project_code,
            comment,
          });

          setMessage(`❌ Project "${project.project_name}" refused successfully.`);
          fetchProjects();
          // if (onProjectConfirmed) onProjectConfirmed();

          setTimeout(() => setMessage(''), 3000);
        } catch (error) {
          const errMsg = error.response?.data?.error || 'An error occurred while refusing the project.';
          setMessage(`❌ ${errMsg}`);
          setTimeout(() => setMessage(''), 4000);
        }
      };



  useEffect(() => {
    fetchProjects();
  }, [currentPage, fetchProjects]);

  return (
    <>
    <div className="mt-3">
      <h5 className="text-info mb-4">{returnTitle('fin_confirm.list_of_not_confirmed_projects')}</h5>
      <Alert message={message} type="info" />
      <div className="custom-scroll d-flex flex-column gap-2 px-1" style={{ height: '64vh', overflowY: 'auto' }}>
        {projects.map((proj, i) => (
          <ProjectConfirmRow
            key={proj.project_code}
            proj={proj}
            onConfirm={handleConfirmClick}
            onRefuse={handleRefuse}
          />
        ))}
      </div>
      
     
    </div>
     <div className="d-flex justify-content-center mt-4">
      <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      <ConfirmModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onConfirm={handleConfirmProject}
          project={selectedProject}
      />
      <RefuseModal
        show={showRefuseModal}
        onHide={() => setShowRefuseModal(false)}
        onRefuseConfirm={handleRefuseConfirm}
        project={selectedProject}
      />

      </div>
      </>
  );
}
