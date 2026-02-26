import React, { useState } from "react";

const Avatar = ({ photo, username, className }: { photo: string; username: string; className?: string }) => {
  const [isError, setIsError] = useState(false);

  return (
    <div>
      {!isError && photo ? (
        <img
          onError={(e) => {
            setIsError(true);
          }}
          className="h-10 w-10 rounded-lg object-cover"
          src={photo}
          alt={username}
        />
      ) : (
        <div className="inline-block h-9 w-9 overflow-hidden rounded-lg ltr:mr-2 rtl:ml-2.5">
          <span className={`flex h-full w-full items-center justify-center bg-primary/70 uppercase text-white ${className}`}>
            {username?.substring(0, 2) ?? "abbas ".substring(0, 2)}
          </span>
        </div>
      )}
    </div>
  );
};

export default Avatar;
