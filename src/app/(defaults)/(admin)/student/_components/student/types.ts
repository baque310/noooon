import React from "react";

export interface StudentData {
  id?: string;
  fullName?: string;
  photo?: string | null;
  gender?: string;
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
    id?: string;
  };
  Parent?: {
    fullName?: string;
    id?: string;
  };
  StudentEnrollment?: {
    Stage?: { name: string };
    Class?: { name: string };
    Section?: { name: string };
  }[];
}

export interface StudentPageHookResult {
  data: StudentData | undefined;
  isFetching: boolean;
  isLoadingStudentRemove: boolean;
  openDelete: boolean;
  setOpenDelete: (open: boolean) => void;
  handleRemove: () => Promise<void>;
}
