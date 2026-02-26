import { toLocaleString } from "@/utils/LocaleString";
import { memo, ReactNode, useEffect } from "react";

const RoleComponent = ({
  setIsActive,
  disabled,
  icon,
  label,
  number,
}: {
  number: number;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  disabled: boolean;
  icon: ReactNode;
  label: string;
}) => {
  useEffect(() => {
    setIsActive(disabled);
  }, [disabled]);

  return (
    <div className="flex items-center py-1 justify-between w-full font-bold ltr:pl-3 rtl:pr-3">
      <div className="flex items-center">
        {icon}
        <span className="ltr:pl-3 rtl:pr-3">{label}</span>
      </div>

      {number > 0 && <div className="flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">{toLocaleString(number)}</div>}
    </div>
  );
};

export const MenuRoleComponent = memo(RoleComponent);
