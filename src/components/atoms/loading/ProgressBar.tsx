"use client";

import NextTopLoader from "nextjs-toploader";

export const ProgressBar = () => {
  return (
    <NextTopLoader
      color="#FF4B91"
      height={4}
      showSpinner={false}
      shadow="0 0 10px #FF4B91, 0 0 5px #FF4B91"
    />
  );
};
