import React, { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: ReactNode;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'primary'
}) => {
  // Define color classes based on the color prop
  const getColorClasses = (colorName: string) => {
    switch (colorName) {
      case 'primary':
        return 'bg-primary-50 text-primary-700';
      case 'secondary':
        return 'bg-secondary-50 text-secondary-700';
      case 'accent':
        return 'bg-accent-50 text-accent-700';
      case 'success':
        return 'bg-green-50 text-green-700';
      case 'warning':
        return 'bg-amber-50 text-amber-700';
      case 'error':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-primary-50 text-primary-700';
    }
  };

  const iconColorClass = getColorClasses(color);
  
  return (
    <div className="card hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          
          {change && (
            <div className="mt-1 flex items-center">
              <span className={`text-sm ${change.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value)}%
              </span>
              <span className="text-gray-500 text-xs ml-1">from last period</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-full ${iconColorClass}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;