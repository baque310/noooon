import Model from "@/components/Model";
import React from "react";

import { getTranslation } from "../../ni18n/i18n";
import { ButtonForm } from "../Form/ButtonForm";

const ConfirmModel = ({
  setOpen,
  open,
  name,
  title,
  handleConfirm,
  isLoading,
  description,
  confirmText,
  confirmButtonClass,
}: {
  setOpen: any;
  open: boolean;
  name?: string;
  title: string;
  handleConfirm: any;
  isLoading: boolean;
  description: string;
  confirmText?: string;
  confirmButtonClass?: string;
}) => {
  const { t } = getTranslation();

  return (
    <Model title={title} open={open} setOpen={setOpen}>
      <div>
        <h3 className="font-bold my-3">
          {description}
          {name && <span className="font-bold text-primary px-1">{name}</span>}
        </h3>

        <ButtonForm
          title={confirmText || t("common.confirm")}
          isLoading={isLoading}
          props={{
            className:
              confirmButtonClass ||
              "w-full !bg-primary !hover:bg-primary/80 text-white dark:text-white-dark dark:!hover:bg-primary/80 dark:hover:text-white-dark !border-primary/70",
            onClick: handleConfirm,
          }}
        />
      </div>
    </Model>
  );
};

export default ConfirmModel;
