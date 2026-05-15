import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <main className="page unauthorized-page">
      <section className="card">
        <p className="eyebrow">Access denied</p>
        <h1>You do not have permission to view this page.</h1>
        <p>The page is protected by your current role and permission set.</p>
        <Link to="/overview">Back to overview</Link>
      </section>
    </main>
  );
}