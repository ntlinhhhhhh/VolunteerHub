import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GoogleLoginButton from './components/GoogleLoginButton';
import GoogleCallback from './pages/GoogleCallback';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home/Home';
import Register from './pages/Register/Register';

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<GoogleLoginButton />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={ <ProtectedRoute> <Dashboard /></ProtectedRoute>}/>
        {/* <Route path="/dashboard" element={ <Dashboard />}/> */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />

        <Route path="/auth/google/callback" element={<GoogleCallback />} />
      </Routes>
    </Router>
  );
}

export default App;
