"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { Chip } from "@/components/atoms/Chip";
import { LOCATIONS, LocationType, LocationEnum } from "@/constants";

export default function LocalChipSelector() {
  const searchParams = useSearchParams();
  const locationParam = searchParams.get("locationNum");

  const selected = LOCATIONS.find((loc) => loc === locationParam) ?? LocationEnum.Apgujung;

  return (
    <div className="flex flex-wrap justify-center items-center mx-12 mb-5 gap-2">
      {LOCATIONS.map((name) => (
        <Link
          key={name}
          href={`/home?locationNum=${name}`}
          scroll={false}
          className={clsx({ "select-chip": selected === name })}
        >
          <Chip>{name}</Chip>
        </Link>
      ))}
    </div>
  );
}
