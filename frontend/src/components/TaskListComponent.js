import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useI18n } from '../context/I18nProvider';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import Alert from './Alert';
import TaskItem from './TaskItem';
import './TaskListComponent.css';
import { useNavigate } from 'react-router-dom';
import { CiSearch } from 'react-icons/ci';


export default function TaskListComponent({setRefetchFn, onTaskSelect}) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('not_done');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  const fetchTasks = useCallback(() => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams({
      status: activeTab,
    });

    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }

    axiosInstance
      .get(`/user-tasks/list/?${params.toString()}`)
      .then((res) => {
        setTasks(res.data);
        setError('');
      })
      .catch((err) => {
        console.error('❌ Task fetch error:', err);
        setError(`❌ ${returnTitle('task.fetch_task_list_failed')}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeTab, axiosInstance, searchQuery]);


  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

    useEffect(() => {
    console.log('📌 Setting refetch function');
    if (setRefetchFn) {
        setRefetchFn(() => {
        console.log('📥 External fetchTasks triggered');
        fetchTasks();
        });
    }
    }, [setRefetchFn, fetchTasks]);


  // Silent
  useEffect(() => {
    const interval = setInterval(() => {
      axiosInstance
        .get(`/user-tasks/list/?status=${activeTab}${searchQuery.trim() ? `&search=${searchQuery.trim()}` : ''}`)
        .then((res) => {
          setTasks(res.data);
        })
        .catch((err) => {
          console.error('❌ Silent fetch failed:', err);
          // Silent: don't call setError here
        });
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, [activeTab, searchQuery, axiosInstance]);


  return (
    <div className="task-list-container">
      <div className="task-tabs">
        <button
          className={activeTab === 'not_done' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('not_done')}
        >
          {returnTitle('task.not_done')}
        </button>
        <button
          className={activeTab === 'done' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('done')}
        >
          {returnTitle('task.done')}
        </button>
      </div>

      {error && <Alert type="danger" message={error} />}
      <div className="d-flex align-items-center border border-secondary rounded-3 px-3 mb-2 mx-2 mt-2" style={{ backgroundColor: '#242f3d' }}>
        <CiSearch className="me-2 text-light" />
        <input
            style={{ backgroundColor: '#242f3d' }}
            type="text"
            className="form-control border-0 text-white p-1 search-input"
            placeholder={`${returnTitle('task.search_by_receiver_sender_task_no_title')} . . .`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') fetchTasks();
            }}
          />

      </div>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
          <div
            className="spinner-border text-info"
            role="status"
            style={{ width: '5rem', height: '5rem', borderWidth: '0.2em', opacity: 0.75 }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="task-list-scroll custom-scroll">
          {tasks.map((task) => (
            <TaskItem
              key={task.task_id}
              task={task}
              onUpdated={fetchTasks}
              onClick={() => onTaskSelect?.(task)} // 👈 pass selected task up
            />
          ))}
        </div>
      )}
    </div>
  );
}
