import React from 'react'
import { getTranslation } from '@/ni18n/i18n'

export const Tab = ({
    selected,
    setSelected
}: {
    selected: string,
    setSelected: (value: string) => void
}) => {

    const { t } = getTranslation()
    return (
        <div className='flex px-4 pb-2 '>
            <button
                onClick={() => setSelected("add")}
                className={` ${selected === "add" ? "bg-primary text-white" : "text-primary"}  px-4 py-2 rounded-tl-lg`}
            >
                {t("StudentPage.singleAdd")}
            </button>
            <button
                onClick={() => setSelected("muilt")}
                className={` ${selected === "muilt" ? "bg-primary text-white" : "text-primary"}  px-4 py-2 rounded-tr-lg`}
            >
                {t("StudentPage.muiltAdd")}
            </button>
        </div>
    )
}
