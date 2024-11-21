import { Field, FormikProps, FormikValues } from 'formik';
import React, { ReactNode, useState } from 'react';
import Upload from 'rc-upload';
 
 import { getTranslation } from '../../ni18n/i18n';
import { convertBase64 } from './helper/convertBase64';
// Assuming you want to make this component generic for any form values
// ! TODO:
interface InputFormProps<T = FormikValues> {
    formikProps: FormikProps<T>;
    name: keyof T & string;
    title: string;
    placeholder: string;
    icon?: ReactNode;
    props?: React.InputHTMLAttributes<HTMLInputElement>;
    className?: string;
    valueFileName?: string;
}

export const UploadFileForm = <T extends FormikValues>({
    formikProps,
    name,
    title,
    placeholder,
    icon,
    props,
    className,
    valueFileName
}: InputFormProps<T>): React.ReactElement => {
    let pathArr = name.split('.');
    const { t }: any = getTranslation();
    let errorValue = pathArr.reduce((prev: any, curr) => prev && prev[curr], formikProps.errors);
    let touchedValue = pathArr.reduce((prev: any, curr) => prev && prev[curr], formikProps.touched);
    const [upLoading, setUpLoading] = useState(false);
    const [fileName, setFileName] = useState<String | undefined>(valueFileName);
    const [image, setImage] = useState(valueFileName ? true : false);
    const [sizeFile, setSizeFile] = useState<String | undefined>();

    const [isError, setIsError] = useState(false)
    return (
        <div
            className={`w-full ${formikProps.submitCount ? (errorValue && touchedValue ? 'has-error' : '') : ''}`}>
            <label className='font-normal' htmlFor={name}>{title} <span className='text-danger'>(10MB)</span></label>
            <div className="relative w-full">
                <Upload
                    // accept="" 
                    className={`${image ? "h-[150px!important]" : "h-[50px!important]"} w-[100%!important] rounded-md border border-base border-dashed hover:border-primary ${formikProps.submitCount ? (formikProps.errors[name] && formikProps.touched[name] ? 'border-primary !bg-red-500/10' : '') : ''
                        }`}
                    type="drag"
                    beforeUpload={async (file) => {
                        if (file) {
                            if (file.size > 10 * 1024 * 1024) { 
                                setSizeFile(t('file-size-exceeds-the-maximum-limit-of-10MB'))
                                return false;
                            }
                            // check if the file is an image
                            const isImage = (file: File): boolean => {
                                const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
                                return acceptedImageTypes.includes(file.type);
                            };

                            setUpLoading((upLoading) => !upLoading);
                            setTimeout(async () => {
                                formikProps.setFieldValue(name, file);
                                if (isImage(file)) {
                                    const base64: any = await convertBase64(file);
                                    setImage(true)
                                    setFileName(base64)
                                    setIsError(false)

                                } else {
                                    setFileName(file.name);

                                }
                                setUpLoading((upLoading) => !upLoading);
                                setSizeFile(undefined);
                            }, 500);
                        }
                        return false;
                    }}
                    multiple={false}
                    onSuccess={(res) => {
                        console.log(res);

                    }}
                    style={{ display: 'inline-block' }}
                >
                    <div className='flex justify-center items-center h-full w-full'>
                        {upLoading ?
                            <div className="loaderDots"></div>
                            :
                            fileName ?
                                <>
                                    {image ?
                                        <>
                                            {
                                                isError == true ?
                                                    <p className="text-gray-400">{t('click-or-drag-file-to-this-area-to-upload')}</p>
                                                    :
                                                    <img src={`${fileName}`}
                                                        onError={() => {
                                                            setIsError(true)
                                                        }}
                                                        className=' w-full h-[140px!important] object-cover object-center' />
                                            }
                                        </>

                                        : <p className="text-gray-400">{fileName}</p>}
                                </>
                                :
                                <p className="text-gray-400">{t('click-or-drag-file-to-this-area-to-upload')}</p>
                        }
                    </div>
                </Upload>
            </div>
            {formikProps.submitCount ?
                (errorValue && touchedValue ?
                    <div className="mt-[2px] w-full p-1 text-sm text-danger">{errorValue}</div> : <></>
                )
                :
                <>
                </>
            }
            {sizeFile && <div className="mt-[2px] w-full p-1 text-sm text-danger">{sizeFile}</div>}
        </div>
    );
};