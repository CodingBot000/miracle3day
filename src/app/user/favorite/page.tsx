"use client";

import { HospitalCard } from "@/components/molecules/card";

import styles from "./favorite.module.scss";
import { useState } from "react";

import { getAllFavoriteAPI } from "../../api/auth/favorite";

import { InfinityItemList } from "@/components/template/InfinityItem";
import PageHeader from "@/components/molecules/header/PageHeader";
import { ROUTE } from "@/router";
import { FavoriteIcon } from "@/components/icons/favoriteIcon";
import Button from "@/components/atoms/button";

import { favoriteActions } from "@/components/atoms/favorite/actions";
import { SubmitButton } from "./components/button";

const FavoritePage = () => {
  const [selectMode, setSelectMode] = useState<boolean>(false);
  const [selectItem, setSelectItem] = useState<string[]>([]);

  const handleReset = () => {
    setSelectMode(!selectMode);
    setSelectItem([]);
  };

  const handleSelect = (item: string) => {
    if (!selectMode) return;

    setSelectItem((prev) => {
      const isFilter = prev.find((e) => e === item);

      if (isFilter) return prev.filter((e) => e !== isFilter);

      return [...prev, item];
    });
  };

  const handleSubmitFavorite = () => {
    if (!selectItem.length) return;

    favoriteActions({
      isFavorite: selectMode && !!selectItem.length,
      id_hospital: JSON.stringify(selectItem),
    });
  };

  const isFavorite = (id: string) => selectItem.includes(id);
  const href = (id: string) =>
    selectMode ? "#" : ROUTE.HOSPITAL_DETAIL("") + id;

  return (
    <main>
      <PageHeader name="Favorite">
        <div className={styles.btn_wrapper}>
          {selectMode ? (
            <form
              className={styles.remove_btn}
              action={handleSubmitFavorite}
              onReset={handleReset}
            >
              <SubmitButton>Delete</SubmitButton>
              <Button type="reset" color="blue">
                Cancel
              </Button>
            </form>
          ) : (
            <Button color="blue" onClick={handleReset}>
              Edit
            </Button>
          )}
        </div>
      </PageHeader>

      <InfinityItemList
        className={styles.card_wrapper}
        fetchFn={getAllFavoriteAPI}
        queryKey="favorite_list"
      >
        {(data) =>
          data.favorite.map(({ id, hospital }) => {
            return (
              <div
                key={id}
                className={styles.card}
                onClick={() => handleSelect(hospital.id_unique)}
              >
                {selectMode ? (
                  <div className={styles.favorite_icon}>
                    <FavoriteIcon
                      fill={isFavorite(hospital.id_unique) ? "red" : "white"}
                    />
                  </div>
                ) : null}
                <HospitalCard
                  alt={hospital.name}
                  name={hospital.name}
                  href={href(hospital.id_unique)}
                  src={hospital.imageurls[0]}
                />
              </div>
            );
          })
        }
      </InfinityItemList>
    </main>
  );
};

export default FavoritePage;
