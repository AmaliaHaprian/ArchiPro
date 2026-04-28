// src/components/charts/StatusDistributionPie.js
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { getStatusDistribution, getStatusDistributionByUserId } from '../../api';

async function computeStatusDistribution(userId : string | null) {
  const statusMap : Record<string, number> = userId ? await getStatusDistributionByUserId(userId) : await getStatusDistribution();
  
  return Object.entries(statusMap).map(([name, value]) => {
    let color = '#8884d8'; // Default color
    if (name === 'IN_PROGRESS') color = '#1B1464';
    else if (name === 'DONE') color = '#4EB61E';
    else if (name === 'PLANNING') color = '#B51B1B';
    return { name, value, color };
  });
};

const StatusDistributionPie = (props : {refreshKey?: number, userId?: string | null }) => {
  const [statusData, setStatusData] = useState<Array<{ name: string; value: number; color: string }>>([]);

  useEffect(() => {
    computeStatusDistribution(props.userId).then(data => {
      setStatusData(data);
    });
  }, [props.refreshKey, props.userId]);
  const total = statusData.reduce((sum, entry) => sum + entry.value, 0);
  return (
    <div style={{ width: '100%', minHeight: 500, maxHeight: 700, backgroundColor: '#E0E0E0', padding: '20px', borderRadius: '8px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ color: '#000000', margin: '0 0 10px 0' }}>Project Status Distribution</h3>
      <div style={{ flex: 1, minHeight: 300, height: 400 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={350} minHeight={350}>
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
            formatter={(value) => [`${(((value as number) * 100) / total).toFixed(2)}%` ]} 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
          />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatusDistributionPie;