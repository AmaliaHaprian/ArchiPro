import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getProjectsByCategory, getProjectsByCategoryByUserId } from '../../api';
import { useEffect, useState } from 'react';

async function categoryData(userId: string | null) {
  const categories : Record<string, number> = userId ? await getProjectsByCategoryByUserId(userId) : await getProjectsByCategory();

  return Object.keys(categories).map(cat => ({
    type: cat,
    total: categories[cat]
  }));
}

const ProjectsByTypeBar = (props : {refreshKey?: number, userId?: string | null }) => {
    const [data, setData] = useState<Array<{ type: string; total: number; color: string }>>([]);

    useEffect(() => {
      categoryData(props.userId).then(categoryEntries => {
        const mappedData = categoryEntries.map(entry => {
          let color = '#8884d8';
          if (entry.type === 'RESIDENTIAL') color = '#1B1464';
          else if (entry.type === 'COMMERCIAL') color = '#4EB61E';
          else if (entry.type === 'LANDSCAPE') color = '#B51B1B';
        else if (entry.type === 'INTERIOR') color = '#F39C12';
        else if (entry.type === 'CULTURAL') color = '#8E44AD';
        else if (entry.type === 'INFRASTRUCTURE') color = '#3498db';
        else if (entry.type === 'URBAN') color = '#2E8B57';

        return { ...entry, color };
    })
        setData(mappedData);
  })
}, [props.refreshKey, props.userId]);

  return (
    <div style={{ width: '100%', minHeight: 350, maxHeight: 500, border: '1px solid #ccc', borderRadius: '8px', padding: '10px', backgroundColor: '#ffffff', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ color: '#000000', margin: '0 0 10px 0' }}>Projects by type</h3>
      <div style={{ flex: 1, minHeight: 250, height: 350 }}>
        <ResponsiveContainer width="90%" height="90%" >
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