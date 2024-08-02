import Link from "next/link";

import Image from "next/image";
import { ROUTE } from "@/router";

const Logo = () => {
  return (
    <div>
      <Link href={ROUTE.HOME}>
        <Image width={42} height={42} src={"/logo/logo.webp"} alt="logo" />
      </Link>
    </div>
  );
};

export default Logo;
