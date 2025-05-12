import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DashboardCard from '../components/DashboardCard';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const [username, setUsername] = useState<string>('Admin');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUsername(user.email || 'Admin');
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1">
        <Header username={username} />

        <div className="container mt-4">
          <h2 className="mb-4 fw-bold">Welcome, {username}</h2>

          <div className="row mb-5">
            <DashboardCard label="Published Articles" value="2" icon="bi-file-earmark-text" />
            <DashboardCard label="Total Views" value="0" icon="bi-eye" />
            <DashboardCard label="Donations" value="0" icon="bi-currency-dollar" />
            <DashboardCard label="Registered Users" value="0" icon="bi-people" />
          </div>

          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Recent Activity</h5>
                  <div className="bg-light rounded p-4 text-center text-muted">Chart/Activity Log Placeholder</div>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Quick Links</h5>
                  <div className="d-grid gap-2">
                    <button className="btn btn-primary" onClick={() => navigate('/admin/manageblogs')}>
                      Add New Article
                    </button>
                    <button className="btn btn-outline-secondary" disabled>Manage Categories (Soon)</button>
                    <button className="btn btn-outline-secondary">View Site Analytics</button>
                    <button className="btn btn-outline-secondary" disabled>User Management (Soon)</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
