"use client";

import { ModalOverlay } from "@/components/organism/layout/modal/overlay";

import styles from "./search-modal.module.scss";
import { ChangeEventHandler, useState } from "react";
import {
  CountryCode,
  CountryOutputDto,
} from "@/app/api/auth/countryCode/country-code";

export interface SearchModalProps {
  open: boolean;

  itemList: CountryOutputDto["countryCode"];

  onClick: (value: CountryCode) => void;

  onCancel: () => void;
}

export const SearchModal = ({
  open,
  onClick,
  onCancel,
  itemList,
}: SearchModalProps) => {
  const [searchList, setSearchList] = useState<typeof itemList>(itemList);

  const handleOnChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const search = e.target.value.toLowerCase();

    const findItem = itemList.filter(({ country_name }) => {
      const item = country_name.toLowerCase();

      return item.includes(search);
    });

    setSearchList(findItem);
  };

  const handleSelect = (item: CountryCode) => {
    onClick(item);
    onCancel();
  };

  const handleCloseModal = () => {
    setSearchList(itemList);
    onCancel();
  };

  return (
    <ModalOverlay open={open} handleClick={handleCloseModal}>
      <input
        className={styles.search}
        placeholder="Search"
        name="search"
        onChange={handleOnChange}
        autoFocus
        autoComplete={"off"}
      />
      <ul className={styles.ul}>
        {searchList.map((item, i) => (
          <li key={i} className={styles.li} onClick={() => handleSelect(item)}>
            {item.country_name}
          </li>
        ))}
      </ul>
    </ModalOverlay>
  );
};
