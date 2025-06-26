import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface DashboardChartsProps {
  completedVideos: number;
  totalVideos: number;
  moduleStats?: {
    moduleName: string;
    completedVideos: number;
    totalVideos: number;
  }[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ completedVideos, totalVideos, moduleStats = [] }) => {
  // Gráfico de Pizza (Progresso Geral)
  const pieData = {
    labels: ['Assistidos', 'Restantes'],
    datasets: [
      {
        data: [completedVideos, Math.max(0, totalVideos - completedVideos)],
        backgroundColor: ['#22c55e', '#e5e7eb'],
        borderWidth: 0,
      },
    ],
  };

  // Gráfico de Barras (Progresso por Módulo)
  const barData = {
    labels: moduleStats.map((m) => m.moduleName),
    datasets: [
      {
        label: 'Assistidos',
        data: moduleStats.map((m) => m.completedVideos),
        backgroundColor: '#2563eb',
      },
      {
        label: 'Total',
        data: moduleStats.map((m) => m.totalVideos),
        backgroundColor: '#e5e7eb',
      },
    ],
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold text-white mb-2">Progresso Geral</h3>
        <div className="w-48 h-48">
          <Pie data={pieData} options={{ plugins: { legend: { labels: { color: '#fff', font: { size: 14 } } } } }} />
        </div>
        <div className="mt-2 text-gray-300 text-sm">
          {completedVideos} de {totalVideos} vídeos assistidos
        </div>
      </div>
      {moduleStats.length > 0 && (
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-white mb-2">Progresso por Módulo</h3>
          <div className="w-full max-w-xs">
            <Bar data={barData} options={{
              plugins: { legend: { labels: { color: '#fff', font: { size: 14 } } } },
              scales: {
                x: { ticks: { color: '#fff' } },
                y: { ticks: { color: '#fff' }, beginAtZero: true }
              }
            }} />
          </div>
        </div>
      )}
    </div>
  );
}; 