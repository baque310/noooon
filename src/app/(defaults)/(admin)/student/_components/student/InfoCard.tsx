import React from "react";

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | null | undefined;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  iconBgFrom: string;
  iconBgTo: string;
  colSpan?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, value, gradientFrom, gradientTo, borderColor, iconBgFrom, iconBgTo, colSpan = "" }) => {
  return (
    <div className={`group relative ${colSpan}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl transform group-hover:scale-105 transition-transform duration-300`}></div>
      <div className={`relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border ${borderColor}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 bg-gradient-to-br ${iconBgFrom} ${iconBgTo} rounded-lg flex items-center justify-center`}>{icon}</div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{title}</h3>
        </div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{value || "N/A"}</p>
      </div>
    </div>
  );
};

export default InfoCard;
