"use client";

import Image from "next/image";
import styles from "./favorite.module.scss";

import { useParams, useRouter } from "next/navigation";
import { useOptimistic } from "react";
import { favoriteActions } from "./actions";

import { useGetUser } from "@/hooks/useGetUser";
import { AlertModal } from "@/components/template/modal/alert";
import useModal from "@/hooks/useModal";
import { ModalOverlay } from "@/components/organism/layout/modal/overlay";
import Button from "../button";
import { ROUTE } from "@/router";

export interface FavoriteIconProps {
  isFavorite: boolean;
}

export const HospitalFavoriteIcon = ({ isFavorite }: FavoriteIconProps) => {
  const router = useRouter();
  const params: { id: string } = useParams();
  const id_hospital = params.id;

  const { data } = useGetUser();
  const { handleOpenModal, open, setOpen } = useModal();

  const [optimisticState, isOptimisticFavorite] = useOptimistic(
    isFavorite,
    (prevState) => {
      if (!data) {
        return prevState;
      }
      return !prevState;
    }
  );

  const handleUpdateFavorite = () => {
    if (!data) {
      setOpen(true);
      return;
    }

    updateFavorite();
  };

  const updateFavorite = async () => {
    isOptimisticFavorite(isFavorite);

    await favoriteActions({
      isFavorite: optimisticState,
      id_hospital,
    });
  };

  return (
    <>
      <form>
        <button className={styles.btn} formAction={handleUpdateFavorite}>
          <Image
            src={`/icons/icon_favorite_${
              optimisticState ? "disable" : "enable"
            }.svg`}
            alt="favorite"
            width={24}
            height={24}
          />
        </button>
      </form>

      <ModalOverlay open={open} handleClick={handleOpenModal}>
        <p>require login</p>

        <br />

        <Button onClick={() => router.push(ROUTE.LOGIN)}>Login</Button>
      </ModalOverlay>
    </>
  );
};
