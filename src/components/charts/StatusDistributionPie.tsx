// src/components/charts/StatusDistributionPie.js
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { Project } from '../../models/Project';

const computeStatusDistribution = (projects: Project[]) => {
  const statusMap = projects.reduce((acc, project) => {
    const status=project.projectStatus;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(statusMap).map(([name, value]) => {
    let color = '#8884d8'; // Default color
    if (name === 'In progress') color = '#1B1464';
    else if (name === 'Done') color = '#4EB61E';
    else if (name === 'Planning') color = '#B51B1B';
    return { name, value, color };
  });
};

function StatusDistributionPie({ projects }: { projects: Project[] }) {
  const statusData = computeStatusDistribution(projects);

  return (
    <div style={{ width: '100%', minHeight: 500, maxHeight: 700, backgroundColor: '#E0E0E0', padding: '20px', borderRadius: '8px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ color: '#000000', margin: '0 0 10px 0' }}>Project Status Distribution</h3>
      <div style={{ flex: 1, minHeight: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
          <Pie
            data={statusData}
            cx="50%" // Center X
            cy="50%" // Center Y
            innerRadius={0} // No hole in the middle
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={0}
            dataKey="value"
          >
            {statusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${((value as number) / projects.length * 100).toFixed(2)}%`, 'Percentage']} 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
          />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatusDistributionPie;