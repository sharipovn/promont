import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { CiSearch } from 'react-icons/ci';
import { useI18n } from '../context/I18nProvider';
import './TaskSidebar.css';
import { FaRegCircle } from "react-icons/fa";
import Alert from './Alert';
import { Spinner } from 'react-bootstrap';
import StaffUserItem from './StaffUserItem';
import { FaPlus } from "react-icons/fa6";
import { FaStar } from 'react-icons/fa';





export default function TaskSidebar({onSelectStaff}) {
  const [departments, setDepartments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [myDepartmentId, setMyDepartmentId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedDepartments, setExpandedDepartments] = useState({});
  const [staffByDept, setStaffByDept] = useState({});
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  const { setUser, setAccessToken, user } = useAuth();
  const navigate = useNavigate();
  const { returnTitle } = useI18n();

  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get('/my-departments/tree/')
      .then(res => {
        const flatList = flattenDepartments(res.data.tree);
        const globalList = res.data.globals || [];
        const combined = [...flatList, ...globalList.map(g => ({ ...g, level: 0, isGlobal: true }))];
        setDepartments(combined);
        setMyDepartmentId(res.data.tree.department_id);
        setError('');
      })
      .catch(err => {
        console.error('❌ Failed to load departments:', err);
        setError('❌ ' + returnTitle('task.failed_to_load_departments'));
      })
      .finally(() => setLoading(false));
  }, [axiosInstance]);

  const flattenDepartments = (node, level = 0, list = []) => {
    list.push({ ...node, level });
    node.sub_departments?.forEach(child => flattenDepartments(child, level + 0, list));
    return list;
  };

 const toggleDepartment = async (deptId) => {
  const alreadyExpanded = expandedDepartments[deptId];

  // ❗ Har doim selectedStaffId ni tozalaymiz
  setSelectedStaffId(null);
  onSelectStaff(null);

  if (alreadyExpanded) {
    // Collapse current department
    setExpandedDepartments({});
  } else {
    // Expand new department
    if (!staffByDept[deptId]) {
      try {
        const res = await axiosInstance.get(`/staff/by-department/${deptId}/`);
        setStaffByDept(prev => ({ ...prev, [deptId]: res.data }));
      } catch (err) {
        console.error('❌ Failed to load staff users:', err);
      }
    }
    setExpandedDepartments({ [deptId]: true });
  }

  setSelectedId(deptId);
};


  const filteredDepartments = departments.filter(dep =>
    dep.department_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="task-sidebar-container d-flex flex-column">
      <div className="task-sidebar-header">{returnTitle('task.departments')}</div>

      {error && <Alert type="danger" message={error} />}
      {selectedStaffId && (
        <button
          className="btn btn-info m-2 mx-4 fw-semibold d-flex align-items-center justify-content-center gap-2"
          style={{ fontSize: '1.1rem' }}
          onClick={() => onSelectStaff && onSelectStaff('create-task')}
        >
          <FaPlus /> {returnTitle('task.create_task')}
        </button>
      )}


      <div className="d-flex align-items-center border border-secondary rounded-3 px-3 mb-2 mx-2 mt-2" style={{ backgroundColor: '#242f3d' }}>
        <CiSearch className="me-2 text-light" />
        <input
          style={{ backgroundColor: '#242f3d' }}
          type="text"
          className="form-control border-0 text-white p-1 search-input"
          placeholder={`${returnTitle('task.search_department')} . . .`}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {loading && <div className="text-center py-2"><Spinner animation="border" /></div>}

      <div className="task-sidebar-list custom-scroll px-2">
        <ul className="list-group list-group-flush">
          {filteredDepartments.map(dep => (
            <React.Fragment key={dep.department_id}>
              <li
                className={`list-group-item dept-item w-100
                  ${selectedId === dep.department_id ? 'active' : ''}
                  ${dep.department_id === myDepartmentId ? 'my-dept' : ''}`}
                onClick={() => toggleDepartment(dep.department_id)}
              >
                <span className="me-2"><FaRegCircle /></span>{dep.department_name}
                {dep.is_for_all && <FaStar className="ms-2 text-warning" />}
              </li>

              {expandedDepartments[dep.department_id] && staffByDept[dep.department_id]?.length > 0 && (
                <ul className="list-group my-1">
                  {staffByDept[dep.department_id]
                    .filter(staff => staff.username !== user?.username)
                    .map(staff => (
                      <StaffUserItem
                        key={staff.user_id}
                        staff={staff}
                        isActive={selectedStaffId === staff.user_id}
                       onClick={() => {
                              setSelectedStaffId(staff.user_id);
                              onSelectStaff(staff);
                            }}
                      />
                    ))}
                </ul>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}
