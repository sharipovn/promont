import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import CustomPagination from '../components/CustomPagination';
import { CiSearch } from "react-icons/ci";
import { useI18n } from '../context/I18nProvider';
import './FinProjectConfirmScreen.css';
import './TranslationScreen.css';
import StaffTable from '../components/StaffTable';
import Alert from '../components/Alert'



export default function StaffManagementScreen() {
  const [staffList, setStaffList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error,setError]=useState('');

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const { returnTitle } = useI18n();

  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [
    navigate, setUser, setAccessToken
  ]);

  const fetchStaff = useCallback(() => {
    axiosInstance.get('/manage-staff/staff-users/', {
      params: {
        page: currentPage,
        search: searchQuery || undefined
      }
    })
    .then(res => {
      setStaffList(res.data.results);
      setTotalCount(res.data.count);
      setTotalPages(Math.ceil(res.data.count / 15));
      setError('')
    })
    .catch(err => {
      setError(`❌ ${returnTitle('staff.fetch_failed')}`)
      console.error('❌ Failed to fetch staff:', err);
    });
  }, [axiosInstance, currentPage, searchQuery]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return (
    <div className="container-fluid">
      <div className="d-flex" style={{ minHeight: '95vh' }}>
        <div style={{ width: '18%' }}>
          <Sidebar />
        </div>
        <div style={{ width: '82%', padding: '1rem' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-info mb-0">{returnTitle('staff.staff_list')} ({totalCount})</h5>
            {error && <Alert type="info" message={error} />}
            <div className="translation-search-wrapper">
              <CiSearch className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCurrentPage(1);
                    fetchStaff();
                  }
                }}
                className="translation-search-input"
                placeholder={`${returnTitle('staff.search_by_fio')} . . .`}
              />
            </div>
          </div>

          <div className="custom-scroll d-flex flex-column gap-2 px-1" style={{ height: '75vh', overflowY: 'auto' }}>
            <StaffTable staffList={staffList} onUpdated={fetchStaff}/>
          </div>

          <div className="d-flex justify-content-center mt-4">
            <CustomPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
