import type { Project } from '../../models/Project';

function getTopCompletedProjects(projects: Project[]): Project[] {
  return projects
    // 1. Only include projects that are finished
    .filter(p => p.projectStatus.toLowerCase() === 'done') 
    // 2. Sort by working hours (highest first)
    // Note: We use || 0 to handle cases where projectWorkingHours might be undefined
    .sort((a, b) => (b.projectWorkingHours || 0) - (a.projectWorkingHours || 0))
    // 3. Take the top 3
    .slice(0, 3);
}


function TopCompletionProjects ({ projects }: { projects: Project[] }) {
  const topProjects = getTopCompletedProjects(projects);

  return (
    <div style={{ 
      width: '100%', 
      height: 'auto',
      minHeight: 300,
      maxHeight: 500,
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      padding: '20px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
      overflowY: 'auto'
    }}>
      <h3 style={{ marginBottom: '15px', color: '#000000' }}>Top Completion Projects </h3>
      
      { topProjects.length > 0 ? (
        <ol style={{ paddingLeft: '20px', lineHeight: '2' }}>
          {topProjects.map((project, index) => (
            <li key={project.id} style={{ fontWeight: '500', color: '#000000' }}>
              {project.projectName} 
              <span style={{ fontSize: '0.8em', color: '#000000', marginLeft: '10px' }}>
                ({project.projectWorkingHours} hrs)
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p style={{ color: '#000000', fontStyle: 'italic' }}>No completed projects yet.</p>
      ) }
    </div>
  )
};


export default TopCompletionProjects;