interface Props {
  label: string;
  value: string;
  icon: string;
}

export default function DashboardCard({ label, value, icon }: Props) {
  return (
    <div className="col-sm-6 col-lg-3 mb-4">
      <div className="card text-center shadow-sm">
        <div className="card-body">
          <i className={`bi ${icon} fs-2 mb-2 text-primary`}></i>
          <h6 className="card-subtitle mb-1 text-muted">{label}</h6>
          <h5 className="card-title">{value}</h5>
        </div>
      </div>
    </div>
  );
}
