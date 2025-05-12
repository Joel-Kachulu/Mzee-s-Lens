// src/components/Blogs.jsx
import BlogList from '../components/BlogList';
import Footer from '../components/Footer';
import TopBar from '../components/TopBar';
import '../static/blogs.css'; // optional custom css for blogs page

const Blogs = () => {
  return (
    <div className="dark-theme">
      <TopBar />
      <div className="container py-5">
        <header className="text-center mb-5">
          <h3 className="display-6 fw-bold text-white">Exploper More</h3>
          <p className="lead text-secondary">Explore insights, strategies, and creative journeys.</p>
        </header>

        <section>
          <BlogList />
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Blogs;
