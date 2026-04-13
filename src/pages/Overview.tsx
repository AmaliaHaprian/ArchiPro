import { useMemo, useState } from "react";
import { getCookieValue } from '../utils/cookies';
import { useNavigate } from 'react-router-dom';
import ProjectRow from "../components/ProjectRow";
import type { Project } from "../models/Project";
import './Overview.css'
import { useUserPreferences } from '../hooks/useUserPreferences';
import ThemeSwitcher from "../components/ThemeSwitcher";
import StatusDistributionPie from "../components/charts/StatusDistributionPie";
import StageBottleneckBar from "../components/charts/StageBottleneckBar";
import ProjectsByTypeBar from "../components/charts/ProjectsTypeBar";
import TopCompletionProjects from "../components/charts/TopCompletionProjects";
import TopRowCards from "../components/charts/TopRowCards";
import GenerateProject from "../utils/generateProject";
import { useRef, useEffect } from "react";

function Overview({ projects, onAddProject }: { projects: Project[]; onAddProject: (project: Project) => void; }) {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('');
    const [theme, setTheme] = useState(() => getCookieValue('theme', 'light'));
    const [viewMode, setViewMode] = useState<'table' | 'charts'>('table');

    const [categoryFilter, setCategoryFilter] = useState(() => getCookieValue('categoryFilter', 'All categories'));
    const [statusFilter, setStatusFilter] = useState(() => getCookieValue('statusFilter', 'All statuses'));
    const projectsPerPage = 3;

    const [spamProjects, setSpamProjects] = useState<string>('Start');
    const spamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useUserPreferences(
        { categoryFilter, statusFilter },
        loaded => {
            if (loaded.categoryFilter && loaded.categoryFilter !== categoryFilter) setCategoryFilter(loaded.categoryFilter);
            if (loaded.statusFilter && loaded.statusFilter !== statusFilter) setStatusFilter(loaded.statusFilter);
        }
    );

    useUserPreferences(
        { theme },
        loaded => {
            if (loaded.theme && loaded.theme !== theme) setTheme(loaded.theme);
        }
    );

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (spamIntervalRef.current) {
                clearInterval(spamIntervalRef.current);
            }
        };
    }, []);

    const totalPages = Math.ceil(projects.length / projectsPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
    const startIndex = (currentPage - 1) * projectsPerPage;

    const filterAndSearchProjects = useMemo(() => {
        return projects
        .filter(project => (categoryFilter == 'All categories' || project.projectCategory == categoryFilter))
        .filter(project => (statusFilter == 'All statuses' || project.projectStatus == statusFilter))
        .filter(project => project.projectName.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [projects, categoryFilter, statusFilter, searchTerm]);

    const visibleProjects = filterAndSearchProjects.slice(startIndex, startIndex + projectsPerPage);

    const openProject = (project: Project) => {
        navigate(`/project/${project.id}`, { state: { project } });
    };
    
    const goToPage = (page: number) => {
        setCurrentPage(page);
    }

    const goToPrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }

    const goToNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    }

    const handleAddProject = () => {
        navigate('/addproject');
    }

    const handleSpamProjects = () => {
        if (spamProjects === 'Start') {
            setSpamProjects('Stop');
            spamIntervalRef.current = setInterval(() => {
                const newProject = GenerateProject();
                onAddProject(newProject);
            }, 100);
        } else {
            setSpamProjects('Start');
            clearInterval(spamIntervalRef.current!);
            spamIntervalRef.current = null;
        }
    }
    return (
        <>
        <div className={theme==='light'? 'overview-light': 'overview-dark'}>
        <div className="overview">
            <ThemeSwitcher theme={theme} setTheme={setTheme} />
            <div className="projects-header">
                <h2>ArchiPro</h2>
                <button className="new-project-button" onClick={handleAddProject} type="button">+ New Project</button>
            </div>
            <hr className="header-divider" />

            <main className="projects-main">
                <div className="projects-main-header">
                    <div className="main-title-block">
                        <h1>Projects</h1>
                        <p>Manage and track your architecture projects. All in one place</p>
                    </div>
                    <div className="header-buttons">
                        <button className='spam-projects-button'
                            onClick={handleSpamProjects}
                            type="button"
                        >
                            {spamProjects}
                        </button>
                        <button 
                            className={`view-toggle-button ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                            type="button"
                        >
                            Table View
                        </button>
                        <button 
                            className={`view-toggle-button ${viewMode === 'charts' ? 'active' : ''}`}
                            onClick={() => setViewMode('charts')}
                            type="button"
                        >
                            Charts View
                        </button>
                    </div>
                </div>

                {viewMode === 'table' ? (
                    <>
                        <div className="projects-toolbar">
                            <input 
                            className="search-input" 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <div className="filter-area">
                                <span className="filters-label">Filters</span>
                                <select className="filter-select" name="category" id="category-filter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                    <option value="All categories">All categories</option>
                                    <option value="Residential">Residential</option>
                                    <option value="Commercial">Commercial</option>
                                    <option value="Landscape">Landscape</option>
                                    <option value="Interior">Interior</option>
                                </select>
                                <select className="filter-select" name="status" id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option value="All statuses">All statuses</option>
                                    <option value="Not started">Not started</option>
                                    <option value="In progress">In progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Planning">Planning</option>
                                </select>
                            </div>
                        </div>

                        <section className="projects-table">
                            <div className="project-table-header">
                                <span>Title</span>
                                <span>Status</span>
                                <span>Category</span>
                                <span>Progress</span>
                                <span>Project page</span>
                            </div>
                            {visibleProjects.map(p => (
                                <ProjectRow data-project-id={p.id} key={p.id} project={p} onClick={() => openProject(p)} />
                            ))}
                        </section>

                        <nav className="pagination" aria-label="Project pages">
                            <button
                                className="pagination-button"
                                onClick={goToPrevious}
                                disabled={currentPage === 1}
                                type="button"
                            >
                                &lt; Previous
                            </button>
                            <div className="pagination-pages">
                                {pageNumbers.map((page) => (
                                    <button
                                        key={page}
                                        className={`pagination-button ${currentPage === page ? 'is-active' : ''}`}
                                        onClick={() => goToPage(page)}
                                        type="button"
                                    >
                                        {page}
                                    </button>
                                )).slice(currentPage - 1, currentPage + 4)}
                            </div>
                            <button
                                className="pagination-button"
                                onClick={goToNext}
                                disabled={currentPage === totalPages}
                                type="button"
                            >
                                Next &gt;
                            </button>
                        </nav>
                    </>
                ) : (
                    <section className="charts-section">
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
                    </section>
                )}
            </main>
        </div>
        </div>
        
        </>
    )
};

export default Overview;