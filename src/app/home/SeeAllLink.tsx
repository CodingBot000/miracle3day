"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTE } from "@/router";
import { LocationEnum, LocationType } from "@/constants";

export default function SeeAllLink({
  location,
}: {
  location: LocationType;
}) {
  console.log('qq qq SeeAllLink location: ', location);
  return (
    <div className="flex justify-end mr-5">
      <Link
        href={ROUTE.LOCATION_DETAIL("") + location}
        scroll={true}
        onClick={() => {
          console.log("클릭됨:", location);
        }}
      >
        <Image src="/icons/icon_see_all.png" alt="see all" width={38} height={38} />
      </Link>
    </div>
  );
}
