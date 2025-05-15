"use client";

import InputField from "@/components/molecules/form/input-field";
import { ModalOverlay } from "@/components/organism/layout/ModalOverlay";

import styles from "./surgeries-modal.module.scss";

import useModal from "@/hooks/useModal";
import { useState } from "react";
import Button from "@/components/atoms/button/Button";

interface Surgery {
  created_at: string; // ISO 8601 형식의 날짜 문자열
  description: string; // 수술 설명
  id: number; // 수술 ID
  id_unique: number; // 고유 ID
  imageurls: string[]; // 이미지 URL 배열
  name: string; // 수술 이름
  type: string; // 수술 타입 (예: Cosmetic)
}

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
                className={styles.li}
                key={id}
                onClick={() => handleSelect(item)}
              >
                <input
                  id={id_unique.toString()}
                  type="checkbox"
                  defaultChecked={surgeries.some((e) => e.id === id)}
                />
                <label htmlFor={id_unique.toString()}>
                  {`${type} - ${name} - ${id_unique}`}
                </label>
              </div>
            );
          })}
          <div className={styles.btn_group}>
            <Button color="red" onClick={handleOpenModal}>
              취소
            </Button>
            <Button color="blue" onClick={handleOpenModal}>
              완료
            </Button>
          </div>
        </fieldset>
      </ModalOverlay>
    </>
  );
};
