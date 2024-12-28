"use client"


import React, { useState } from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { ItemList } from '@/components/common/ItemList';

import { getTranslation } from "@/ni18n/i18n";
import { useParams, useRouter } from "next/navigation";

import { ArrowIcons } from '@/components/common/icons/Actions';
import moment from 'moment';
import { useSettingGetDataQuery } from '@/services/Setting';
import CreateComponent from './CreateComponent';

const PageComponent = () => {
    const { t } = getTranslation();
    const params = useParams()
    const { currentData: data, isFetching } = useSettingGetDataQuery()
    const [open, setOpen] = useState(false)
    return (
        <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">

            <div className="text-lg font-semibold text-black dark:text-white-dark  my-2 ">
                {t('Setting.SettingInformation')}
            </div>

            {
                isFetching ? <LoadingForm /> : <>
                    <div className='CardDetails internalMenu '>
                        <ItemList title={t('Setting.CurrentSchoolYear')} value={data?.CurrentSchoolYear.from + " - " + data?.CurrentSchoolYear.to} />
                        <ItemList title={t('common.updatedAt')} value={moment(data?.updatedAt).format("YYYY-MM-DD hh:mm:ss A")} />
                        <ItemList title={t('common.createdAt')} value={moment(data?.createdAt).format("YYYY-MM-DD hh:mm:ss A")} />
                    </div>

                    <div className="text-sm font-semibold text-black dark:text-white-dark  mt-2 mb-1 ">
                        {t('common.settings')}
                    </div>
                    <div className='CardDetails internalMenu '>
                        <ItemList
                            props={{
                                onClick: () => {
                                    setOpen(true)
                                }
                            }}
                            title={t('Setting.update-info')}
                            value={<ArrowIcons className='rtl:rotate-180 text-[#000]/50' />}
                        />
                    </div>
                </>
            }
            <CreateComponent open={open} setOpen={setOpen} />
        </div>
    );
};

export default PageComponent

