import { useEffect, useState, useCallback } from "react";
import type { Project } from "../models/Project";
import { fetchProjects, filterAndSearchProjects } from "../api";
import ProjectRow from "./ProjectRow";
import { useNavigate } from "react-router-dom";
import { getCookieValue } from "../utils/cookies";
import { useUserPreferences } from "../hooks/useUserPreferences";

function PaginatedProjectsTable({ chartsRefreshKey }: { chartsRefreshKey: number }) {
  const projectsPerPage=5;
  const [data, setData] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(() => getCookieValue('categoryFilter', 'All categories'));
  const [statusFilter, setStatusFilter] = useState(() => getCookieValue('statusFilter', 'All statuses'));
  
  const navigate = useNavigate();

  useUserPreferences(
          { categoryFilter, statusFilter },
          loaded => {
              if (loaded.categoryFilter && loaded.categoryFilter !== categoryFilter) setCategoryFilter(loaded.categoryFilter);
              if (loaded.statusFilter && loaded.statusFilter !== statusFilter) setStatusFilter(loaded.statusFilter);
          }
      );
  const openProject = (project: Project) => {
        navigate(`/project/${project.id}`, { state: { project } });
    };

  const refreshProjects = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchProjects(currentPage);
      setData(result);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, chartsRefreshKey]);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const pageNumbers = [];
  let lastPage = currentPage;
  if (data.length === projectsPerPage) {
    lastPage = currentPage + 3;
  }
  for (let i = currentPage - 1; i <= lastPage; i++) {
    if (i >= 1) pageNumbers.push(i);
  }

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };
  const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const goToNext = () => {
    if (data.length === projectsPerPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const mapStatusToEnum = (status: string): string | undefined => {
        const statusMap: Record<string, string> = {
            'All statuses': '',
            'Not started': 'NOT_STARTED',
            'In progress': 'IN_PROGRESS',
            'Planning': 'PLANNING',
            'Completed': 'DONE',
            'Done': 'DONE'
        };
        return statusMap[status];
    };

    const mapCategoryToEnum = (category: string): string | undefined => {
        const categoryMap: Record<string, string> = {
            'All categories': '',
            'Residential': 'RESIDENTIAL',
            'Commercial': 'COMMERCIAL',
            'Landscape': 'LANDSCAPE',
            'Interior': 'INTERIOR',
            'Urban': 'URBAN',
            'Mixed use': 'MIXED_USE',
            'Cultural': 'CULTURAL',
            'Infrastructure': 'INFRASTRUCTURE'
        };
        return categoryMap[category];
    };

    useEffect(() => {
        const getFilteredProjects = async () => {
            try {
                const mappedStatus = mapStatusToEnum(statusFilter);
                const mappedCategory = mapCategoryToEnum(categoryFilter);
                if (mappedStatus !== undefined || mappedCategory !== undefined || searchTerm !== '') {
                    const filteredProjects = await filterAndSearchProjects(searchTerm,mappedCategory, mappedStatus);
                    setData(filteredProjects);
                }
            } catch (error) {
                console.error('Error filtering projects:', error);
            }
        };
        getFilteredProjects();
    }, [searchTerm,categoryFilter, statusFilter]);

  return (
    <div>
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
        {loading ? (
          <div>Loading...</div>
        ) : (
          data.map((p) => (
            <ProjectRow
              data-project-id={p.id}
              key={p.id}
              project={p}
              onClick={() => openProject(p)}
            />
          ))
        )}
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
              className={`pagination-button ${currentPage === page ? "is-active" : ""}`}
              onClick={() => goToPage(page)}
              type="button"
            >
              {page}
            </button>
          ))}
        </div>
        <button
          className="pagination-button"
          onClick={goToNext}
          disabled={data.length < projectsPerPage}
          type="button"
        >
          Next &gt;
        </button>
      </nav>
    </div>
  );
};

export default PaginatedProjectsTable;
