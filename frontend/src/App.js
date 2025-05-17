import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen'; // optional
import FinProjectConfirmScreen from './screens/FinProjectConfirmScreen'; // optional
import CreateProjectScreen from './screens/CreateProjectScreen'; // optional
import NoAccessScreen from './screens/NoAccessScreen';
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
      <Route path="/noaccess" element={<PrivateRoute><NoAccessScreen /></PrivateRoute>} />
    </Routes>
    </Router>
  );
}
