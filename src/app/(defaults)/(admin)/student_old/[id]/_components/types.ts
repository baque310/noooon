import React from "react";

export interface StudentData {
  id?: string;
  fullName?: string;
  photo?: string | null;
  birth?: string;
  enrollmentDate?: string;
  email?: string;
  address?: string;
  phone1?: string;
  phone2?: string;
  createdAt?: string;
  updatedAt?: string;
  User?: {
    username?: string;
  };
}

export interface StudentPageHookResult {
  data: StudentData | undefined;
  isFetching: boolean;
  isLoadingStudentRemove: boolean;
  openDelete: boolean;
  setOpenDelete: (open: boolean) => void;
  handleRemove: () => Promise<void>;
}
