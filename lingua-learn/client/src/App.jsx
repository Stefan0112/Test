import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import CourseView from './pages/CourseView';
import Community from './pages/Community';
import Achievements from './pages/Achievements';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/learn/:langId" element={<Learn />} />
            <Route path="/course/:courseId" element={<CourseView />} />
            <Route path="/community" element={<Community />} />
            <Route path="/achievements" element={<Achievements />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}