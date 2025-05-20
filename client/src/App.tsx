// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './components/Home';
import BlogDetail from './components/BlogDetail';
import BlogList from './components/BlogList';
import Blogs from './pages/Blogs';
import About from './pages/About';

import Dashboard from './admin/pages/Dashboard';
import ManageBlogs from './admin/pages/ManageBlogs';
import BlogForm from './admin/pages/BlogForm';
import Login from './admin/pages/Login';

import LoadingSpinner from './components/LoadingSpinner';
import PageWrapper from './components/PageWrapper';

const AppContent = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {loading && <LoadingSpinner />}
      {!loading && (
        <Routes>
          <Route path="/*" element={<MainAppLayout />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      )}
    </>
  );
};

// Public site layout
const MainAppLayout = () => {
  const location = useLocation();

  return (
    <PageWrapper key={location.pathname}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bloglist" element={<BlogList />} />
        <Route path="/blogdetail/:id" element={<BlogDetail />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </PageWrapper>
  );
};


const AdminRoutes = () => {
  return (
    
     <Routes>
       <Route path="/" element={<Login />} />
       <Route path="login" element={<Login />} />
       <Route path="dashboard" element={<Dashboard />} />
       <Route path="manageblogs" element={<ManageBlogs />} />
       <Route path="blogs/create" element={<BlogForm />} />
       <Route path="blogs/edit/:id" element={<BlogForm />} />
       <Route path="*" element={<Navigate to="dashboard" />} />
     </Routes>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
