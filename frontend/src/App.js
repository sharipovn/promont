import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen'; // optional
import FinProjectConfirmScreen from './screens/FinProjectConfirmScreen'; // optional
import CreateProjectScreen from './screens/CreateProjectScreen'; // optional
import VerifyTechDirScreen from './screens/VerifyTechDirScreen'; // optional
import NoAccessScreen from './screens/NoAccessScreen';
import AddOrganisationScreen from './screens/AddOrganisationScreen';
import AddDepartmentScreen from './screens/AddDepartmentScreen';
import TranslationScreen from './screens/TranslationScreen';
import CreateTechnicalPartsScreen from './screens/CreateTechnicalPartsScreen';
import CreateWorkOrderScreen from './screens/CreateWorkOrderScreen';
import CompleteWorkOrderScreen from './screens/CompleteWorkOrderScreen';
import ConfirmFinishedWorkOrderScreen from './screens/ConfirmFinishedWorkOrderScreen';
import StaffManagementScreen from './screens/StaffManagementScreen';
import WorkWithStaffScreen from './screens/WorkWithStaffScreen';



import PrivateRoute from './context/PrivateRoute';
import { PERMISSIONS } from './constants/permissions';




export default function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<LoginScreen />} />
      <Route path="/dashboard" element={<PrivateRoute requiredCapabilities={[
                                                          PERMISSIONS.CAN_VIEW,
                                                        ]}><DashboardScreen /></PrivateRoute>} />
      <Route path="/create-project" element={<PrivateRoute requiredCapabilities={[
                                                          PERMISSIONS.CAN_VIEW,PERMISSIONS.CAN_CREATE_PROJECT
                                                        ]}><CreateProjectScreen /></PrivateRoute>} />
      <Route path="/confirm-project-financier" element={<PrivateRoute requiredCapabilities={[
                                                          PERMISSIONS.CAN_VIEW,PERMISSIONS.CAN_CONFIRM_PROJECT_FINANCIER
                                                        ]}><FinProjectConfirmScreen /></PrivateRoute>} />
      <Route path="/tech-dir-check-and-attach-gip" element={<PrivateRoute requiredCapabilities={[
                                                          PERMISSIONS.CAN_VIEW,PERMISSIONS.CAN_CHECK_AND_GIP_ATTACH
                                                        ]}><VerifyTechDirScreen /></PrivateRoute>} />
      <Route path="/add-partners" element={<PrivateRoute requiredCapabilities={[
                                                          PERMISSIONS.CAN_VIEW,PERMISSIONS.CAN_ADD_PARTNERS
                                                        ]}><AddOrganisationScreen /></PrivateRoute>} />
      <Route path="/add-departments" element={<PrivateRoute requiredCapabilities={[
                                                          PERMISSIONS.CAN_VIEW,PERMISSIONS.CAN_ADD_DEPARTMENTS
                                                        ]}><AddDepartmentScreen /></PrivateRoute>} />
      <Route path="/manage-internalization" element={<PrivateRoute requiredCapabilities={[
                                                          PERMISSIONS.CAN_VIEW,PERMISSIONS.CAN_MANAGE_TRANSLATIONS
                                                        ]}><TranslationScreen /></PrivateRoute>} />
      <Route path="/manage-technical-parts" element={<PrivateRoute requiredCapabilities={[
                                                          PERMISSIONS.CAN_VIEW,PERMISSIONS.CAN_CREATE_TECH_PARTS
                                                        ]}><CreateTechnicalPartsScreen /></PrivateRoute>} />
      <Route path="/manage-work-orders" element={<PrivateRoute requiredCapabilities={[
                                                          PERMISSIONS.CAN_VIEW,PERMISSIONS.CAN_CREATE_WORK_ORDER
                                                        ]}><CreateWorkOrderScreen /></PrivateRoute>} />
      <Route path="/complete-work-order" element={<PrivateRoute requiredCapabilities={[
                                                          PERMISSIONS.CAN_VIEW,PERMISSIONS.CAN_COMPLETE_WORK_ORDER
                                                        ]}><CompleteWorkOrderScreen /></PrivateRoute>} />
      <Route path="/confirm-finished-work-orders" element={<PrivateRoute requiredCapabilities={[
                                                          PERMISSIONS.CAN_VIEW,PERMISSIONS.CAN_CONFIRM_FINISHED_WORK_ORDER
                                                        ]}><ConfirmFinishedWorkOrderScreen /></PrivateRoute>} />
      <Route path="/staff-management" element={<PrivateRoute requiredCapabilities={[
                                                          PERMISSIONS.CAN_VIEW,PERMISSIONS.CAN_MANAGE_STAFF
                                                        ]}><StaffManagementScreen /></PrivateRoute>} />
      <Route path="/work-with-staff" element={<PrivateRoute requiredCapabilities={[
                                                          PERMISSIONS.CAN_VIEW,PERMISSIONS.CAN_WORK_WITH_STAFF
                                                        ]}><WorkWithStaffScreen /></PrivateRoute>} />
                                                        
      <Route path="/noaccess" element={<PrivateRoute><NoAccessScreen /></PrivateRoute>} />
    </Routes>
    </Router>
  );
}
