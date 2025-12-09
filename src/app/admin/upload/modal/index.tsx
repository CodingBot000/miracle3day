"use client";

import InputField from "@/components/admin/InputField";
import { ModalOverlay } from "@/components/template/modal/ModalOverlay";
import useModal from "@/hooks/useModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Surgery } from "@/models/admin/surgery";

interface SurgeriesModalProps {
  itemList: Surgery[];
}

export const SurgeriesModal = ({ itemList }: SurgeriesModalProps) => {
  const { handleOpenModal, open } = useModal();
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);

  const handleSelect = (item: Surgery) => {
    setSurgeries((prev) => {
      const isPrev = prev.find((e) => e.id === item.id);
      if (isPrev) {
        return prev.filter((e) => e.id !== isPrev.id);
      }
      return prev.concat(item);
    });
  };

  return (
    <>
      <InputField
        label="surgeries"
        name="surgeries"
        readOnly
        required
        value={surgeries.map((e) => e.id_unique.toString())}
        onFocus={handleOpenModal}
      />
      <ModalOverlay handleClick={handleOpenModal} open={open}>
        <fieldset>
          {itemList.map((item) => {
            const { type, name, id, id_unique } = item;
            return (
              <div
                className="my-4 flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 transition"
                key={id}
                onClick={() => handleSelect(item)}
              >
                <input
                  id={id_unique.toString()}
                  type="checkbox"
                  checked={surgeries.some((e) => e.id === id)}
                  readOnly
                  className="accent-blue-500"
                />
                <label htmlFor={id_unique.toString()} className="select-none">
                  {`${type} - ${name} - ${id_unique}`}
                </label>
              </div>
            );
          })}
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="secondary"
              type="button"
              onClick={handleOpenModal}
            >
              취소
            </Button>
            <Button
              variant="default"
              type="button"
              onClick={handleOpenModal}
            >
              완료
            </Button>
          </div>
        </fieldset>
      </ModalOverlay>
    </>
  );
};
