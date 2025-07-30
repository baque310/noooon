"use client";

import React, { useEffect } from "react";
import { getTranslation } from "../../../../../ni18n/i18n";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { ItemList } from "@/components/common/ItemList";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { IRootState } from "@/store";
import moment from "moment";
import Link from "next/link";
import { Gallery } from "@/components/common/LightboxImagePreview";
import { useLazyComplaintGetDataByIdQuery } from "@/services/admin/complaint";
import { ArrowIcons } from "@/components/common/icons/Actions";

const Index = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [
    ComplaintGetDataById,
    { currentData: DataComplaintGetDataById, isFetching },
  ] = useLazyComplaintGetDataByIdQuery();
  useEffect(() => {
    if (id) {
      ComplaintGetDataById({ id: String(id) });
    }
  }, [id]);

  const isRtl =
    useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl";

  return (
    <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
      <BackButton title={t("ComplaintPage.complaint-information")} />

      {isFetching ? (
        <LoadingForm />
      ) : (
        <>
          <div className="CardDetails internalMenu ">
            <ItemList
              title={t("ComplaintPage.title")}
              value={String(DataComplaintGetDataById?.description)}
            />
            <ItemList
              title={t("ComplaintPage.description")}
              value={String(DataComplaintGetDataById?.description)}
            />
            <ItemList
              title={t("common.update")}
              value={moment(DataComplaintGetDataById?.updatedAt).format(
                "YYYY-MM-DD"
              )}
            />
            <ItemList
              title={t("common.createdAt")}
              value={moment(DataComplaintGetDataById?.createdAt).format(
                "YYYY-MM-DD"
              )}
            />
            <Link
              href={`/adminComplaint/changeStatus?id=${DataComplaintGetDataById?.id}`}
            >
              <ItemList
                title={t("common.status")}
                value={
                  <div className="flex gap-2 px-[2px]">
                    {DataComplaintGetDataById?.approval_status == "approved" ? (
                      <div
                        className={` rounded-md p-1 ltr:ml-2 rtl:ml-2  bg-success/20 text-success `}
                      >
                        {t(DataComplaintGetDataById?.approval_status ?? "")}
                      </div>
                    ) : DataComplaintGetDataById?.approval_status ==
                      "pending" ? (
                      <div
                        className={` rounded-md p-1 ltr:ml-2 rtl:ml-2  bg-warning/20 text-warning `}
                      >
                        {t(DataComplaintGetDataById?.approval_status ?? "")}
                      </div>
                    ) : (
                      <div
                        className={` rounded-md p-1 ltr:ml-2 rtl:ml-2  bg-danger/50 text-danger`}
                      >
                        {t(
                          DataComplaintGetDataById?.approval_status ??
                            ("" as any)
                        )}
                      </div>
                    )}
                  </div>
                }
              />
            </Link>
            {DataComplaintGetDataById?.ComplAttachment &&
              DataComplaintGetDataById.ComplAttachment.length > 0 && (
                <ItemList title={t("common.image")} value="">
                  <Gallery
                    images={DataComplaintGetDataById.ComplAttachment.map(
                      (item) => item.url
                    )}
                  />
                </ItemList>
              )}
          </div>

          <div className="text-sm font-semibold text-black dark:text-white-dark  mt-2 mb-1 ">
            {t("Setting.Setting")}
          </div>
          <div className="CardDetails internalMenu ">
            <ItemList
              props={{
                onClick: () => {
                  router.push(
                    `/adminComplaint/changeStatus?id=${DataComplaintGetDataById?.id}`
                  );
                },
              }}
              title={t("ComplaintPage.changeStatus-complaints")}
              value={<ArrowIcons className="rtl:rotate-180 text-[#000]/50" />}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
