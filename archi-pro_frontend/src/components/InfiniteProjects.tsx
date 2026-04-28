import { useState, useEffect, useRef } from 'react';
import type { Project } from '../models/Project';
import ProjectRow from './ProjectRow';
import { useNavigate } from 'react-router-dom';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { getCookieValue } from '../utils/cookies';
import { filterAndSearchProjectsByUserId } from '../api';

const PAGE_SIZE = 5;

function InfiniteProjects({ chartsRefreshKey }: { chartsRefreshKey: number }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(() => getCookieValue('categoryFilter', 'All categories'));
  const [statusFilter, setStatusFilter] = useState(() => getCookieValue('statusFilter', 'All statuses'));
  const [userId, setUserId] = useState<string | null>(null);
  const observer = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user.userId);
    }
  }, []);

  
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
              'Infrastructure': 'INFRASTRUCTURE',
              'Educational': 'EDUCATIONAL',
              'Entertainment': 'ENTERTAINMENT',
              'Historic': 'HISTORIC'
          };
          return categoryMap[category];
      };
  
  const [loading, setLoading] = useState(false);

  const resetPagination = () => {
    setProjects([]);
    setPage(1);
    setHasMore(true);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      setLoading(true);
      try {
        if (!userId) {
          setLoading(false);
          return;
        }
        const mappedStatus = mapStatusToEnum(statusFilter);
        const mappedCategory = mapCategoryToEnum(categoryFilter);
        const filteredProjects = await filterAndSearchProjectsByUserId(userId, page, searchTerm, mappedCategory, mappedStatus);
        if (page === 1) {
          setProjects(filteredProjects);
        } else {
          setProjects(prev => {
            const all = [...prev, ...filteredProjects];
            const uniqueProjects = Array.from(new Map(all.map(p => [p.id, p]))).map(([_, p]) => p);
            return uniqueProjects;
          });
        }
        setHasMore((filteredProjects?.length ?? 0) >= PAGE_SIZE);
      } catch (error) {
        console.error('Error filtering projects:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProjects();
    return () => { isMounted = false; };
  }, [page, searchTerm, categoryFilter, statusFilter, chartsRefreshKey, userId]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement;
    if (scrollHeight - scrollTop <= clientHeight + 100 && hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  useUserPreferences(
      { categoryFilter, statusFilter },
      loaded => {
          if (loaded.categoryFilter && loaded.categoryFilter !== categoryFilter) setCategoryFilter(loaded.categoryFilter);
          if (loaded.statusFilter && loaded.statusFilter !== statusFilter) setStatusFilter(loaded.statusFilter);
      }
  );

  const handleSearchChange = (value: string) => {
    resetPagination();
    setSearchTerm(value);
  };

  const handleCategoryChange = (value: string) => {
    resetPagination();
    setCategoryFilter(value);
  };

  const handleStatusChange = (value: string) => {
    resetPagination();
    setStatusFilter(value);
  };

  const openProject = (project: Project) => {
        navigate(`/project/${project.id}`, { state: { project } });
    };

  return (
    <div>
      <div className="projects-toolbar">
          <input 
          className="search-input" 
          type="text" 
          placeholder="Search..." 
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          />

          <div className="filter-area">
              <span className="filters-label">Filters</span>
              <select className="filter-select" name="category" id="category-filter" value={categoryFilter} onChange={(e) => handleCategoryChange(e.target.value)}>
                  <option value="All categories">All categories</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Landscape">Landscape</option>
                  <option value="Interior">Interior</option>
              </select>
              <select className="filter-select" name="status" id="status-filter" value={statusFilter} onChange={(e) => handleStatusChange(e.target.value)}>
                  <option value="All statuses">All statuses</option>
                  <option value="Not started">Not started</option>
                  <option value="In progress">In progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Planning">Planning</option>
              </select>
          </div>
      </div>
    <div
  ref={observer}
  style={{ height: '50vh', overflow: 'auto' }}
  onScroll={handleScroll}
    >
    <div className='infinite-project-header'>
      <span>Title</span>
      <span>Status</span>
      <span>Category</span>
      <span>Progress</span>
      <span>Project page</span>
    </div>
      {projects.map(project => (
        <ProjectRow key={project.id} data-project-id={project.id}
              project={project}
              onClick={() => openProject(project)} />
      ))}
      {loading && <div>Loading...</div>}
      {!hasMore && <div>No more projects</div>}
    </div>
    </div>
  );
}

export default InfiniteProjects;