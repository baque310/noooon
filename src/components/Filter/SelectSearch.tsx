import React from 'react'
import Select, { GroupBase, OptionsOrGroups } from 'react-select';


export const SelectWithSearch = ({ placeholder, options, props, isLoading=false }: { placeholder: string, isLoading?: boolean, props: any, options: OptionsOrGroups<any, GroupBase<any>> | undefined }) => {
    return (
        <div className="custom-select w-full min-w-[210px]">
            <Select
                isLoading={isLoading}
                placeholder={placeholder}
                className="w-full"
                options={options}
                {...props}
                isClearable
                {...props.value && { value: options?.find((option) => option.value === props.value) }}
            />
        </div>
    )
}
