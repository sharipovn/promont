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
import { useI18n } from '../context/I18nProvider';
import { withValidation } from '../utils/withValidation';





export default function CreateProjectScreen() {
  const {  setAccessToken, setUser } = useAuth();
  const { returnTitle } = useI18n();
  const navigate = useNavigate();
  const axiosInstance = useMemo(() => {
    return createAxiosInstance(navigate, setUser, setAccessToken);
  }, [navigate, setUser, setAccessToken]);

  const [partnerOptions, setPartnerOptions] = useState([]);
  const [financierOptions, setFinancierOptions] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const [form, setForm] = useState({
    project_name: '',
    total_price: '',
    start_date: '',
    end_date: '',
    financier: null,
    partner: null, // ✅ single partner
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
      partner: form.partner?.value || null, // ✅ send partner_code
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


  useEffect(() => {
    axiosInstance.get('/partners/').then((res) => {
      const options = res.data.results.map((p) => ({
        value: p.partner_code,
        label: `${p.partner_name} (${p.partner_inn})`,
      }));
      setPartnerOptions(options);
    }).catch((err) => {
        setMessage('❌ Server error occurred.' + err);
        setMessageType('danger');
        console.error('Error loading partners list:', err);
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
                {returnTitle('create_proj.create_new_project')}
              </h4>
            </div>

            {message && <Alert type={messageType} message={message} />}
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <div className="mb-5">
                  <div className="d-flex align-items-center gap-2" style={{ color: '#8898aa' }}>
                    <BiSolidInfoCircle />
                    <h6 className="text-uppercase fw-bold small mb-0">{returnTitle('create_proj.project_info')}</h6>
                  </div>
                  <hr style={{ borderTop: '1px solid #344a6d', marginTop: '6px' }} />
                </div>

                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center gap-2" style={{ color: '#525f8d' }}>
                      <FaFileAlt style={{ color: '#525f8d' }} /> {returnTitle('create_proj.project_name')}
                    </label>
                    <input
                      type="text"
                      className="form-control text-success"
                      name="project_name"
                      value={form.project_name}
                      onChange={handleChange}
                      placeholder={returnTitle('app.e.g.')+": Energiya Monitoringi"}
                      {...withValidation(returnTitle('create_proj.project_name_required'))}
                      required
                      style={{ borderRadius: 0, fontFamily: 'inherit' }}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center gap-2" style={{ color: '#525f8d' }}>
                      <FaMoneyBill style={{ color: '#525f8d' }} /> {returnTitle('create_proj.total_price')} ({returnTitle('create_proj.uzs')})
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control text-success"
                      name="total_price"
                      value={form.total_price}
                      onChange={handleChange}
                      placeholder={returnTitle('app.e.g.')+": 50 000 000"}
                      {...withValidation(returnTitle('create_proj.total_price_required'))}
                      required
                      style={{ borderRadius: 0, fontFamily: 'Exo2Variable', fontStyle: 'regular', fontSize: '1.2rem' }}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-5 mt-5">
                <div className="mb-5">
                  <div className="d-flex align-items-center gap-2" style={{ color: '#8898aa' }}>
                    <HiCalendarDateRange />
                    <h6 className="text-uppercase fw-bold small mb-0">{returnTitle('create_proj.period')}</h6>
                  </div>
                  <hr style={{ borderTop: '1px solid #344a6d', marginTop: '6px' }} />
                </div>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center gap-2" style={{ color: '#525f8d' }}>
                      <FaCalendarAlt style={{ color: '#525f8d' }} /> {returnTitle('app.start_date')}
                    </label>
                    <input
                      type="date"
                      className="form-control text-success"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      {...withValidation(returnTitle('app.start_date_required'))}
                      required
                      style={{ borderRadius: 0, fontFamily: 'inherit' }}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center gap-2" style={{ color: '#525f8d' }}>
                      <FaCalendarAlt style={{ color: '#525f8d' }} />{returnTitle('app.end_date')}
                    </label>
                    <input
                      type="date"
                      className="form-control text-success"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      {...withValidation(returnTitle('app.end_date_required'))}
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
                    <h6 className="text-uppercase fw-bold small mb-0">{returnTitle('create_proj.financier')}</h6>
                  </div>
                  <hr style={{ borderTop: '1px solid #344a6d', marginTop: '6px' }} />
                </div>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center gap-2" style={{ color: '#525f8d' }}>
                      <FaUserTie style={{ color: '#525f8d' }} /> {returnTitle('create_proj.select_financier')}
                    </label>
                    <Select
                      options={financierOptions}
                      value={form.financier}
                      onChange={(selectedOption) => setForm({ ...form, financier: selectedOption })}
                      placeholder={returnTitle('create_proj.select_financier')}
                      className="text-primary-emphasis"
                      required
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

                  <div className="col-md-6">
                      <label className="form-label d-flex align-items-center gap-2" style={{ color: '#525f8d' }}>
                        <MdAccountBalanceWallet style={{ color: '#525f8d' }} /> {returnTitle('create_proj.select_partner')}
                      </label>
                      <Select
                        options={partnerOptions}
                        value={form.partner}
                        onChange={(selected) => setForm({ ...form, partner: selected })}
                        placeholder={returnTitle('create_proj.select_partner')}
                        className="text-primary-emphasis"
                        isClearable
                        required
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: 45,
                            borderRadius: 0,
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
                  {returnTitle('app.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
