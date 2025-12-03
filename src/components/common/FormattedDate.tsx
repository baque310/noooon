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
