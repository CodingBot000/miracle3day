import Link from "next/link";
import Image from "next/image";
import { ROUTE } from "@/router";

const Logo = () => {
  return (
    <div className="w-fit">
      <Link href={ROUTE.HOME}>
        <Image
          src="/logo/logo.png"
          alt="logo"
          width={172}
          height={42}
          className="w-[120px] h-auto sm:w-[140px] xs:w-[110px]"
        />
      </Link>
    </div>
  );
};

export default Logo;
