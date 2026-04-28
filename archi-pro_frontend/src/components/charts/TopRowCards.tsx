import './TopRowCards.css';
import { getOverallStatistics, getOverallStatisticsByUserId } from '../../api';
import { useState, useEffect } from 'react';

async function statistics(userId? : string) {
    const stats = await getOverallStatisticsByUserId(userId);
    const total = stats.totalProjects;
    const avgProgress = stats.averageProgress;
    const avgHours = stats.averageWorkingHours;
    const deadlines = stats.deadlines;

  return { total, avgProgress, avgHours, deadlines };
}

function TopRowCards(props: { refreshKey: number, userId?: string | null }) {
    console.log("Top row cards refresh key:", props.refreshKey);
    const [stats, setStats] = useState({ total: 0, avgProgress: 0, avgHours: 0, deadlines: 0 });

    useEffect(() => {
        statistics(props.userId).then(setStats);
    }, [props.refreshKey, props.userId]);

    return (
        <div className="top-row-cards">
            <div className="card-total-projects">
                <div className="card-content">
                    <h3>Total Projects</h3>
                    <p>{stats.total}</p>
                </div>
            </div>
            <div className="card-avg-progress">
                <div className="card-content">
                    <h3>Average Progress</h3>
                    <p>{stats.avgProgress.toFixed(2)}%</p>
                </div>
            </div>
            <div className="card-total-hours">
                <div className="card-content">
                    <h3>Average Working Hours</h3>
                    <p>{stats.avgHours}</p>
                </div>
            </div>
            <div className="card-deadlines">
                <div className="card-content">
                    <h3>Projects with Deadlines Passed</h3>
                    <p>{stats.deadlines}</p>
                </div>  
            </div>
        </div>
    );
}

export default TopRowCards;