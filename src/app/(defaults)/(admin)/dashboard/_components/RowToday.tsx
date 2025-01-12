import {
  Pie,
  PieChart,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Sector,
  Legend,
} from "recharts";
import { getTranslation } from "../../../../../ni18n/i18n";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { IDashboard } from "@/services/admin/Dashboard";

export const RowToday = ({
  data,
}: {
  data: IDashboard | undefined
}) => {
  const { t } = getTranslation();

  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });
  const chartHeight = isSmallScreen ? 450 : 350;


  const chartData = [
    {
      name: t("DashboardPage.absent"),
      value: data?.attendanceCounts.today.Absent ?? 0,
       fill: "#c42727"
    },
    {
      name: t("DashboardPage.present"),
      value: data?.attendanceCounts.today.Present ?? 0,
      fill: "#2aab68",
    },
    {
      name: t("DashboardPage.vacation"),
      value: data?.attendanceCounts.today.Vacation ?? 0,
      fill: "#2544a3",
    },

  ];

  const allValuesZero = chartData.every((item) => item.value === 0);

  const displayData = allValuesZero ? chartData : chartData;

 
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="Card w-full p-4 shadow-lg rounded-lg bg-white dark:bg-gray-800 transition-all duration-500">
      <div className="card-header mb-4">
        <h5 className="text-lg font-bold text-gray-800 dark:text-gray-200 text-right">
          {t("DashboardPage.ThisToday")}
        </h5>
      </div>
      <div className="card-content flex justify-center items-center">
        <ResponsiveContainer width="100%" height={chartHeight} className="md:height-[350px]" >
          <PieChart>
            <Pie
              data={displayData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={100} // زيادة مساحة الدائرة الداخلية
              activeIndex={activeIndex} // لتفعيل الرسوم المتحركة عند التفاعل
              activeShape={renderActiveShape} // شكل مخصص للجزء النشط
              onMouseEnter={onPieEnter} // يضيف تفاعل عند تحريك الفأرة فوق القسم
              paddingAngle={5} // إضافة مسافة بين القطع

            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                padding: "10px",
              }}
            />
            <Legend content={<CustomLegend payload={chartData} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
  } = props;
  return (
    <g>
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fill={fill}
        className="font-semibold text-sm"
      >
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
      />
      <text
        x={cx}
        y={cy + 20}
        textAnchor="middle"
        fill="#333"
        className="font-semibold text-sm"
      >
        {`${value}`}
      </text>
    </g>
  );
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2  gap-2 items-start">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center">
          <div
            className="w-3 h-3  mx-1"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span
            className="text-sm dark:text-gray-300"
            style={{ color: entry.color }}
          >
            {`  ${entry.value} :   ${entry.payload.value}  `}
          </span>
        </div>
      ))}
    </div>
  );
};
