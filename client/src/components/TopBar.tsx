import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaSearch } from 'react-icons/fa';
import { FiCamera } from 'react-icons/fi';
import '../static/topbar.css'; // Create this CSS file

const TopBar = () => {
  return (
    <nav className="top-bar">
      <div className="container">
        <div className="top-bar-content">
          {/* Logo with lens icon */}
          <div className="logo-container">
            <Link to="/" className="logo-link">
              <FiCamera className="lens-icon" />
              <span className="logo-text">Mzee's Lens</span>
            </Link>
          </div>

          {/* Search bar (optional) */}
          <div className="search-container">
            <div className="search-input">
              <input type="text" placeholder="Search..." />
              <FaSearch className="search-icon" />
            </div>
          </div>

          {/* Social media links */}
          <div className="social-links">
            <a 
              href="https://web.facebook.com/prince.marie.stage" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebook className="social-icon" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram className="social-icon" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;