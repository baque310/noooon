export type BaseTheme = "light" | "dark" | "system";
export interface BaseGetDataResponse<T> {
  totalCount: number;
  pageCount: number;
  data: T[];
}
export interface GetDataRequestParams {
  search?: string;
  skip?: number;
  take?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export type PAGE_CODE =
  | "admin"
  | "school"
  | "stage"
  | "class"
  | "section"
  | "student"
  | "student_enrollment"
  | "teacher"
  | "bus"
  | "banner"
  | "guidance"
  | "gallery"
  | "subject"
  | "stage_subject"
  | "teacher_subject"
  | "schedule"
  | "section_schedule"


export type PERMISSION = "read-any" | "read-own" | "create-any" | "create-own" | "delete-any" | "delete-own" | "update-any" | "update-own";

export enum Days {
  SUNDAY = "SUNDAY",
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY"
}