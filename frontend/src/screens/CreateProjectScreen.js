import React, { useState, useEffect,useMemo } from 'react';
import { useAuth } from '../context/AuthProvider';
import Sidebar from '../components/Sidebar';
import Alert from '../components/Alert';
import Select from 'react-select';
import { FaFileAlt, FaMoneyBill, FaCalendarAlt, FaUserTie } from 'react-icons/fa';
import { HiCalendarDateRange } from "react-icons/hi2";
import { BiSolidInfoCircle } from "react-icons/bi";
import { GrProjects } from "react-icons/gr";
import { MdAccountBalanceWallet, MdCreateNewFolder } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { createAxiosInstance } from '../utils/createAxiosInstance';




export default function CreateProjectScreen() {
  const {  setAccessToken, setUser } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(() => {
    return createAxiosInstance(navigate, setUser, setAccessToken);
  }, [navigate, setUser, setAccessToken]);
  const [financierOptions, setFinancierOptions] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const [form, setForm] = useState({
    project_name: '',
    total_price: '',
    start_date: '',
    end_date: '',
    financier: null,
  });

  const formatNumber = (value) =>
    value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'total_price') {
      const formatted = formatNumber(value);
      setForm({ ...form, [name]: formatted });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      total_price: parseInt(form.total_price.replace(/\s/g, ''), 10),
      financier: form.financier?.value || null,
    };

    try {
      const res = await axiosInstance.post('/create-project/', payload);
      setMessage('✅ Project successfully created!');
      setMessageType('success');
      console.log('✅ Project created:', res.data);
    } catch (err) {
      const msg = err.response?.data || '❌ Server error occurred.';
      setMessage(`❌ Error: ${JSON.stringify(msg)}`);
      setMessageType('danger');
      console.error('❌ Failed to create project:', err);
    }
  };

  useEffect(() => {
    axiosInstance.get('/users-with-capability/?capability=CAN_CONFIRM_PROJECT_FINANCIER')
      .then((res) => {
        const options = res.data.map((user) => ({
          value: user.user_id,
          label: `${user.fio} (${user.position || '---'})`,
        }));
        setFinancierOptions(options);
      })
      .catch((err) => {
        setMessage('❌ Server error occurred.' + err);
        setMessageType('danger');
        console.error('Error loading financier list:', err);
      });
  }, [axiosInstance]);

  return (
    <div className="container-fluid">
      <div className="d-flex" style={{ minHeight: '95vh' }}>
        <div style={{ width: '18%' }}>
          <Sidebar />
        </div>

        <div style={{ width: '82%', height: '95vh', marginTop: '10px' }} className="d-flex justify-content-center align-items-start">
          <div className="bg-white rounded-4 shadow p-5 w-100 h-100 border" style={{ fontFamily: 'inherit' }}>
            <div className="mb-5">
              <h4 className="fw-bold mb-5" style={{ color: '#344a6d' }}>
                <span className="me-3"><GrProjects /></span>
                Create New Project
              </h4>
            </div>

            {message && <Alert type={messageType} message={message} />}
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <div className="mb-5">
                  <div className="d-flex align-items-center gap-2" style={{ color: '#8898aa' }}>
                    <BiSolidInfoCircle />
                    <h6 className="text-uppercase fw-bold small mb-0">Project Info</h6>
                  </div>
                  <hr style={{ borderTop: '1px solid #344a6d', marginTop: '6px' }} />
                </div>

                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center gap-2" style={{ color: '#525f8d' }}>
                      <FaFileAlt style={{ color: '#525f8d' }} /> Project Name
                    </label>
                    <input
                      type="text"
                      className="form-control text-success"
                      name="project_name"
                      value={form.project_name}
                      onChange={handleChange}
                      placeholder="Masalan: Energiya Monitoringi"
                      required
                      style={{ borderRadius: 0, fontFamily: 'inherit' }}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center gap-2" style={{ color: '#525f8d' }}>
                      <FaMoneyBill style={{ color: '#525f8d' }} /> Total Price (UZS)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control text-success"
                      name="total_price"
                      value={form.total_price}
                      onChange={handleChange}
                      placeholder="Masalan: 50 000 000"
                      required
                      style={{ borderRadius: 0, fontFamily: 'monospace', fontStyle: 'regular', fontSize: '1.2rem' }}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-5 mt-5">
                <div className="mb-5">
                  <div className="d-flex align-items-center gap-2" style={{ color: '#8898aa' }}>
                    <HiCalendarDateRange />
                    <h6 className="text-uppercase fw-bold small mb-0">Period</h6>
                  </div>
                  <hr style={{ borderTop: '1px solid #344a6d', marginTop: '6px' }} />
                </div>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center gap-2" style={{ color: '#525f8d' }}>
                      <FaCalendarAlt style={{ color: '#525f8d' }} /> Start Date
                    </label>
                    <input
                      type="date"
                      className="form-control text-success"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: 0, fontFamily: 'inherit' }}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center gap-2" style={{ color: '#525f8d' }}>
                      <FaCalendarAlt style={{ color: '#525f8d' }} /> End Date
                    </label>
                    <input
                      type="date"
                      className="form-control text-success"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: 0, fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="mb-5">
                  <div className="d-flex align-items-center gap-2" style={{ color: '#8898aa' }}>
                    <MdAccountBalanceWallet />
                    <h6 className="text-uppercase fw-bold small mb-0">Financier</h6>
                  </div>
                  <hr style={{ borderTop: '1px solid #344a6d', marginTop: '6px' }} />
                </div>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center gap-2" style={{ color: '#525f8d' }}>
                      <FaUserTie style={{ color: '#525f8d' }} /> Select Financier
                    </label>
                    <Select
                      options={financierOptions}
                      value={form.financier}
                      onChange={(selectedOption) => setForm({ ...form, financier: selectedOption })}
                      placeholder="Financierni tanlang"
                      className="text-primary-emphasis"
                      isClearable
                      styles={{
                        control: (base) => ({
                          ...base,
                          height: 45,
                          borderRadius: 0,
                          borderColor: '#ced4da',
                          fontFamily: 'inherit'
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: '#999',
                          fontFamily: 'inherit'
                        }),
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-start mt-5">
                <button
                  type="submit"
                  className="btn custom-create-btn d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold bg-success text-white"
                >
                  <MdCreateNewFolder size={16} />
                  Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
