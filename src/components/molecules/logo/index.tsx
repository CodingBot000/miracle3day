import Link from "next/link";

import Image from "next/image";
import { ROUTE } from "@/router";

const Logo = () => {
  return (
    <div>
      <Link href={ROUTE.HOME}>
        <Image width={172} height={42} src={"/logo/logo.png"} alt="logo" />
      </Link>
    </div>
  );
};

export default Logo;
