export default function Header({ username }: { username: string }) {
  const initials = username ? username.slice(0, 2).toUpperCase() : 'AD';

  return (
    <nav className="navbar navbar-light bg-white border-bottom shadow-sm px-4 py-3">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <span className="navbar-brand mb-0 h4">Mzee's Lens</span>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">{username}</span>
          <div className="rounded-circle bg-success text-white d-flex justify-content-center align-items-center" style={{ width: '35px', height: '35px' }}>
            {initials}
          </div>
        </div>
      </div>
    </nav>
  );
}
