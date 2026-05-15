import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSuspiciousObservations, resolveSuspiciousObservation } from '../api';
import './ObservationPage.css';

type Observation = {
  id: string;
  userId: string;
  group: 'ADMIN' | 'USER';
  reason: string;
  score: number;
  actionCount: number;
  firstSeen: string;
  lastSeen: string;
  resolved: boolean;
  resolvedAt?: string | null;
};

function ObservationPage() {
  const navigate = useNavigate();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = (() => {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      try {
        return JSON.parse(userStr) as { username: string; role?: string; roleName?: string };
      } catch {
        return null;
      }
    })();

    if (!currentUser || (currentUser.role ?? currentUser.roleName) !== 'ADMIN') {
      navigate('/overview');
      return;
    }

    const loadObservations = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchSuspiciousObservations();
        setObservations(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load observations');
      } finally {
        setLoading(false);
      }
    };

    loadObservations();
  }, [navigate]);

  const handleResolve = async (id: string) => {
    try {
      await resolveSuspiciousObservation(id);
      setObservations((prev) => prev.map((observation) => observation.id === id ? { ...observation, resolved: true, resolvedAt: new Date().toISOString() } : observation));
    } catch (resolveError) {
      setError(resolveError instanceof Error ? resolveError.message : 'Failed to resolve observation');
    }
  };

  return (
    <div className="observation-page">
      <div className="observation-page__header">
        <div>
          <p className="observation-page__eyebrow">Admin review</p>
          <h1>Suspicious users</h1>
          <p>Rate-based detection over recent user actions.</p>
        </div>
        <button className="observation-page__back" onClick={() => navigate('/overview')} type="button">
          Back to overview
        </button>
      </div>

      {error && <div className="observation-page__error">{error}</div>}
      {loading ? (
        <div className="observation-page__loading">Loading observations...</div>
      ) : observations.length === 0 ? (
        <div className="observation-page__empty">No suspicious users detected yet.</div>
      ) : (
        <div className="observation-table">
          <div className="observation-table__header">
            <span>User</span>
            <span>Group</span>
            <span>Reason</span>
            <span>Score</span>
            <span>Actions</span>
            <span>First seen</span>
            <span>Last seen</span>
            <span>Status</span>
            <span>Resolve</span>
          </div>
          {observations.map((observation) => (
            <div className="observation-table__row" key={observation.id}>
              <span>{observation.userId}</span>
              <span>{observation.group}</span>
              <span>{observation.reason}</span>
              <span>{observation.score}</span>
              <span>{observation.actionCount}</span>
              <span>{new Date(observation.firstSeen).toLocaleString()}</span>
              <span>{new Date(observation.lastSeen).toLocaleString()}</span>
              <span>{observation.resolved ? 'Resolved' : 'Active'}</span>
              <span>
                {!observation.resolved ? (
                  <button className="observation-page__resolve" onClick={() => handleResolve(observation.id)} type="button">
                    Resolve
                  </button>
                ) : (
                  observation.resolvedAt ? new Date(observation.resolvedAt).toLocaleString() : 'Done'
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ObservationPage;