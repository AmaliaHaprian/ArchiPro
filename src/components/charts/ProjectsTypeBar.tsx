import type { Project } from '../../models/Project';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function categoryData({ projects }: { projects: Project[] }) {
  const categories = projects.reduce((acc, p) => {
    const category = p.projectCategory || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as any);

  return Object.keys(categories).map(cat => ({
    type: cat,
    total: categories[cat]
  }));
}

const ProjectsByTypeBar = ({ projects }: { projects: Project[] }) => {
    const data = categoryData({ projects }).map(entry => {
        let color = '#8884d8';
        if (entry.type === 'Residential') color = '#1B1464';
        else if (entry.type === 'Commercial') color = '#4EB61E';
        else if (entry.type === 'Landscape') color = '#B51B1B';
        else if (entry.type === 'Interior') color = '#F39C12';
        else if (entry.type === 'Cultural') color = '#8E44AD';
        else if (entry.type === 'Infrastructure') color = '#3498db';
        else if (entry.type === 'Urban') color = '#2E8B57';

        return { ...entry, color };
    });

  return (
    <div style={{ width: '100%', minHeight: 350, maxHeight: 500, border: '1px solid #ccc', borderRadius: '8px', padding: '10px', backgroundColor: '#ffffff', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ color: '#000000', margin: '0 0 10px 0' }}>Projects by type</h3>
      <div style={{ flex: 1, minHeight: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
          data={data}
          margin={{ top: 0, right: 30, left: 0, bottom: 15 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="type" axisLine={false} tickLine={false} />
          <YAxis type="number" axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }} />
          <Bar dataKey="total" radius={[4, 4, 0, 0]} >
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

export default ProjectsByTypeBar;