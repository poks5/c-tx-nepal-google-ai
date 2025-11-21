
import React, { useState, useEffect, useCallback } from 'react';
// FIX: The errors suggest a module resolution issue with react-router-dom. Using a namespace import is a potential workaround for such issues.
import * as ReactRouterDOM from 'react-router-dom';
import { Home, Users, HeartPulse, UserPlus, GitCommitHorizontal, BookOpen, Menu, X, FileCode } from 'lucide-react';

import DashboardPage from './pages/DashboardPage';
import PatientsListPage from './pages/PatientsListPage';
import PairsListPage from './pages/PairsListPage';
import PatientDetailPage from './pages/PatientDetailPage';
import PairDetailPage from './pages/PairDetailPage';
import RegisterPatientPage from './pages/RegisterPatientPage';
import UserManualPage from './pages/UserManualPage';
import DevPromptPage from './pages/DevPromptPage';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navLinkClasses = "flex items-center px-4 py-3 text-gray-700 hover:bg-primary-100 hover:text-primary-700 rounded-lg transition-colors duration-200";
  const activeLinkClasses = "bg-primary-100 text-primary-700 font-semibold";
  const location = ReactRouterDOM.useLocation();

  // Close sidebar on navigation
  useEffect(() => {
    onClose();
  }, [location, onClose]);


  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 h-full z-20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <HeartPulse className="h-10 w-10 text-primary-600 bg-primary-100 p-2 rounded-lg" />
              <div>
                <h1 className="text-lg font-bold text-gray-800">TransplantFlow</h1>
                <p className="text-xs text-gray-500">Evaluation System</p>
              </div>
            </div>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-800" aria-label="Close menu">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <ReactRouterDOM.NavLink to="/" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`} end>
            <Home className="w-5 h-5 mr-3" /> Dashboard
          </ReactRouterDOM.NavLink>
          <ReactRouterDOM.NavLink to="/patients" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <Users className="w-5 h-5 mr-3" /> Patients
          </ReactRouterDOM.NavLink>
          <ReactRouterDOM.NavLink to="/pairs" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <GitCommitHorizontal className="w-5 h-5 mr-3" /> Pairs
          </ReactRouterDOM.NavLink>
          <ReactRouterDOM.NavLink to="/register" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <UserPlus className="w-5 h-5 mr-3" /> Register Patient
          </ReactRouterDOM.NavLink>
          <ReactRouterDOM.NavLink to="/manual" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
              <BookOpen className="w-5 h-5 mr-3" /> User Manual
          </ReactRouterDOM.NavLink>
          <div className="pt-2 mt-2 border-t border-gray-200">
            <ReactRouterDOM.NavLink to="/dev-prompt" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
                <FileCode className="w-5 h-5 mr-3" /> Dev Prompt
            </ReactRouterDOM.NavLink>
          </div>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-center text-gray-400">&copy; 2024 TransplantFlow</p>
        </div>
      </aside>
    </>
  );
};

const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => (
    <header className="sticky top-0 lg:hidden bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 z-10 flex items-center">
        <button onClick={onMenuClick} className="text-gray-600 hover:text-gray-900" aria-label="Open menu">
            <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 text-center pr-6"> {/* pr-6 to offset menu button space */}
            <div className="flex items-center justify-center space-x-2">
                <HeartPulse className="h-6 w-6 text-primary-600" />
                <h1 className="text-lg font-bold text-gray-800">TransplantFlow</h1>
            </div>
        </div>
    </header>
);

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <ReactRouterDOM.HashRouter>
      <div className="flex h-screen bg-slate-50">
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
        <main className="flex-1 lg:ml-64 overflow-y-auto w-full">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <div className="p-4 sm:p-6 lg:p-8">
            <ReactRouterDOM.Routes>
              <ReactRouterDOM.Route path="/" element={<DashboardPage />} />
              <ReactRouterDOM.Route path="/patients" element={<PatientsListPage />} />
              <ReactRouterDOM.Route path="/patients/:id" element={<PatientDetailPage />} />
              <ReactRouterDOM.Route path="/pairs" element={<PairsListPage />} />
              <ReactRouterDOM.Route path="/pairs/:id" element={<PairDetailPage />} />
              <ReactRouterDOM.Route path="/register" element={<RegisterPatientPage />} />
              <ReactRouterDOM.Route path="/manual" element={<UserManualPage />} />
              <ReactRouterDOM.Route path="/dev-prompt" element={<DevPromptPage />} />
            </ReactRouterDOM.Routes>
          </div>
        </main>
      </div>
    </ReactRouterDOM.HashRouter>
  );
};

export default App;
