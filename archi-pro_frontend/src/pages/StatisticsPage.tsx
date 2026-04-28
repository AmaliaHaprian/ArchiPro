import StatusDistributionPie from "../components/charts/StatusDistributionPie";
import StageBottleneckBar from "../components/charts/StageBottleneckBar";
import ProjectsByTypeBar from "../components/charts/ProjectsTypeBar";
import TopCompletionProjects from "../components/charts/TopCompletionProjects";
import TopRowCards from "../components/charts/TopRowCards";
import './StatisticsPage.css';
import { useEffect, useState } from "react";

function StatisticsPage({ chartsRefreshKey }: { chartsRefreshKey: number }) {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserId(user.userId);
        }
    }, []);
    return (
        <section className="charts-section">
            <TopRowCards refreshKey={chartsRefreshKey} userId={userId} />
            <div className="statistics-charts">
                <div className="first-row-charts">
                    <StatusDistributionPie refreshKey={chartsRefreshKey} userId={userId} />
                </div>
                <div className="second-row-charts">
                    <StageBottleneckBar refreshKey={chartsRefreshKey} userId={userId} />
                    <TopCompletionProjects refreshKey={chartsRefreshKey} userId={userId} />
                    <ProjectsByTypeBar refreshKey={chartsRefreshKey} userId={userId} />
                </div>
            </div>
        </section>
    );
}

export default StatisticsPage;