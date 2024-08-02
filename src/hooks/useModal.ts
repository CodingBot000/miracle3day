import { useEffect, useState } from "react";

/**
 *
 * modal state 일괄적으로 관리하기 위해
 */
const useModal = (initState?: boolean) => {
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof initState === "boolean") {
      setOpen(initState);
    }
  }, [initState]);

  const handleOpenModal = () => {
    setOpen((prev) => {
      if (!prev) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
      return !prev;
    });
  };

  return {
    open,
    setOpen,
    handleOpenModal,
  };
};

export default useModal;
