import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './components/Home';
import BlogDetail from './components/BlogDetail';
import BlogList from './components/BlogList';
import Blogs from './pages/Blogs';
import About from './pages/About';
import LoadingSpinner from './components/LoadingSpinner'; // spinner
import PageWrapper from './components/PageWrapper'; // fade animation wrapper

const AppContent: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // 0.5 second spinner on every page switch

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {loading && <LoadingSpinner />}
      {!loading && (
        <PageWrapper key={location.pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bloglist" element={<BlogList />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Home />} /> {/* Wildcard */}
          </Routes>
        </PageWrapper>
      )}
    </>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;





