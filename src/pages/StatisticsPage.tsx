import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusDistributionPie from "../components/charts/StatusDistributionPie";
import StageBottleneckBar from "../components/charts/StageBottleneckBar";
import ProjectsByTypeBar from "../components/charts/ProjectsTypeBar";
import TopCompletionProjects from "../components/charts/TopCompletionProjects";
import TopRowCards from "../components/charts/TopRowCards";
import type { Project } from "../models/Project";
import './StatisticsPage.css';

function StatisticsPage({ projects }: { projects: Project[] }) {
    const navigate = useNavigate();
    return (
        <div className='statistics-page'>
            <p className="back-link" onClick={() => navigate('/overview')}>Back to Overview</p>
            <div className="statistics-header">
                <h1>Statistics Dashboard</h1>
                <p>Comprehensive overview of project metrics and performance</p>
            </div>
            <TopRowCards projects={projects} />
            <div className="statistics-charts">
                <div className="first-row-charts">
                    <StatusDistributionPie projects={projects} />
                </div>
                <div className="second-row-charts">
                    <StageBottleneckBar projects={projects} />
                    <TopCompletionProjects projects={projects} />
                    <ProjectsByTypeBar projects={projects} />
                </div>
            </div>
        </div>
    );
}

export default StatisticsPage;