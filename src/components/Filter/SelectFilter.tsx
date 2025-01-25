import { IRootState } from '@/store';
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import Dropdown from '../dropdown';
const SelectFilter = ({
    options,
    title,
    handleChange,
    placement,
    value

}: {
    value?: string
    placement?: string,
    handleChange: (value?: string) => void,
    title: string,
    options: {
        label: string,
        value: string
    }[]
}) => {
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [selected, setSelected] = React.useState<{
        label: string,
        value: string
    }>();

    useEffect(() => {
        if (value) {
            setSelected(options.find(item => item.value === value));
        } else {
            setSelected(undefined);
        }

    }, [value])


    return (
        <div className="dropdown shrink-0">
            <Dropdown
                offset={[0, 8]}
                placement={
                    placement ? placement :
                        `${isRtl ? 'bottom-start' : 'bottom-end'}`}
                btnClassName="block p-2 rounded bg-white dark:bg-black border-0 dark:!border-0 border-dark-dark-light hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
                button={
                    <div className="" >
                        {title}
                        {selected &&
                            <>
                                <span className='mx-1' >|</span>
                                <span className="text-primary">
                                    {selected.label}
                                </span>
                            </>
                        }
                    </div>
                }
            >
                {
                    options.length > 0 &&
                    <ul className="w-[210px]  max-h-48 overflow-auto grid  gap-2 !px-2 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                        {
                            options.map((item, index) =>
                                <li
                                    key={index}
                                    className={`${index > 0 && "border-t"}
                                ${selected?.value === item.value && 'bg-primary text-white-light dark:bg-primary/90 dark:text-white group '}
                                border-white-light dark:border-white-light/10 transition-all duration-200`}>
                                    <button
                                        onClick={() => {
                                            if (selected?.value === item.value) {
                                                setSelected(undefined);
                                                handleChange(undefined);
                                                return;

                                            }
                                            setSelected(item);
                                            handleChange(item.value);
                                        }}
                                        className={
                                            `${selected?.value === item.value && 'group-hover:text-white text-nowrap'} '}`
                                        }
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            )}
                    </ul>}
            </Dropdown>
        </div>

    )
}

export default SelectFilter