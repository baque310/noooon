
import Model from '@/components/Model'
import React from 'react'
 
import { getTranslation } from '../../ni18n/i18n';
import { ButtonForm } from '../Form/ButtonForm';
const DeleteModel = ({ setOpen, open, name, title, handleRemove, isLoading, description }: {
    setOpen: any
    , open: boolean,
    name: string, title: string, handleRemove: any, isLoading: boolean, description: string
}) => {
    const { t } = getTranslation();
    return (
        <Model
            title={title}
            open={open}
            setOpen={setOpen}

        >
            <div>
                <h3 className="font-bold my-3  ">
                    {description} <span className=" font-bold text-red-700 px-1">{name}</span>
                </h3>

                <ButtonForm
                    title={t("common.delete")}
                    isLoading={isLoading}
                    props={{
                        className: "w-full !bg-danger !hover:bg-danger/80 text-white dark:text-white-dark dark:!hover:bg-danger/80 dark:hover:text-white-dark !border-danger/70",
                        onClick: handleRemove,
                    }}
                />

            </div>
        </Model>
    )
}

export default DeleteModel