import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GoogleLoginButton from './components/GoogleLoginButton';
import GoogleCallback from './pages/GoogleCallback';
import Login from './pages/Auth/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home/Home';
import Register from './pages/Auth/Register/Register';
import LoginSuccess from './pages/Auth/Login/LoginSuccess';
import ForgotPassword from './pages/Auth/Password/ForgotPassword';
import ResetPassword from './pages/Auth/Password/ResetPassword';
import LoginAdmin from './pages/Auth/Login/LoginAdmin';
import LoginManager from './pages/Auth/Login/LoginManager';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ManagerDashboard from './pages/Dashboard/ManagerDashboard';
import VolunteerDashboard from './pages/Dashboard/VolunteerDashboard';
import EventsApproval from './pages/Dashboard/Admin-Crud/EventsApproval';
import EventsPage from './pages/Events/EventsPage';
import EventDetailPage from './pages/Events/EventDetailPage';
import EventWallPage from './components/features/communication/EventWall';


function App() {
    return (
        <Router>
            <Routes>
                {/* <Route path="/" element={<GoogleLoginButton />} /> */}
                <Route path="/login" element={<Login />} />
                <Route path="/login-success" element={<LoginSuccess />} />

                <Route path="/dashboard" element={<ProtectedRoute> <Dashboard /></ProtectedRoute>} />
                <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
                {/* <Route path="/dashboard" element={ <Dashboard />}/> */}
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/event/:id" element={<EventDetailPage />} />
                <Route path="/event/:id/wall" element={<EventWallPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin/login" element={<LoginAdmin />} />
                <Route path="/manager/login" element={<LoginManager />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                <Route path="/admin/event-approvals" element={<EventsApproval />} />


                <Route path="/google/callback" element={<GoogleCallback />} />
            </Routes>
        </Router>
    );
}

export default App;
