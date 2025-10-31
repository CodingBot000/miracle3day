"use client";

import { HospitalCard } from "@/components/molecules/card";
import { useState } from "react";
import { getAllFavoriteAPI } from "../../api/auth/favorite";
import { InfinityItemList } from "@/components/template/InfinityItemList";
import PageHeader from "@/components/molecules/PageHeader";
import { ROUTE } from "@/router";
import { FavoriteIcon } from "@/components/icons/favoriteIcon";
import Button from "@/components/atoms/button/Button";
import { favoriteActions } from "@/components/atoms/favorite/actions";
import { SubmitButton } from "./components/button";
import SkeletonCard from "@/components/molecules/card/SkeletonCard";

const FavoritePage = () => {
  const [selectMode, setSelectMode] = useState(false);
  const [selectItem, setSelectItem] = useState<string[]>([]);

  const handleReset = () => {
    setSelectMode(!selectMode);
    setSelectItem([]);
  };

  const handleSelect = (item: string) => {
    if (!selectMode) return;
    setSelectItem((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const handleSubmitFavorite = () => {
    if (!selectItem.length) return;
    favoriteActions({
      isFavorite: selectMode,
      id_hospital: JSON.stringify(selectItem),
    });
  };

  const isFavorite = (id: string) => selectItem.includes(id);
  const href = (id: string) =>
    selectMode ? "#" : ROUTE.HOSPITAL_DETAIL("") + id;

  return (
    <main>
      <PageHeader name="Favorite">
        <div className="flex m-4">
          {selectMode ? (
            <form
              className="flex gap-[0.2rem]"
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
        className="max-w-[768px] mx-auto mt-8 px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        fetchFn={getAllFavoriteAPI}
        queryKey="favorite_list"
        loadingFallback={
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </>
        }
      >
        {(data) => {
          if (data.favorite.length === 0) {
            return (
              <div className="col-span-full text-center text-gray-500 p-6">
                <p className="text-lg font-medium mb-2">No favorites yet</p>
                <p className="text-sm mb-4">
                  You can add hospitals to your favorites by clicking the heart
                  icon.
                </p>
                <Button onClick={() => location.href = ROUTE.HOME} color="blue">
                  Go to Home
                </Button>
              </div>
            );
          }

          return data.favorite.map(({ id, hospital }) => (
            <div
              key={id}
              className="relative"
              onClick={() => handleSelect(hospital.id_unique)}
            >
              {selectMode && (
                <div className="absolute right-0 z-20 p-4 cursor-pointer transition-transform duration-300 hover:scale-150 scale-110">
                  <FavoriteIcon
                    fill={isFavorite(hospital.id_unique) ? "red" : "white"}
                  />
                </div>
              )}
              <HospitalCard
                alt={hospital.name}
                name={hospital.name}
                href={href(hospital.id_unique)}
                src={hospital.imageurls[0]}
                searchKey={hospital.searchkey}
              />
            </div>
          ));
        }}
      </InfinityItemList>
    </main>
  );
};

export default FavoritePage;
