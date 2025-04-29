import  { useState } from 'react';
import BlogList from './BlogList';
import Footer from './Footer';
import TopBar from './TopBar';
import { Link } from 'react-router-dom';
import '../static/home.css'; // CSS import from static folder


const Home = () => {
  const [showFullAbout, setShowFullAbout] = useState(false);

  const toggleAbout = () => {
    setShowFullAbout(!showFullAbout);
  };

  return (
    <div className="dark-theme">
        <TopBar />
      <div className="container py-5">
        {/* Header Section */}
        <header className="text-center mb-5 header-dark">
          <h1 className="display-6 fw-bold text-white">Hello Creative Minds!</h1>
          <p className="lead text-secondary" style={{ opacity: 1 }} >To a creative space where marketing meets meaning, and art tells strategy.</p>
          
          <nav className="d-flex justify-content-center gap-4 my-4 nav-dark">
            <Link to="*" className="text-decoration-none">Home</Link>
            <Link to="/blogs" className="text-decoration-none">Blogs</Link>
            <Link to="/about" className="text-decoration-none">Author</Link>
          </nav>
        </header>

        {/* About Section */}
        <section className="card mb-5 about-card-dark">
          <div className="card-body p-4">
            <h2 className="h4 mb-3 text-white">About Mzee's Lens</h2>
            <p className="mb-0">
              {showFullAbout ? (
                <>
                  Mzee's Lens is a creative hub exploring the intersection of marketing, branding, and visual storytelling. Through this blog, we dive into real-world campaigns that inspire action, art that sparks conversation, and strategies that shape industries.
                  <br /><br />
                  Whether you're a marketing student in Malawi, an up-and-coming creative, or just someone who loves bold ideas, Mzee's Lens offers fresh perspectives to help you think critically, see differently, and grow fearlessly.
                  <br /><br />
                  Step behind the lens—where strategy meets storytelling, and creativity drives change.
                </>
              ) : (
                "Mzee's Lens is a creative hub exploring the intersection of marketing, branding, and visual storytelling..."
              )}
            </p>
            <button 
              onClick={toggleAbout}
              className="btn btn-link p-0 text-decoration-none mt-2 read-more-dark"
            >
              {showFullAbout ? 'Show less' : 'Read more'}
            </button>
          </div>
        </section>

        {/* Latest Posts Section with light background */}
        <div className="light-theme-section p-4 rounded">
          <section className="mb-5">
            <h2 className="h4 mb-4">Latest Posts</h2>
            <BlogList />
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Home;