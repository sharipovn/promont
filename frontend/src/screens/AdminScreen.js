// AdminScreen.js
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useI18n } from '../context/I18nProvider';
import AdminUsers from '../components/AdminUsers';
import AdminRoles from '../components/AdminRoles';
import AdminLogAudit from '../components/AdminLogAudit';
import AdminPermissions from '../components/AdminPermissions';
import './AdminScreen.css';
import { TiThMenuOutline } from "react-icons/ti";
import { FaUserShield } from "react-icons/fa";
import { SiGooglecampaignmanager360 } from "react-icons/si";
import { MdManageHistory } from "react-icons/md";




export default function AdminScreen() {
  const { returnTitle } = useI18n();
  const [activeTab, setActiveTab] = useState('users');

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <AdminUsers />;
      case 'logs':
        return <AdminLogAudit />;
      case 'roles':
        return <AdminRoles />;
      case 'permissions':
        return <AdminPermissions />;
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex" style={{ minHeight: '95vh' }}>
        {/* Sidebar */}
        <div style={{ width: '18%' }}>
          <Sidebar />
        </div>

        {/* Main Content */}
        <div style={{ width: '82%', padding: '1rem' }}>
          <div className="row">
            {/* Menu List */}
            <div className="col-2">
                <div
                    className="admin-menu-wrapper custom-scrollbar"
                    style={{
                    border: '1px solid #444',
                    borderRadius: '8px',
                    backgroundColor: '#1c1e2a',
                    padding: '0.5rem',
                    height: '94vh',
                    overflowY: 'auto'
                    }}
                >
                    <h6 className="text-light mb-3 mt-2 px-2 d-flex align-items-center gap-2">
                    <TiThMenuOutline size={20} /> {returnTitle('admin_panel.admin_panel')}
                    </h6>

                    <div className="list-group admin-menu">
                   <button
                    className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                    >
                    <FaUserShield size={16} /> {returnTitle('admin_panel.users')}
                    </button>
                    <button
                    className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                    >
                    <FaUserShield size={16} /> {returnTitle('admin_panel.audit_logs')}
                    </button>
                    <button
                    className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeTab === 'roles' ? 'active' : ''}`}
                    onClick={() => setActiveTab('roles')}
                    >
                    <SiGooglecampaignmanager360 size={16} /> {returnTitle('admin_panel.roles')}
                    </button>
                    <button
                    className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeTab === 'permissions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('permissions')}
                    >
                    <MdManageHistory size={18} /> {returnTitle('admin_panel.permissions')}
                    </button>
                    </div>
                </div>
                </div>


            {/* Content Area */}
            <div
              className="col-10 admin-content-area fade-in custom-scrollbar"
              style={{
                border: '1px solid #444',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: '#2a2d3e',
                height: '94vh',
                overflowY: 'auto'
              }}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
