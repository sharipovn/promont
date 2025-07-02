import React, { useState } from 'react';
import './AdminLogAudit.css';
import { useI18n } from '../context/I18nProvider';
import { FaFolderOpen, FaUserAlt, FaLock } from 'react-icons/fa';
import ProjectLogTable from './ProjectLogTable';
import UserLogTable from './UserLogTable';
import RoleLogTable from './RoleLogTable';

function AdminLogAudit() {
  const [activeTab, setActiveTab] = useState('projects');
  const { returnTitle } = useI18n();

  return (
    <div className="container-fluid text-light py-4">
      <h4 className="mb-4">
        <FaFolderOpen className="me-2" />
        {returnTitle('audit_log.title')}
      </h4>

      <div className="d-flex gap-3 mb-4">
        <button
          className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-outline-primary'} d-flex align-items-center gap-2`}
          onClick={() => setActiveTab('projects')}
        >
          <FaFolderOpen />
          {returnTitle('audit_log.projects')}
        </button>
        <button
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline-primary'} d-flex align-items-center gap-2`}
          onClick={() => setActiveTab('users')}
        >
          <FaUserAlt />
          {returnTitle('audit_log.users')}
        </button>
        <button
          className={`btn ${activeTab === 'roles' ? 'btn-primary' : 'btn-outline-primary'} d-flex align-items-center gap-2`}
          onClick={() => setActiveTab('roles')}
        >
          <FaLock />
          {returnTitle('audit_log.roles')}
        </button>
      </div>

      <div className="p-4 rounded" style={{ backgroundColor: '#2e3a4b', border: '1px solid #444' }}>
        {activeTab === 'projects' && <ProjectLogTable />}
        {activeTab === 'users' && <UserLogTable />}
        {activeTab === 'roles' && <RoleLogTable />}
      </div>
    </div>
  );
}

export default AdminLogAudit;
