import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-5 mt-5 w-100"> {/* Added w-100 */}
      <div className="container-fluid"> {/* Changed from container to container-fluid */}
        <div className="row g-4">
          {/* About Section */}
          <div className="col-md-4">
            <h5 className="fw-bold mb-3">Mzee's Lens</h5>
            <p>
              Exploring marketing, creativity, and visual storytelling. 
              Bold ideas for bolder minds.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-2">
            <h5 className="fw-bold mb-3">Explore</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-white text-decoration-none">Home</Link></li>
              <li className="mb-2"><Link to="/about" className="text-white text-decoration-none">About</Link></li>
              <li className="mb-2"><Link to="/blogs" className="text-white text-decoration-none">Browse Blogs</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-md-3">
            <h5 className="fw-bold mb-3">Connect</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i>
                hello@mzeeslens.com
              </li>
              <li className="mb-2">
                <i className="bi bi-geo-alt me-2"></i>
                Lilongwe, Malawi
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="col-md-3">
            <h5 className="fw-bold mb-3">Follow</h5>
            <div className="d-flex gap-3">
              <a href="#" className="text-white fs-5"><i className="bi bi-twitter"></i></a>
              <a href="#" className="text-white fs-5"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-white fs-5"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="row mt-4 pt-3 border-top">
          <div className="col-12 text-center">
            <p className="mb-0 small">
              &copy; {new Date().getFullYear()} Mzee's Lens. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;