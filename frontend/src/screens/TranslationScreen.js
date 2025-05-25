import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import CustomPagination from '../components/CustomPagination';
import AddTranslationModal from '../components/AddTranslationModal';
import TranslationTable from '../components/TranslationTable';
 
import { Button } from 'react-bootstrap';
import './FinProjectConfirmScreen.css';
import { useI18n } from '../context/I18nProvider';

export default function TranslationScreen() {
  const [translations, setTranslations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const { returnTitle } = useI18n();

  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [
    navigate, setUser, setAccessToken
  ]);

  const fetchTranslations = useCallback(() => {
    axiosInstance
      .get('/manage-translations/', { params: { page: currentPage } })
      .then((res) => {
        setTranslations(res.data.results);
        setTotalPages(Math.ceil(res.data.count /15));
      })
      .catch((err) => console.error('❌ Failed to fetch translations:', err));
  }, [axiosInstance, currentPage]);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations, currentPage]);

  return (
    <>
      <div className="container-fluid">
        <div className="d-flex" style={{ minHeight: '95vh' }}>
          <div style={{ width: '18%' }}>
            <Sidebar />
          </div>
          <div style={{ width: '82%', padding: '1rem' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-info mb-0">{returnTitle('internalization.translation_list')}</h5>
              <Button variant="primary" className="financial-action-btn send-btn" onClick={() => setShowAddModal(true)}>
                + {returnTitle('internalization.add_translations')}
              </Button>
            </div>

            <div className="custom-scroll d-flex flex-column gap-2 px-1" style={{ height: '75vh', overflowY: 'auto' }}>
              <TranslationTable translations={translations} onUpdated={fetchTranslations} />
            </div>

            <div className="d-flex justify-content-center mt-4">
              <CustomPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        </div>
      </div>
      <AddTranslationModal show={showAddModal} onHide={() => setShowAddModal(false)} onCreated={fetchTranslations} />
    </>
  );
}
