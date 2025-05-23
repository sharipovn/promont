import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import DepartmentRow from '../components/DepartmentRow';
import AddDepartmentModal from '../components/AddDepartmentModal';
import CustomPagination from '../components/CustomPagination';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { Button } from 'react-bootstrap';
import { useI18n } from '../context/I18nProvider';

export default function AddDepartmentScreen() {
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const { returnTitle } = useI18n();

  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);

  const fetchDepartments = useCallback(() => {
    axiosInstance.get('/departments/', { params: { page: currentPage } }).then((res) => {
      setDepartments(res.data.results);
      setTotalPages(Math.ceil(res.data.count / 8));
    }).catch((err) => {
      console.error('❌ Error fetching departments:', err);
    });
  }, [axiosInstance, currentPage]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return (
    <div className="container-fluid">
      <div className="d-flex" style={{ minHeight: '95vh' }}>
        <div style={{ width: '18%' }}>
          <Sidebar />
        </div>
        <div style={{ width: '82%', padding: '1rem' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-info mb-0">{returnTitle('add_depart.department_list')}</h5>
            <Button variant="primary" className="financial-action-btn send-btn" onClick={() => setShowModal(true)}>
              + {returnTitle('add_depart.add_department')}
            </Button>
          </div>
          <div className="custom-scroll d-flex flex-column gap-2 px-1" style={{ height: '64vh', overflowY: 'auto' }}>
            {departments.map((dept) => (
              <DepartmentRow key={dept.department_id} dept={dept} onUpdated={fetchDepartments} />
            ))}
          </div>
          <div className="d-flex justify-content-center mt-4">
            <CustomPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>
      <AddDepartmentModal show={showModal} onHide={() => setShowModal(false)} onCreated={fetchDepartments} />
    </div>
  );
}
