"use client";

import InputField from "@/components/molecules/form/input-field";
import { SearchModal } from "@/components/template/modal";
import { country } from "@/constants/country";

import useModal from "@/hooks/useModal";
import { useState } from "react";

interface NationModalProps {}

export const NationModal = ({}: NationModalProps) => {
  const { handleOpenModal, open } = useModal();

  const [nationality, setNationality] = useState<string>("");

  return (
    <>
      <InputField
        label="Nationality"
        name="nationality"
        readOnly
        value={nationality}
        onFocus={handleOpenModal}
      />
      <SearchModal
        onCancel={handleOpenModal}
        onClick={({ country_name }) => setNationality(country_name)}
        itemList={country}
        open={open}
      />
    </>
  );
};
