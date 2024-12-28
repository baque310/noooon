"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Formik, Form, FormikHelpers, FormikProps } from "formik";
import { LoadingForm } from "@/components/Form/loadingForm";
import { InputForm } from "@/components/Form/inputForm";
import { ButtonForm } from "@/components/Form/ButtonForm";
import { BackButton } from "@/components/common/BackButton";

import { sortBy } from "lodash";
import { searchArray } from "@/utils/searchArray";
import { useSession } from "next-auth/react";
import { RolePageAndActionBasedComponent } from "@/components/Provider/RolePageAndActionBasedComponent";
import { AddSupperAdminPayload, PossessionRoles, Roles, useLazySupperAdminGetDataByIdQuery, useSupperAdminGetDataOwnRolesQuery, useSupperAdminUpdateMutation } from "@/services/admin/SupperAdmin";
import { getTranslation } from "@/ni18n/i18n";

interface FormValues extends AddSupperAdminPayload {
  dataAvailableGroupPrivileges: Roles[];
  search?: string;
}

const TabList = [
  { label: "all", name: "all" },
  { label: "checked", name: "checked" },
  { label: "unchecked", name: "unchecked" },
];

const Page = () => {
  const { t } = getTranslation();
  const [selected, setSelected] = useState<string>(TabList[0].name);
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const session = useSession();

  const [AdminGetDataById, { currentData: DataAdminGetDataById, isFetching, isLoading }] =
    useLazySupperAdminGetDataByIdQuery();
  const { currentData: DataSupperAdminGetDataOwnRoles, isFetching: isFetchingSupperAdminGetDataOwnRoles } = useSupperAdminGetDataOwnRolesQuery();




  useEffect(() => {
    if (id) {
      AdminGetDataById({ id: String(id) })
    }
  }, [id]);



  const [AdminUpdate, { isLoading: isLoadingAdminUpdate }] = useSupperAdminUpdateMutation();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {
      const roles = values.dataAvailableGroupPrivileges.map((item) => {
        const roles = item.rolesString?.map((role) => {
          return {
            action: role.split("-")[0],
            possession: role.split("-")[1],
          };
        }) as PossessionRoles[];
        return {
          resource: item.resource,
          resource_ar: item.resource_ar,
          icon: item.icon,
          permissions: roles,
        };
      });

      const formData = new FormData();
      if (typeof values.photo === "string") {
        delete (values as any).photo;
      }
      for (const key in values) {
        if (key == "roles" || key == "password" || key == "search") {
        } else if (key == "dataAvailableGroupPrivileges") {
          formData.append("roles", JSON.stringify((roles as Roles[]).filter((value) => value.resource != "")));
        } else {
          formData.append(key, (values as any)[key]);
        }
      }
      await AdminUpdate({ id: String(id), body: formData }).unwrap();


      toast.success(t("common.updated-successfully"), { autoClose: 30000 });
      resetForm();
      router.back();
    } catch (error: any) {
      console.error("Failed to operation :", error);
      toast.error(JSON.stringify(error), { autoClose: 30000 });
    }
  };

  return (
    <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
      <BackButton title={t("SupperAdminPage.update-role")} />
      {isFetching || isFetchingSupperAdminGetDataOwnRoles ? (
        <LoadingForm />
      ) : (
        <Formik<FormValues>
          initialValues={{
            username: DataAdminGetDataById?.username ?? "",
            photo: DataAdminGetDataById?.photo ?? "",
            password: undefined,
            isActive: DataAdminGetDataById?.isActive ?? "false",
            roles: Array.isArray(DataAdminGetDataById?.roles) ? [...DataAdminGetDataById.roles] : [],
            dataAvailableGroupPrivileges: Array.isArray(DataAdminGetDataById?.roles) ? [...DataAdminGetDataById.roles] : [],
          }}
          onSubmit={handleSubmit}>
          {(props: FormikProps<FormValues>) => (
            <Form className="p-4 flex flex-col gap-4">
              <div className="Card flex flex-col gap-1">
                <div className="text-base font-semibold text-black dark:text-white-dark mb-2">{t("SupperAdminPage.role-information")}</div>
                <div className="px-1 flex items-center justify-between bg-primary rounded-lg py-1">
                  {TabList.map((item, index) => (
                    <button
                      type="button"
                      key={index}
                      onClick={() => setSelected(item.name)}
                      className={`h-full md:w-full px-2 py-1 ${selected !== item.name ? "" : "bg-white/40"} rounded-md transition-transform`}>
                      <div className="font-['Loew Next Arabic'] text-center font-bold uppercase tracking-tight text-white">{t(item.label as any)}</div>
                    </button>
                  ))}
                </div>
                <InputForm formikProps={props} name="search" title="" placeholder={t("common.search")} />
                <div className="h-[calc(100vh-320px)] overflow-y-auto">
                   {sortBy(searchArray<Roles>(DataSupperAdminGetDataOwnRoles, props.values.search, ["resource_ar"]), "resource_ar")
                    .filter(
                      (it: Roles) =>
                        selected === "all" ||
                        (selected === "checked" && props.values?.dataAvailableGroupPrivileges?.some((per: any) => per.resource === it.resource)) ||
                        (selected === "unchecked" && !props.values?.dataAvailableGroupPrivileges?.some((per: any) => per.resource === it.resource))
                    )
                    .map((privilege: Roles) => (
                      <div key={privilege.resource} className="p-1 w-full flex flex-col">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox peer"
                            checked={props.values?.dataAvailableGroupPrivileges?.some((per: any) => per.resource === privilege.resource)}
                            onChange={(event) => {
                              const updatedPrivileges = event.target.checked
                                ? ([...(props.values.dataAvailableGroupPrivileges as any), privilege] as any)
                                : (props.values.dataAvailableGroupPrivileges?.filter((val: any) => val.resource !== privilege.resource) as any);
                              props.setFieldValue("dataAvailableGroupPrivileges", updatedPrivileges);
                            }}
                          />
                          <span className="peer-checked:text-primary">{t(privilege.resource_ar as any)}</span>
                        </label>
                        <div className="my-2 flex flex-col mx-4 gap-1">
                          {privilege.rolesString?.map((permission, index) => (
                            <label key={index} className="inline-flex w-[180px]">
                              <input
                                type="checkbox"
                                className="form-checkbox peer"
                                checked={props.values?.dataAvailableGroupPrivileges?.some(
                                  (pri: Roles) =>
                                    pri.resource == privilege.resource &&
                                    // pri.roles?.find((i) => i.action == permission.action)?.action
                                    // == permission.action
                                    // &&
                                    // pri.roles?.find((i) => i.possession == permission.possession)?.possession
                                    // == permission.possession
                                    pri.rolesString?.find((i) => i == permission) == permission
                                )}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                  const privilegeIndex = JSON.parse(
                                    JSON.stringify(props.values.dataAvailableGroupPrivileges?.findIndex((p: Roles) => p.resource === privilege.resource))
                                  );
                                  if (privilegeIndex !== -1) {
                                    let updatedPrivileges: Roles[] = [...JSON.parse(JSON.stringify(props.values.dataAvailableGroupPrivileges))];
                                    if (event.target.checked) {
                                      updatedPrivileges[privilegeIndex].rolesString = [...(updatedPrivileges[privilegeIndex]?.rolesString as any), permission];
                                    } else {
                                      updatedPrivileges[privilegeIndex].rolesString = updatedPrivileges[privilegeIndex]?.rolesString?.filter((perm) => perm !== permission);
                                    }
                                    props.setFieldValue("dataAvailableGroupPrivileges", updatedPrivileges);
                                  } else {
                                    const privilegeData: Roles = JSON.parse(JSON.stringify(privilege));
                                    privilegeData.rolesString = [permission];
                                    const updatedPrivileges = [...(props.values.dataAvailableGroupPrivileges as Roles[]), privilegeData] as Roles[];
                                    props.setFieldValue("dataAvailableGroupPrivileges", updatedPrivileges);
                                  }
                                }}
                              />
                              <span className="peer-checked:text-primary">{t(permission as any)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  {sortBy(searchArray<Roles>(DataSupperAdminGetDataOwnRoles, props.values.search, ["resource_ar"]), "resource_ar").length === 0 && (
                    <div className="flex justify-center items-center h-full w-full">
                      <div>{t("common.no-data")}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-row-reverse gap-2">
                {
                  <RolePageAndActionBasedComponent
                    component={(props) => {
                      return (
                        <ButtonForm
                          props={{
                            disabled: props?.disabled,
                            className: `${props?.disabled && "hidden"}`,
                          }}
                          title={t("common.save")}
                          isLoading={isLoadingAdminUpdate}
                        />
                      );
                    }}
                    resource={"admin"}
                    permission={["update-any", "update-own"]}
                  />
                }
              </div>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default Page;
