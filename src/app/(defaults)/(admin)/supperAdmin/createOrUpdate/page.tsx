// "use client";
// import * as Yup from "yup";
// import { getTranslation } from "../../../../ni18n/i18n";
// import { Form, Formik, FormikHelpers, FormikProps } from "formik";
// import { LoadingForm } from "@/components/Form/loadingForm";
// import { InputForm } from "@/components/Form/inputForm";
// import { ButtonForm } from "@/components/Form/ButtonForm";
// import { useEffect, useState } from "react";
// import { UploadFileForm } from "@/components/Form/uploadFileForm";
// import {
//   AddAdminPayload,
//   AdminDataResponse,
//   Roles,
//   useAdminChangeStatusActiveMutation,
//   useAdminChangeStatusInActiveMutation,
//   useAdminCompoundCreateMutation,
//   useAdminCompoundUpdateMutation,
//   useAdminCreateMutation,
//   useAdminForCompoundRemoveMutation,
//   useAdminRemoveMutation,
//   useAdminUpdateMutation,
//   useLazyAdminGetDataByIdQuery,
// } from "@/services/Manager/Admin";
// import { useRouter, useSearchParams } from "next/navigation";
// import { toast } from "react-toastify";
// import DeleteModel from "@/components/Model/DeleteModel";
// import { BackButton } from "@/components/common/BackButton"; 
// import { OptionType, SelectForm } from "@/components/Form/SelectForm";
// import { useSession } from "next-auth/react";
//  import { RolePageAndActionBasedComponent } from "@/components/Provider/RolePageAndActionBasedComponent";

// interface FormValues extends AddAdminPayload {}

// const Page = () => {
//   const { t } = getTranslation();
//   const session = useSession();

//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const id = searchParams.get("id");

//   const [dataById, setDataById] = useState<AdminDataResponse | undefined>();
//   const [dataAdminCompoundById, setDataAdminCompoundById] = useState<
//     AdminDataResponse | undefined
//   >();
//   const [searchCompound, setSearchCompound] = useState("");
//   const [AdminGetDataById, { currentData: DataAdminGetDataById, isFetching }] =
//     useLazyAdminGetDataByIdQuery();
 

//   useEffect(() => {
//     if (id) {
//       AdminGetDataById({ id: String(id) }).then((data) => {
//         setDataById(data.data);
//       });
//     }
//   }, [id]);
//   useEffect(() => {
//     if (session.data?.user.id) {
//       AdminGetDataById({ id: String(session.data?.user.id) }).then((data) => {
//         setDataAdminCompoundById(data.data);
//       });
//     }
//   }, [session]);
 
 

//   const validationSchema = Yup.object().shape({
//     username: Yup.string()
//       .matches(
//         /^(?=.{5,20}$)(?![.])(?!.*[.]{2})[a-zA-Z0-9.\u0600-\u06FF]+(?<![.])$/,
//         t(
//           "username-must-be-5-20-characters-long-and-can-contain-letters,-numbers,-and-periods.-It-cannot-start-or-end-with-a-period."
//         )
//       )
//       .required(t("this-field-is-required")),

//     ...(id && {
//       photo: Yup.string().required(t("this-field-is-required")),
//     }),

//     ...(!id && {
//       password: Yup.string()
//         .min(8, t("password-must-be-at-least-8-characters-long"))
//         .matches(
//           /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
//           t("password-must-contain-letters-numbers-and-special-characters")
//         )
//         .required(t("this-field-is-required")),
//     }),

//     ...(id && {
//       password: Yup.string()
//         .nullable() // لجعل الحقل يمكن أن يكون فارغًا
//         .test(
//           "is-strong-password",
//           t("password-must-contain-letters-numbers-and-special-characters"),
//           (value) => {
//             if (!value) return true; // إذا كانت كلمة المرور فارغة، لا يتم التحقق
//             return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
//               value
//             ); // التحقق من الشروط
//           }
//         )
//         .min(8, t("password-must-be-at-least-8-characters-long")),
//     }),

//     ...(id &&
//       !isCompound && {
//         compoundId: Yup.string().required(t("this-field-is-required")),
//       }),
//   });

//   const [AdminCreate, { isLoading: isLoadingAdminCreate }] =
//     useAdminCreateMutation();
//   const [AdminCompoundCreate, { isLoading: isLoadingAdminCompoundCreate }] =
//     useAdminCompoundCreateMutation();
//   const [AdminUpdate, { isLoading: isLoadingAdminUpdate }] =
//     useAdminUpdateMutation();
//   const [AdminCompoundUpdate, { isLoading: isLoadingAdminCompoundUpdate }] =
//     useAdminCompoundUpdateMutation();
//   const [ChangeStatusActive, { isLoading: isLoadingChangeStatusActive }] =
//     useAdminChangeStatusActiveMutation();
//   const [ChangeStatusInActive, { isLoading: isLoadingChangeStatusInActive }] =
//     useAdminChangeStatusInActiveMutation();

