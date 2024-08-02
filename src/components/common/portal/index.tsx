"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const Portal = ({ children }: { children: React.ReactElement }) => {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  if (typeof window === "undefined") return null;

  const modalDom = document.getElementById("modal-root") as HTMLElement;

  return mounted ? createPortal(<>{children}</>, modalDom) : null;
};

export default Portal;
