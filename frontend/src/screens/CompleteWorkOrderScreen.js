import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import CustomPagination from '../components/CustomPagination';
import WorkOrderRow from '../components/WorkOrderRow';
import Alert from '../components/Alert';
import { FaClipboardCheck } from 'react-icons/fa';
import { useI18n } from '../context/I18nProvider';

export default function CompleteWorkOrderScreen() {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();
  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), []);

  const fetchWorkOrders = useCallback(() => {
    axiosInstance.get('/complete-work-order/my-tasks/', { params: { page: currentPage } })
      .then((res) => {
        setOrders(res.data.results);
        setTotalPages(Math.ceil(res.data.count / 10));
      })
      .catch((err) => {
        console.error('Failed to fetch work orders:', err);
        setMessage(returnTitle('complete_wo.failed_to_load_work_orders'));
        setTimeout(() => setMessage(null), 3000);
      });
  }, [axiosInstance, currentPage, returnTitle]);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  return (
    <div className="container-fluid">
      <div className="d-flex" style={{ minHeight: '95vh' }}>
        <div style={{ width: '18%' }}><Sidebar /></div>
        <div style={{ width: '82%', padding: '1rem' }}>
          <Alert message={message} type="info" />
          <h5 className="text-info d-flex align-items-center gap-2 mb-3">
            <FaClipboardCheck /> {returnTitle('complete_wo.complete_work_orders')}
          </h5>

          <div className="custom-scroll d-flex flex-column gap-2 px-1" style={{ height: '64vh', overflowY: 'auto' }}>
            {orders.map(order => (
              <WorkOrderRow key={order.wo_id} order={order} onRefuse={fetchWorkOrders}  onConfirmed={fetchWorkOrders}  onCompleted={fetchWorkOrders}/>
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
