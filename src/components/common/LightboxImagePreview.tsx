 

import React, { useState } from 'react';
 
interface LightboxProps {
    images: string[]; // Array of image URLs
    onClose: () => void; // Function to call when closing the lightbox
    selectedImage: number; // Index of the selected image
}

const Lightbox: React.FC<LightboxProps> = ({ images, onClose, selectedImage }) => {
    return (
        <div className="lightbox-backdrop" onClick={onClose}>
            <div className="lightbox-content justify-center items-center flex md:p-[20px] max-md:p-[5px]" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn text-white " onClick={onClose}>
                    <svg fill-rule="evenodd" viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z"></path></svg>
                </button>
                <img className='w-[80%] max-md:flex-1' src={images[selectedImage]} alt={`Selected ${selectedImage}`} />
            </div>
        </div>
    );
};





interface GalleryProps {
    images: string[]; // Array of image URLs
    myClassName?: string;
}

export const Gallery: React.FC<GalleryProps> = ({ images , myClassName }) => { 
    return (
        <>
            <br />
            <div className="gallery grid grid-cols-fluid gap-2 my-2">
                {images.map((image, index) => (
                    <AttachmentsImage
                        key={index}
                        src={image}
                        className={`h-full w-full `}
                        classNameImage={myClassName}
                    />
                ))}
            </div>
        </>
    );
};



export const AttachmentsImage = ({ src, className,classNameImage }: { classNameImage?: string,className?: string, src: string }) => {
    const [isError, setIsError] = useState(false)
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

    const openLightbox = (index: number) => {
        setSelectedImage(index);
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };
    return (
        <div className={className}>
            {
                isError ? <div className={`cursor-pointer bg-dark-dark-light h-full w-full text-white rounded-lg ${className} `}></div> :
                    <img onClick={() => {
                        openLightbox(0)
                    }} onError={() => {
                        setIsError(true)

                    }}
                        className={`${classNameImage}  gallery-image rounded-lg cursor-pointer w-full h-full object-cover bg-dark-dark-light`}
                        src={src}
                        alt={""}


                    />
            }
            {selectedImage !== null && (
                <Lightbox
                    images={[src]}
                    selectedImage={selectedImage}
                    onClose={closeLightbox}
                />
            )}
        </div>

    )
}