// src/components/charts/ProjectsByTypeChart.js
import type { Project } from '../../models/Project';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function bottleneckData(projects: Project[]) {
  const stages = projects.reduce((acc, p) => {
    if (p.projectCurrentStage) {
      acc[p.projectCurrentStage] = (acc[p.projectCurrentStage] || 0) + 1;
    }
    return acc;
  }, {} as any);

  return Object.keys(stages).map(stage => ({
    name: stage,
    count: stages[stage]
  }));
};


const StageBottleneckBar = ({ projects }: { projects: Project[] }) => {
    const data = bottleneckData(projects).map(entry => {
        let color = '#8884d8';
        if (entry.name === 'Project brief') color = '#1B1464';
        else if (entry.name === 'Site analysis') color = '#4EB61E';
        else if (entry.name === 'Design') color = '#B51B1B';
        else if (entry.name === 'Research') color = '#F39C12';
        else if (entry.name === 'Visualization') color = '#8E44AD';
        return { ...entry, color };
    });

  return (
    <div style={{ width: '100%', minHeight: 400, maxHeight: 600, border: '1px solid #ccc', borderRadius: '8px', padding: '10px', backgroundColor: '#ffffff', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ color: '#000000', margin: '0 0 10px 0' }}>Stage bottleneck detection</h3>
      <div style={{ flex: 1, minHeight: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
          layout="vertical" // Critical for horizontal layout
          data={data}
          margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" axisLine={false} tickLine={false} />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: 'transparent' }} />
          
          {/* Create a separate bar for each color in the data array */}
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`bar-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StageBottleneckBar;