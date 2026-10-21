import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning';
}

const colorClasses = {
  primary: 'bg-primary-50 text-primary-600 border-primary-200',
  secondary: 'bg-secondary-50 text-secondary-600 border-secondary-200',
  accent: 'bg-accent-50 text-accent-600 border-accent-200',
  success: 'bg-green-50 text-green-600 border-green-200',
  warning: 'bg-yellow-50 text-yellow-600 border-yellow-200',
};

export function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p
              className={`text-sm mt-1 ${
                changeType === 'positive'
                  ? 'text-green-600'
                  : changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-600'
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-lg border flex items-center justify-center ${colorClasses[color]}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
