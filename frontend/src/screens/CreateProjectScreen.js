// CreateProjectScreen.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { IoAdd } from "react-icons/io5";
import { GrProjects } from 'react-icons/gr';
import Sidebar from '../components/Sidebar';
import Alert from '../components/Alert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useI18n } from '../context/I18nProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import CreateProjectModal from '../components/CreateProjectModal';
import UpdateProjectModal from '../components/UpdateProjectModal';
import CustomPagination from '../components/CustomPagination';
import ProjectRow from '../components/ProjectRow';
import './CreateProjectScreen.css';
import { CiSearch } from "react-icons/ci";
import {clearAndClose} from '../utils/clearAndClose'



export default function CreateProjectScreen() {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);

  const [projects, setProjects] = useState([]);
  const [alertMsg, setAlertMsg] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = useCallback(() => {
    const params = { page: currentPage };
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    axiosInstance
      .get('/project-list-create/', { params })
      .then((res) => {
        setProjects(res.data.results);
        setTotalPages(Math.ceil(res.data.count / 13));
      })
      .catch((err) => {
        console.error('❌ Failed to load projects:', err);
        setAlertMsg('❌ Failed to load projects.');
      });
  }, [axiosInstance, currentPage, searchQuery]);


  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowUpdateModal(true);
  };

  return (
    <>
      <div className="container-fluid">
        <div className="d-flex" style={{ minHeight: '95vh' }}>
          <div style={{ width: '18%' }}>
            <Sidebar />
          </div>

          {/* Main Content */}
          <div style={{ width: '82%', padding: '1rem' }}>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
              <h5 className="text-info mb-0 d-flex align-items-center gap-2">
                <GrProjects /> {returnTitle('create_proj.project_list')}
              </h5>

              <div className="d-flex align-items-center gap-2">
                   <div className="create-project-search-wrapper">
                      <CiSearch className="create-project-search-icon" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setCurrentPage(1);
                            fetchProjects();
                          }
                        }}
                        className="create-project-search-input"
                        placeholder={returnTitle('create_proj.search_by_project_name')}
                      />
                    </div>
                <Button
                  variant="primary"
                  className="financial-action-btn send-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  <IoAdd className="me-2" /> {returnTitle('create_proj.create_new_project')}
                </Button>
              </div>
            </div>


            {alertMsg && <Alert type='info' message={alertMsg} />}

            <div className="custom-scroll d-flex flex-column gap-2 px-1" style={{ height: '70vh', overflowY: 'auto' }}>
              {projects.map((project) => (
                <ProjectRow key={project.project_code} project={project} onEdit={handleEditProject} />
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

      <CreateProjectModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}  // ✅ No shared alertMsg
        onCreated={fetchProjects}
      />

      {selectedProject && (
        <UpdateProjectModal
          show={showUpdateModal}
          onHide={() => setShowUpdateModal(false)} // ✅ Same here
          project={selectedProject}
          onUpdated={fetchProjects}
        />
      )}
    </>
  );
}
