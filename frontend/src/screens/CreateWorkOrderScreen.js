import React, { useEffect, useState, useMemo,useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import CustomPagination from '../components/CustomPagination';
import GipPartRow from '../components/GipPartRow';
import { FaClipboardList } from 'react-icons/fa';
import Alert from '../components/Alert';
import { useI18n } from '../context/I18nProvider';

export default function CreateWorkOrderScreen() {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const [parts, setParts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();
  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), []);

  const fetchTechParts = useCallback(() => {
  axiosInstance
    .get('/work-order/tech-parts/', { params: { page: currentPage } })
    .then((res) => {
      setParts(res.data.results);
      setTotalPages(Math.ceil(res.data.count / 10));
    })
    .catch((err) => {
      console.error('❌ Failed to fetch parts:', err);
      setMessage('❌ Failed to load technical parts');
      setTimeout(() => setMessage(null), 3000);
    });
}, [axiosInstance, currentPage]);

useEffect(() => {
  fetchTechParts();
}, [fetchTechParts]);


  return (
    <div className="container-fluid">
      <div className="d-flex" style={{ minHeight: '95vh' }}>
        <div style={{ width: '18%' }}>
          <Sidebar />
        </div>

        <div style={{ width: '82%', padding: '1rem' }}>
          <Alert message={message} type="info" />
          <h5 className="text-info d-flex align-items-center gap-2 mb-3">
            <FaClipboardList /> {returnTitle('create_wo.list_of_technical_parts')}
          </h5>

          <div className="custom-scroll d-flex flex-column gap-2 px-1" style={{ height: '64vh', overflowY: 'auto' }}>
            {parts.map((part) => (
              <GipPartRow key={part.tch_part_code} part={part}  onRefuse={fetchTechParts} onConfirmed={fetchTechParts}/>
            ))}
          </div>

          <div className="d-flex justify-content-center mt-4">
            <CustomPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
