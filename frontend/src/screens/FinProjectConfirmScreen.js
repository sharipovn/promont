import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Tabs, Tab } from 'react-bootstrap';
import FinConfirmTab from '../components/FinConfirmTab';
import FinArchiveTab from '../components/FinArchiveTab';
import { FaFolderOpen, FaArchive } from 'react-icons/fa';
import './FinProjectConfirmScreen.css';
import { useI18n } from '../context/I18nProvider';

export default function FinProjectConfirmScreen() {
  const [key, setKey] = useState('confirm');
  const [refreshArchiveTab, setRefreshArchiveTab] = useState(false);
  const {returnTitle}=useI18n()

  return (
    <div className="container-fluid">
      <div className="d-flex" style={{ minHeight: '95vh' }}>
        {/* Sidebar */}
        <div style={{ width: '18%' }}>
          <Sidebar />
        </div>

        {/* Main Content */}
        <div style={{ width: '82%', padding: '1rem' }}>
          <div className="p-0">
            <Tabs
              activeKey={key}
              onSelect={(k) => setKey(k)}
              id="fin-tabs"
              className="custom-tabs"
            >
              <Tab eventKey="confirm" title={<span className="d-flex align-items-center gap-1"><FaFolderOpen size={16} /> {returnTitle('fin_confirm.confirming')}</span>}>
                  <FinConfirmTab
                    onProjectConfirmed={() => {
                      setRefreshArchiveTab(true);  // trigger archive refresh
                      setKey('archive');           // switch to archive tab
                    }}
                  />
                </Tab>

                <Tab eventKey="archive" title={<span className="d-flex align-items-center gap-1"><FaArchive size={16} /> {returnTitle('fin_confirm.archive')}</span>}>
                  <FinArchiveTab
                    refresh={refreshArchiveTab}
                    onRefreshHandled={() => setRefreshArchiveTab(false)}
                  />
                </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