//   const handleSubmit = async (
//     values: FormValues,
//     { setSubmitting, resetForm }: FormikHelpers<FormValues>
//   ) => {
//     try {
//       const roles = values.roles.map((item) => {
//         return {
//           resource: item.resource,
//           resource_ar: item.resource_ar,
//           icon: item.icon,
//           permissions: item.roles,
//         };
//       });
//       const formData = new FormData();
//       if (typeof values.photo === "string") {
//         delete (values as any).photo;
//       }
//       for (const key in values) {
//         if (key == "roles") {
//           formData.append(
//             "roles",
//             JSON.stringify(
//               (roles as Roles[]).filter((value) => value.resource != "")
//             )
//           );
//         } else if (key == "password") {
//           values.password && formData.append(key, (values as any)[key]);
//         } else {
//           formData.append(key, (values as any)[key]);
//         }
//       }
//       let res;
//       if (id) {
//         isCompound
//           ? await AdminCompoundUpdate({
//               id: String(id),
//               body: formData,
//             }).unwrap()
//           : await AdminUpdate({
//               id: String(id),
//               body: formData,
//             }).unwrap();
//       } else {
//         res = isCompound
//           ? await AdminCompoundCreate({
//               ...values,
//               roles: dataAdminCompoundById?.roles ?? [],
//             }).unwrap()
//           : await AdminCreate(values).unwrap();
//       }

//       toast.success(t(id ? "updated-successfully" : "added-successfully"), {
//         autoClose: 30000,
//       });
//       resetForm();
//       if (id) {
//         router.back();
//       } else {
//         router.replace(`/changeRole?id=${res?.id}`);
//       }
//     } catch (error: any) {
//       console.error("Failed to operation :", error);
//       if (error) {
//         return toast.error(JSON.stringify(error), { autoClose: 30000 });
//       }
//       toast.error(error, { autoClose: 30000 });
//     }
//   };
//   const [AdminRemove, { isLoading: isLoadingAdminRemove }] =
//     useAdminRemoveMutation();
//   const [
//     AdminForCompoundRemove,
//     { isLoading: isLoadingAdminForCompoundRemove },
//   ] = useAdminForCompoundRemoveMutation();

//   const handleRemove = async () => {
//     try {
//       (await isCompound)
//         ? AdminForCompoundRemove({ id: String(id) }).unwrap()
//         : AdminRemove({ id: String(id) }).unwrap();
//       toast.success(t("deleted-successfully"), { autoClose: 30000 });
//       router.replace("/");
//     } catch (error: any) {
//       console.error("Failed to operation :", error);
//       if (error && error.message) {
//         return toast.error(error.message, { autoClose: 30000 });
//       }
//       toast.error(error, { autoClose: 30000 });
//     }
//   };
//   const isActive = dataById?.isActive == "true";

//   return (
//     <>
//       <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
//         <BackButton title={t(id ? "update" : "add")} />
//         {isFetching ? (
//           <LoadingForm />
//         ) : (
//           <Formik<FormValues>
//             initialValues={{
//               username: dataById?.username ?? "",
//               photo: dataById?.photo ?? "",
//               password: undefined,
//               isActive: dataById?.isActive ?? "",
//               ...(id &&
//                 !isCompound && {
//                   compoundId: dataById?.Compound?.id ?? undefined,
//                 }),
//               roles: Array.isArray(dataById?.roles) ? [...dataById.roles] : [],
//             }}
//             validationSchema={validationSchema}
//             onSubmit={handleSubmit}
//           >
//             {(props: FormikProps<any>) => (
//                 <Form className={"px-4 flex flex-col gap-4"}>
//                 <div className="Card flex flex-col gap-1">
//                   <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
//                     {t("user-information")}
//                   </div>
//                   <InputForm
//                     formikProps={props}
//                     name={"username"}
//                     title={t("username")}
//                     placeholder={t("enter-username")}
//                   />

//                   <InputForm
//                     formikProps={props}
//                     name={"password"}
//                     title={t("password")}
//                     placeholder={t("enter-password")}
//                     isPassword={true}

