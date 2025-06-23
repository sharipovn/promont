// ConfirmFinishedWorkOrderScreen.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import CustomPagination from '../components/CustomPagination';
import FinishedWorkOrderRow from '../components/FinishedWorkOrderRow';
import Alert from '../components/Alert';
import { IoCalendarSharp } from "react-icons/io5";
import { useI18n } from '../context/I18nProvider';



export default function ConfirmFinishedWorkOrderScreen() {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();
  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), []);

  const fetchOrders = useCallback(() => {
    axiosInstance.get('/work-order/finished-for-confirm/', { params: { page: currentPage } })
      .then((res) => {
        setOrders(res.data.results);
        setTotalPages(Math.ceil(res.data.count / 10));
      })
      .catch((err) => {
        console.error('Failed to fetch work orders:', err);
        setMessage(returnTitle('confirm_finished.failed_to_load'));
        setTimeout(() => setMessage(null), 3000);
      });
  }, [axiosInstance, currentPage, returnTitle]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="container-fluid">
      <div className="d-flex" style={{ minHeight: '95vh' }}>
        <div style={{ width: '18%' }}><Sidebar /></div>
        <div style={{ width: '82%', padding: '1rem' }}>
          <Alert message={message} type="info" />
          <h5 className="text-info d-flex align-items-center gap-2 mb-3">
            <IoCalendarSharp /> {returnTitle('confirm_finished.title')}
          </h5>
            <div className="custom-scroll px-1" style={{ height: '64vh', overflowY: 'auto' }}>
            {orders.map(order => (
              <FinishedWorkOrderRow
                key={order.wo_id}
                order={order}
                onConfirmed={fetchOrders}
                onRefuse={fetchOrders}
              />
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
