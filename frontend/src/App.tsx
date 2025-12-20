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
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import EventsApproval from './pages/Dashboard/Admin-Crud/EventsApproval';
import UserManagement from './pages/Dashboard/Admin-Crud/UserManagement';
import EventDetail from './pages/Home/Eventdetail';
import Profile from './pages/Home/Profile';
import VolunteerDashboard from './pages/Home/VolunteerDashboard';
import BrowseEvents from './pages/Home/BrowseEvents';
import MyEvents from './pages/Manager/MyEvents';
import EditEvent from './pages/Manager/EditEvent';
import CreateEvent from './pages/Manager/CreateEvent';
import Communication from './pages/Home/CommunicationEvent';
import MyRegistrationsPage from './pages/Home/RegistrationEvents';
import ForumEventDetail from './pages/Home/ForumEventDetail';
import MyEventsCommunication from './pages/Home/Communication';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/events/:id" element={<EventDetail />} />

                {/* <Route path="/" element={<GoogleLoginButton />} /> */}
                <Route path="/login" element={<Login />} />
                <Route path="/login-success" element={<LoginSuccess />} />

                <Route path="/dashboard" element={<ProtectedRoute> <Dashboard /></ProtectedRoute>} />
                {/* <Route path="/dashboard" element={ <Dashboard />}/> */}
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin/login" element={<LoginAdmin />} />
                <Route path="/manager/login" element={<LoginManager />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                <Route path="/manager/create-event" element={<CreateEvent />} />
                <Route path="/manager/my-events" element={< MyEvents />} />
                <Route path="/manager/edit-event/:id" element={<EditEvent />} />


                <Route path="/admin/event-approvals" element={<EventsApproval />} />
                <Route path="/admin/user-management" element={<UserManagement />} />
                <Route path="/google/callback" element={<GoogleCallback />} />
                <Route path="/volunteer/profile" element={< Profile />} />
                <Route path="/volunteer/dashboard" element={< VolunteerDashboard />} />
                <Route path="/volunteer/events" element={< BrowseEvents />} />
                <Route path="/event/registrations" element={< MyRegistrationsPage />} />
                <Route path="/event/communication/:eventId" element={<Communication /> } />
                <Route path="/volunteer/events/:eventId" element={<ForumEventDetail /> } />
                <Route path="/volunteer/communication" element={<MyEventsCommunication /> } />
            </Routes>
        </Router>
    );
}

export default App;
