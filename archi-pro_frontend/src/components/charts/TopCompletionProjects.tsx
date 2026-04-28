import type { Project } from '../../models/Project';
import { useEffect, useState } from 'react';
import { getTopCompleted, getTopCompletedByUserId } from '../../api';

async function getTopCompletedProjects(userId ?: string) : Promise<Project[]> {
  const topCompleted = userId ? await getTopCompletedByUserId(userId) : await getTopCompleted();
  return topCompleted;
}


function TopCompletionProjects (props : { refreshKey: number, userId?: string | null }) {
  const [topProjects, setTopProjects] = useState<Project[]>([]);

  useEffect(() => {
    getTopCompletedProjects(props.userId).then(projects => {
      setTopProjects(projects);
    });
  }, [props.refreshKey, props.userId]);

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
              {project.title} 
              <span style={{ fontSize: '0.8em', color: '#000000', marginLeft: '10px' }}>
                ({project.workingHours} hrs)
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