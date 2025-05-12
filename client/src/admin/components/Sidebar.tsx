import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="bg-light border-end vh-100 p-4" style={{ width: '250px' }}>
      <h4 className="mb-4">Admin Panel</h4>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
         <Link to="/admin" className="nav-link text-black">Dashboard</Link>
        </li>
        <li className="nav-item mb-2">
           <Link to="/admin/manageblogs" className="nav-link text-black">Articles</Link>
        </li>
        <li className="nav-item mb-2">
          <a href="#" className="nav-link text-dark">Analytics</a>
        </li>
        <li className="nav-item mb-2">
          <a href="#" className="nav-link text-dark">Settings</a>
        </li>
      </ul>
    </div>
  );
}
