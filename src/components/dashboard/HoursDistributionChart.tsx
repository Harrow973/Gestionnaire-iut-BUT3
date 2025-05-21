'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Sector 
} from 'recharts';
import type { ReactNode } from 'react';

// Define interfaces for our data
interface HourData {
  departement: string;
  cm: number;
  td: number;
  tp: number;
  total: number;
  color: string;
}

const COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#8B5CF6', // purple-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#EC4899', // pink-500
  '#6366F1', // indigo-500
  '#14B8A6', // teal-500
];

export default function HoursDistributionChart(): ReactNode {
  const [activeIndex, setActiveIndex] = useState(0);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HourData[]>([]);

  useEffect(() => {
    const fetchHoursData = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch from an API
        // const response = await fetch('/api/hours-distribution');
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockData: HourData[] = [
          {
            departement: 'Informatique',
            cm: 250,
            td: 420,
            tp: 380,
            total: 1050,
            color: COLORS[0]
          },
          {
            departement: 'R&T',
            cm: 180,
            td: 340,
            tp: 450,
            total: 970,
            color: COLORS[1]
          },
          {
            departement: 'GEA',
            cm: 320,
            td: 380,
            tp: 150,
            total: 850,
            color: COLORS[2]
          },
          {
            departement: 'TC',
            cm: 290,
            td: 410,
            tp: 180,
            total: 880,
            color: COLORS[3]
          },
          {
            departement: 'MMI',
            cm: 210,
            td: 300,
            tp: 490,
            total: 1000,
            color: COLORS[4]
          }
        ];
        
        setData(mockData);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données de répartition des heures');
        setLoading(false);
      }
    };

    fetchHoursData();
  }, []);

  // Function for active shape in pie chart
  const renderActiveShape = (props: any) => {
    const { 
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value 
    } = props;
  
    return (
      <g>
        <text x={cx} y={cy - 15} dy={8} textAnchor="middle" fill="#888">
          {payload.departement}
        </text>
        <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#333" fontSize="20" fontWeight="bold">
          {`${value}h`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  // Prepare pie chart data
  const pieData = data.map(item => ({
    departement: item.departement,
    value: item.total,
    color: item.color
  }));

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg min-h-[200px] flex items-center justify-center">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-gray-700 font-medium">Heures par département</h3>
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 text-sm ${
              chartType === 'bar' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Histogramme
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 text-sm ${
              chartType === 'pie' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Diagramme
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="departement" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value}h`, '']}
                labelFormatter={(label) => `Département ${label}`}
              />
              <Legend />
              <Bar dataKey="cm" name="CM" stackId="a" fill="#3B82F6" />
              <Bar dataKey="td" name="TD" stackId="a" fill="#10B981" />
              <Bar dataKey="tp" name="TP" stackId="a" fill="#8B5CF6" />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                onMouseEnter={onPieEnter}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value}h`, 'Total']}
                labelFormatter={(label) => `Département ${label}`}
              />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mt-2">
        {data.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
            <div className="flex items-center mb-1">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }}
              ></div>
              <h4 className="font-medium">{item.departement}</h4>
            </div>
            <div className="grid grid-cols-3 gap-1 text-xs text-gray-600">
              <div>CM: {item.cm}h</div>
              <div>TD: {item.td}h</div>
              <div>TP: {item.tp}h</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 