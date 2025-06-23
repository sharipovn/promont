import Sidebar from '../components/Sidebar';
import TaskManagementComponent from '../components/TaskManagementComponent';

export default function WorkWithStaffScreen() {
  return (
    <div className="container-fluid">
      <div className="d-flex" style={{ minHeight: '95vh' }}>
        <div style={{ width: '18%' }}>
          <Sidebar />
        </div>
        <div style={{ width: '82%', padding: '1rem'}}>
          <TaskManagementComponent />
        </div>
      </div>
    </div>
  );
}
