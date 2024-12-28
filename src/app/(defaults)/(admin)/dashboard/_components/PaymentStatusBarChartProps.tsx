import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getTranslation } from "../../../../../ni18n/i18n";
import { useMediaQuery } from "react-responsive";
import { IDashboard } from "@/services/admin/Dashboard";

export const PaymentStatusBarChart = ({
  data,
}: {
  data: IDashboard | undefined
}) => {
  const { t }: any = getTranslation();

  const Absent = data?.attendanceCounts.month.Absent || "0";
  const Vacation = data?.attendanceCounts.month.Vacation || "0";
  const Present = data?.attendanceCounts.month.Present || "0";


  const chartData = [
    { name: t("Absent"), value: Absent, fill: "#4CAF50" },
    { name: t("Vacation"), value: Vacation, fill: "#F44336", },
    { name: t("Absent"), value: Absent, fill: "#4CAF50" },
    { name: t("Present"), value: Present, fill: "#F44336", },
    { name: t("Absent"), value: Absent, fill: "#4CAF50" },
    { name: t("Present"), value: Present, fill: "#F44336", },
    { name: t("Absent"), value: Absent, fill: "#4CAF50" },
  ];
  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });
  const chartHeight = isSmallScreen ? 450 : 350;

  return (
    <div className="Card">
      <div className="card-header mb-4">
        <h5 className="text-xl font-semibold text-right">
          {t("Payment_Status")}
        </h5>
      </div>
      <div className="card-content flex justify-center items-center">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <Tooltip />
            <Legend content={<CustomLegend data={chartData} />} />
            <Bar dataKey="value" name={t("Absent")} fill="#4CAF50" barSize={60} />
            <Bar dataKey="value" name={t("Vacation")} fill="#F44336" />
            <Bar dataKey="value" name={t("Present")} fill="#F44336" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const CustomLegend = ({ payload, data }: any) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
      {data.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center">
          <div
            className="w-3 h-3  mx-1"
            style={{ backgroundColor: entry.fill }}
          ></div>
          <span
            className="text-sm dark:text-gray-300"
            style={{ color: entry.fill }}
          >
            {`${entry.name}: ${entry.value.toLocaleString()}`}
          </span>
        </div>
      ))}
    </div>
  );
};
