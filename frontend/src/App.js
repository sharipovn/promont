import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen'; // optional
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
      <Route path="/noaccess" element={<PrivateRoute><NoAccessScreen /></PrivateRoute>} />
    </Routes>
    </Router>
  );
}
