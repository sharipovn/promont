import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import OrganisationRow from '../components/OrganisationRow';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import CustomPagination from '../components/CustomPagination';
import AddOrganisationModal from '../components/AddOrganisationModal'; // ✅ Import modal
import { Button } from 'react-bootstrap';
import './FinProjectConfirmScreen.css';
import { useI18n } from '../context/I18nProvider';




export default function AddOrganisationScreen() {
  const [organisations, setOrganisations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddOrganisationModal, setShowAddOrganisationModal] = useState(false); // ✅ Rename 
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const {returnTitle } = useI18n(); // ✅ include returnTitle

  const axiosInstance = useMemo(() => {
    return createAxiosInstance(navigate, setUser, setAccessToken);
  }, [navigate, setUser, setAccessToken]);

  // ✅ useCallback to prevent warning
  const fetchOrganisations = useCallback(() => {
    axiosInstance
      .get('/partners/', {
        params: { page: currentPage }
      })
      .then((res) => {
        setOrganisations(res.data.results);
        setTotalPages(Math.ceil(res.data.count / 8));
      })
      .catch((err) => {
        console.error('❌ Failed to fetch organisations:', err);
      });
  }, [axiosInstance, currentPage]);

  useEffect(() => {
    fetchOrganisations();
  }, [fetchOrganisations,currentPage]);

  return (
    <>
    <div className="container-fluid">
      <div className="d-flex" style={{ minHeight: '95vh' }}>
        <div style={{ width: '18%' }}>
          <Sidebar />
        </div>

        <div style={{ width: '82%', padding: '1rem' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-info mb-0">{returnTitle('add_part.organisation_list')}</h5>
            <Button variant="primary" className="financial-action-btn send-btn" onClick={() => setShowAddOrganisationModal(true)} // ✅ Use new name
            >
              + {returnTitle('add_part.add_organisation')}
            </Button>
          </div>

          <div className="custom-scroll d-flex flex-column gap-2 px-1" style={{ height: '64vh', overflowY: 'auto' }}>
            {organisations.map((org) => (
              <OrganisationRow key={org.partner_code} org={org} />
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
    <AddOrganisationModal
        show={showAddOrganisationModal} // ✅ Updated here
        onHide={() => setShowAddOrganisationModal(false)} // ✅ Updated here
        onCreated={fetchOrganisations}
      />
    </>
  );
}
