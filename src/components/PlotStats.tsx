interface PlotStatsProps {
  stats: {
    total: number;
    available: number;
    sold: number;
    reserved: number;
    inactive: number;
  };
}

export default function PlotStats({ stats }: PlotStatsProps) {
  const statsCards = [
    {
      title: 'Total Plots',
      value: stats.total,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Available',
      value: stats.available,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Sold',
      value: stats.sold,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Reserved',
      value: stats.reserved,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statsCards.map((stat) => (
        <div key={stat.title} className={`${stat.bgColor} rounded-lg p-4`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 ${stat.color} rounded-full mr-3`}></div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}