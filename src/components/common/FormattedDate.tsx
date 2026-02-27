import moment from "moment";

const FormattedDate = ({ date }: { date: string }) => {
  return date ? (
    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
      {moment(date).format("MM/DD/YYYY")}
      <div className="text-xs text-gray-400">{moment(date).format("HH:mm")}</div>
    </div>
  ) : null;
};

export default FormattedDate;

interface FormattedDateProps {
  date: string;
  label?: string;
}

export const FormattedDate2 = ({ date, label }: FormattedDateProps) => {
  if (!date) return null;

  return (
    <div className="flex items-center justify-between gap-2 px-1 py-0.5">
      {label && <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}:</span>}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-900 dark:text-white">{moment(date).format("YYYY/MM/DD")}</span>
        {/* <span className="text-xs text-gray-500 dark:text-gray-400">{moment(date).format("HH:mm")}</span> */}
      </div>
    </div>
  );
};
