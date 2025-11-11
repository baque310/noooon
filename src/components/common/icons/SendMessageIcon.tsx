import { FC } from "react";

interface IconMenuApartmentProps {
  className?: string;
}

const SendMessageIcon: FC<IconMenuApartmentProps> = ({ className }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g clip-path="url(#clip0_3_1834)">
        <path
          d="M1.42574 7.68758C-0.843344 11.4294 9.16032 14.7894 9.16032 14.7894C9.16032 14.7894 12.5203 24.793 16.2622 22.524C20.2331 20.1021 24.9894 5.22214 21.8476 2.10214C18.7058 -1.01786 3.84756 3.71667 1.42574 7.68758Z"
          stroke="white"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path d="M15.4656 8.48413L9.16016 14.7896" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <defs>
        <clipPath id="clip0_3_1834">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default SendMessageIcon;
