import type { Project } from '../../models/Project';
import './TopRowCards.css';
// Inside your Angular Component
function statistics(projects: Project[]) {
  const total = projects.length;
  const avgProgress = total > 0 
    ? projects.reduce((sum, p) => sum + p.projectProgres, 0) / total 
    : 0;
  
  const totalHours = projects.reduce((sum, p) => sum + (p.projectWorkingHours || 0), 0);

  // Filter for projects where the due date has passed or is today
  const today = new Date();
  const deadlines = projects.filter(p => new Date(p.projectDueDate) <= today).length;

  return { total, avgProgress, totalHours, deadlines };
}

function TopRowCards({ projects }: { projects: Project[] }) {
    const { total, avgProgress, totalHours, deadlines } = statistics(projects);
    return (
        <div className="top-row-cards">
            <div className="card-total-projects">
                <div className="card-content">
                    <h3>Total Projects</h3>
                    <p>{total}</p>
                </div>
            </div>
            <div className="card-avg-progress">
                <div className="card-content">
                    <h3>Average Progress</h3>
                    <p>{avgProgress.toFixed(2)}%</p>
                </div>
            </div>
            <div className="card-total-hours">
                <div className="card-content">
                    <h3>Total Working Hours</h3>
                    <p>{totalHours}</p>
                </div>
            </div>
            <div className="card-deadlines">
                <div className="card-content">
                    <h3>Projects with Deadlines Passed</h3>
                    <p>{deadlines}</p>
                </div>  
            </div>
        </div>
    );
}

export default TopRowCards;