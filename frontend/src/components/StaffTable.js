import React, { useState } from 'react';
import { FaUserEdit } from 'react-icons/fa';
import { FaUmbrellaBeach } from 'react-icons/fa6';
import { useI18n } from '../context/I18nProvider';
import HoverText from './HoverText';
import EditStaffModal from './EditStaffModal';
import MakeVacationModal from './MakeVacationModal';
import MakeBusinessTripModal from './MakeBusinessTripModal'
import './TranslationTable.css';
import { FaCheckCircle } from "react-icons/fa";
import ProfileImage from './ProfileImage';
import { BiEdit } from "react-icons/bi";
import { MdWork } from "react-icons/md";
import { MdWorkOff } from "react-icons/md";
import { FaBusinessTime } from "react-icons/fa6";



export default function StaffTable({ staffList,onUpdated }) {
  const { returnTitle } = useI18n();

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [showBusinessTripModal, setShowBusinessTripModal] = useState(false);

  return (
    <>
      <div
        className="table-responsive rounded-4 custom-scroll"
        style={{
          backgroundColor: '#2e3a4b',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          maxHeight: '75vh',
        }}
      >
        <table className="custom-dark-table w-100">
          <thead>
            <tr className="text-uppercase small">
              <th>{returnTitle('staff.photo')}</th>
              <th className="ps-4">{returnTitle('staff.fio')}</th>
              <th>{returnTitle('staff.position')}</th>
              <th>{returnTitle('staff.position_start_date')}</th>
              <th>{returnTitle('staff.department')}</th>
              
              <th>{returnTitle('staff.birthday')}</th>
              <th>{returnTitle('staff.address')}</th>
              <th>{returnTitle('staff.vocation')}</th>
              <th>{returnTitle('staff.on_vocation_start')}</th>
              <th>{returnTitle('staff.on_vocation_end')}</th>
              <th>{returnTitle('staff.on_business_trip')}</th>
              <th>{returnTitle('staff.on_business_trip_start')}</th>
              <th>{returnTitle('staff.on_business_trip_end')}</th>
              <th>{returnTitle('staff.pnfl')}</th>
              <th>{returnTitle('staff.phone_number')}</th>
              <th className="text-center" style={{ width: '100px' }}>{returnTitle('staff.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map(staff => (
              <tr key={staff.user_id}>
                <td className="py-3 text-center">
                    <ProfileImage src={staff.profile_image} size={100} />
                  </td>
                <td className="ps-4 py-3 fw-semibold text-info"><HoverText>{staff?.fio}</HoverText></td>
                <td className="py-3">{staff?.position?.position_name || '—'}</td>
                <td className="py-3">{staff?.position_start_date || '—'}</td>
                <td className="py-3">{staff?.department?.department_name || '—'}</td>
                <td className="py-3">{staff?.birthday || '—'}</td>
                <td className="py-3"><HoverText>{staff?.address || '—'}</HoverText></td>
                <td className="py-3 text-center">
                  {staff.on_vocation ? (
                    <FaCheckCircle className="text-warning" size={'1rem'} title={returnTitle('staff.on_vocation')} />
                  ) : (
                    '—'
                  )}
                </td>

                <td className="py-3">{staff?.on_vocation_start || '—'}</td>
                <td className="py-3">{staff?.on_vocation_end || '—'}</td>
                                <td className="py-3 text-center">
                  {staff.on_business_trip ? (
                    <FaCheckCircle className="text-info" size={'1rem'} title={returnTitle('staff.on_business_trip')} />
                  ) : (
                    '—'
                  )}
                </td>

                <td className="py-3">{staff?.on_business_trip_start || '—'}</td>
                <td className="py-3">{staff?.on_business_trip_end || '—'}</td>
                <td className="py-3">{staff?.pnfl || '—'}</td>
                <td className="py-3">{staff?.phone_number || '—'}</td>
               <td className="text-center py-3">
                <div className="d-flex justify-content-center gap-2">
                  <button
                    className="edit-btn-icon text-warning"
                    title={returnTitle('staff.edit')}
                    onClick={() => {
                      setSelectedStaff(staff);
                      setShowEditModal(true);
                    }}
                  >
                    <BiEdit size={16} />
                  </button>
                  <button
                    className="edit-btn-icon  text-success"
                    title={staff.on_vacation ? returnTitle('staff.remove_vacation') : returnTitle('staff.make_vacation')}
                    onClick={() => {
                      setSelectedStaff(staff);
                      setShowVacationModal(true);
                    }}
                  >
                    <MdWorkOff size={16} />
                  </button>
                  <button
                    className="edit-btn-icon  text-info"
                    title={staff.on_business_trip ? returnTitle('staff.remove_business_trip') : returnTitle('staff.make_on_business_trip')}
                    onClick={() => {
                      setSelectedStaff(staff);
                      setShowBusinessTripModal(true);
                    }}
                  >
                    <FaBusinessTime size={16} />
                  </button>
                </div>
              </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {selectedStaff && showEditModal && (
        <EditStaffModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          staff={selectedStaff}
          onUpdated={onUpdated} // ✅ trigger refetch
        />
      )}

      {selectedStaff && showVacationModal && (
        <MakeVacationModal
          show={showVacationModal}
          onHide={() => setShowVacationModal(false)}
          staff={selectedStaff}
          onUpdated={onUpdated} // ✅ trigger refetch
        />
      )}

      {selectedStaff && showBusinessTripModal && (
        <MakeBusinessTripModal
          show={showBusinessTripModal}
          onHide={() => setShowBusinessTripModal(false)}
          staff={selectedStaff}
          onUpdated={onUpdated} // ✅ trigger refetch
        />
      )}
    </>
  );
}
