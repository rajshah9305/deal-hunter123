import { Stat } from "@/lib/types";
import { LucideIcon } from "lucide-react";
import { ArrowDownIcon, ArrowUpIcon, BoxIcon, CheckCircleIcon, DollarSignIcon, FileTextIcon } from "lucide-react";

interface StatCardProps {
  stat: Stat;
}

export default function StatCard({ stat }: StatCardProps) {
  // Get the correct icon based on the stat.icon string
  const getIcon = (): LucideIcon => {
    switch (stat.icon) {
      case 'file-text': return FileTextIcon;
      case 'dollar-sign': return DollarSignIcon;
      case 'box': return BoxIcon;
      case 'check-circle': return CheckCircleIcon;
      default: return FileTextIcon;
    }
  };

  const Icon = getIcon();

  // Determine the icon background color
  const getIconBgColor = (): string => {
    switch (stat.icon) {
      case 'file-text': return 'bg-[#F5F5F5] text-[#4A6670]';
      case 'dollar-sign': return 'bg-[#F5F5F5] text-[#FFB800]';
      case 'box': return 'bg-[#F5F5F5] text-[#FF7F6B]';
      case 'check-circle': return 'bg-[#F5F5F5] text-[#4A6670]';
      default: return 'bg-[#F5F5F5] text-[#1C1C28]';
    }
  };

  // Format the value based on the stat type
  const formatValue = (): string => {
    if (stat.name.toLowerCase().includes('profit')) {
      return `$${stat.value.toLocaleString()}`;
    } else if (stat.name.toLowerCase().includes('rate') || stat.name.toLowerCase().includes('percentage')) {
      return `${stat.value}%`;
    } else if (stat.name.toLowerCase().includes('value')) {
      return `$${stat.value.toLocaleString()}`;
    } else {
      return stat.value.toString();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01]">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[#2D2D3A] text-sm font-medium">{stat.name}</p>
          <p className="text-[#1C1C28] text-2xl font-bold mt-1">{formatValue()}</p>
        </div>
        <div className={`p-2 rounded-lg ${getIconBgColor()}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={`flex items-center text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
          {stat.changeType === 'positive' ? (
            <ArrowUpIcon className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 mr-1" />
          )}
          {Math.abs(stat.change || 0)}%
        </span>
        <span className="text-[#2D2D3A] text-sm ml-2">vs last month</span>
      </div>
    </div>
  );
}