//                   />
//                   {id && !isCompound && (
//                     <SelectForm
//                       formikProps={props}
//                       name={"compoundId"}
//                       title={t("compound")}
//                       placeholder={t("choses-compound")}
//                       options={
//                         DataCompoundGetDataForManage?.data?.map((item) => {
//                           return { label: item.name, value: item.id };
//                         }) as []
//                       }
//                       props={{
//                         isClearable: true,
//                         onChange(val) {
//                           props.setFieldValue(
//                             `compoundId`,
//                             (val as OptionType)?.value ?? ""
//                           );
//                         },
//                         isLoading: isFetchingCompoundGetDataForManage,
//                         onInputChange(newValue, actionMeta) {
//                           if (actionMeta.action === "input-change") {
//                             setSearchCompound(newValue);
//                           }
//                         },
//                       }}
//                     />
//                   )}

//                   <SelectForm
//                     formikProps={props}
//                     name={"isActive"}
//                     title={t("status")}
//                     placeholder={t("choses-status")}
//                     options={[
//                       { label: t("active"), value: "true" },
//                       { label: t("inactive"), value: "false" },
//                     ]}
//                     props={{
//                       isClearable: true,
//                       onChange(val) {
//                         props.setFieldValue(
//                           `isActive`,
//                           (val as OptionType)?.value ?? ""
//                         );
//                       },
//                     }}
//                   />
//                 </div>

//                 {id && (
//                   <div className="Card flex flex-col gap-1">
//                     <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
//                       {t("img-info")}
//                     </div>

//                     <UploadFileForm
//                       valueFileName={props.values.photo}
//                       formikProps={props}
//                       name={"photo"}
//                       title={t("image")}
//                       placeholder={""}
//                     />
//                   </div>
//                 )}

//                 <div className="flex flex-row-reverse gap-2">
//                   {
//                     <RolePageAndActionBasedComponent
//                       component={(props) => {
//                         return (
//                           <ButtonForm
//                             props={{
//                               disabled: props?.disabled,
//                               className: `${props?.disabled && "hidden"}`,
//                             }}
//                             title={t("save")}
//                             isLoading={
//                               isLoadingAdminCreate ||
//                               isLoadingAdminUpdate ||
//                               isLoadingAdminCompoundCreate ||
//                               isLoadingAdminCompoundUpdate
//                             }
//                           />
//                         );
//                       }}
//                       resource={"admin"}
//                       permission={
//                         id
//                           ? ["update-any", "update-own"]
//                           : ["create-any", "create-own"]
//                       }
//                     />
//                   }
//                   {/* <ButtonForm title={t("save")} isLoading={isLoadingAdminCreate || isLoadingAdminUpdate || isLoadingAdminCompoundCreate || isLoadingAdminCompoundUpdate} /> */}

//                   {id && (
//                     <ButtonForm
//                       props={{
//                         onClick: () => {
//                           if (!isActive) {
//                             ChangeStatusActive({ id: String(id) }).unwrap();
//                             toast.success(t("active-successfully"), {
//                               autoClose: 30000,
//                             });
//                           } else {
//                             ChangeStatusInActive({ id: String(id) }).unwrap();
//                             toast.success(t("inactive-successfully"), {
//                               autoClose: 30000,
//                             });
//                           }
//                         },
//                         type: "button",
//                         className: !isActive
//                           ? " hover:!bg-success/10 !border-success/70 !text-success/70 !bg-transparent "
//                           : " hover:!bg-danger/10 !border-danger/70 !text-danger/70 !bg-transparent",
//                       }}
//                       title={t(!isActive ? "isActive" : "isInActive")}
//                       isLoading={false}
//                     />
//                   )}
//                   {id && (
//                     <RolePageAndActionBasedComponent
//                       component={(props) => {
//                         return (
//                           <ButtonForm
//                             props={{
//                               onClick: () => {
//                                 router.push(
//                                   window.location.href + "&openDeleteModel=true"
//                                 );
//                               },
//                               type: "button",
//                               disabled: props?.disabled,
//                               className: `${
//                                 props?.disabled && "hidden"
//                               } hover:!bg-danger/10 !border-danger/70 !text-danger/70 !bg-transparent`,
//                             }}
//                             title={t("delete")}
//                             isLoading={false}
//                           />
//                         );
//                       }}
//                       resource={"admin"}
//                       permission={["delete-any", "delete-own"]}
//                     />
//                   )}
//                 </div>
//               </Form>
//             )}
//           </Formik>
//         )}
//       </div>
//       <DeleteModel
//         name={String(dataById?.username)}
//         title={t("delete-user")}
//         handleRemove={handleRemove}
//         isLoading={isLoadingAdminRemove || isLoadingAdminForCompoundRemove}
//         description={t("are-you-sure-you-want-to-delete-this-user")}
//       />
//     </>
//   );
// };

// export default Page;


import React from 'react'

const Page = () => {
  return (
    <div>Page</div>
  )
}

export default Page