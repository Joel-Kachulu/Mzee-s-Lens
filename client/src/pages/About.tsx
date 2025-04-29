import React, { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import '../static/about.css'; // Your styling

const About: React.FC = () => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div className={`dark-theme ${fadeIn ? 'fade-in' : ''}`}>
      <TopBar />
      <div className="container py-5">
        <div className="bg-white rounded shadow-sm p-5">
          <h1 className="mb-4 text-center fw-bold display-5 text-dark">About Mzee's Lens</h1>
          <p className="lead text-muted text-center mb-5">
            Where marketing meets meaning and creativity drives change.
          </p>

          <section className="mb-5">
            <h2 className="h4 text-dark mb-3">Our Mission</h2>
            <p className="text-secondary">
              At Mzee's Lens, we aim to bridge the gap between storytelling and strategy.
              Our mission is to empower creatives, students, and professionals in Malawi and beyond
              with bold, insightful perspectives that spark action and growth.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 text-dark mb-3">What We Cover</h2>
            <ul className="list-unstyled">
              <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i> Marketing Strategies</li>
              <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i> Branding Analysis</li>
              <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i> Visual Storytelling</li>
              <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i> Creative Campaign Reviews</li>
              <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i> Real-world Inspiration</li>
            </ul>
          </section>

          <section>
            <h2 className="h4 text-dark mb-3">Join the Journey</h2>
            <p className="text-secondary">
              Whether you're starting your creative career or mastering your craft,
              Mzee’s Lens invites you to explore, question, and create with purpose.
              <br />
              Step behind the lens — see the world differently!
            </p>
          </section>

          <div className="text-center mt-5">
            <a href="/tags" className="btn btn-outline-primary">Explore Blogs</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
