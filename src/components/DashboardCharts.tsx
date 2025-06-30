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
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

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
  const progressPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
  const remainingVideos = Math.max(0, totalVideos - completedVideos);

  // Gráfico de Pizza (Progresso Geral) - Modernizado
  const pieData = {
    labels: ['Assistidos', 'Restantes'],
    datasets: [
      {
        data: [completedVideos, remainingVideos],
        backgroundColor: [
          'rgba(249, 115, 22, 0.8)', // Laranja vibrante para assistidos (identidade da empresa)
          'rgba(148, 163, 184, 0.3)', // Cinza suave para restantes
        ],
        borderColor: [
          'rgba(249, 115, 22, 1)',
          'rgba(148, 163, 184, 0.5)',
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(249, 115, 22, 0.9)',
          'rgba(148, 163, 184, 0.4)',
        ],
        hoverBorderWidth: 3,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#F8FAFC',
          font: {
            size: 14,
            family: 'Poppins, sans-serif',
            weight: '500',
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1',
        borderColor: 'rgba(249, 115, 22, 0.5)',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        titleFont: {
          size: 14,
          family: 'Poppins, sans-serif',
          weight: '600',
        },
        bodyFont: {
          size: 13,
          family: 'Poppins, sans-serif',
        },
        callbacks: {
          label: (context: any) => {
            const percentage = ((context.parsed / totalVideos) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} vídeos (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1500,
      easing: 'easeOutQuart' as const,
    },
  };

  // Gráfico de Barras (Progresso por Módulo) - Modernizado
  const barData = {
    labels: moduleStats.map((m) => m.moduleName),
    datasets: [
      {
        label: 'Assistidos',
        data: moduleStats.map((m) => m.completedVideos),
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Azul vibrante
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)',
        hoverBorderColor: 'rgba(59, 130, 246, 1)',
        hoverBorderWidth: 3,
      },
      {
        label: 'Total',
        data: moduleStats.map((m) => m.totalVideos),
        backgroundColor: 'rgba(148, 163, 184, 0.3)', // Cinza suave
        borderColor: 'rgba(148, 163, 184, 0.5)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(148, 163, 184, 0.4)',
        hoverBorderColor: 'rgba(148, 163, 184, 0.7)',
        hoverBorderWidth: 3,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#F8FAFC',
          font: {
            size: 14,
            family: 'Poppins, sans-serif',
            weight: '500',
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        titleFont: {
          size: 14,
          family: 'Poppins, sans-serif',
          weight: '600',
        },
        bodyFont: {
          size: 13,
          family: 'Poppins, sans-serif',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#CBD5E1',
          font: {
            size: 12,
            family: 'Poppins, sans-serif',
            weight: '500',
          },
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#CBD5E1',
          font: {
            size: 12,
            family: 'Poppins, sans-serif',
            weight: '500',
          },
          stepSize: 1,
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart' as const,
    },
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Gráfico de Pizza - Progresso Geral */}
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-slate-600/50 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"/>
              </svg>
            </div>
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Progresso Geral
            </span>
          </CardTitle>
          <div className="mt-2">
            <span className="text-3xl font-bold text-orange-400">{progressPercentage}%</span>
            <p className="text-gray-400 text-sm mt-1">de conclusão</p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pb-6">
          <div className="w-56 h-56 relative">
            <Pie data={pieData} options={pieOptions} />
          </div>
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-300 font-medium">{completedVideos} assistidos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                <span className="text-gray-300 font-medium">{remainingVideos} restantes</span>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-2">
              Total de {totalVideos} vídeos disponíveis
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Progresso por Módulo */}
      {moduleStats.length > 0 && (
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-slate-600/50 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold text-white flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              </div>
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Progresso por Módulo
              </span>
            </CardTitle>
            <p className="text-gray-400 text-sm mt-1">
              Desempenho detalhado por área
            </p>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="h-72 w-full">
              <Bar data={barData} options={barOptions} />
            </div>
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300 font-medium">Assistidos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                  <span className="text-gray-300 font-medium">Total</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 