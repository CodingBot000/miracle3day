import { PropsWithChildren } from "react";

interface PageHeaderProps {
  name: string;
}

const PageHeader = ({ name, children }: PropsWithChildren<PageHeaderProps>) => {
  return (
    <div className="relative flex justify-center items-center bg-white min-h-[55px] py-3 px-6 text-[#464344] font-bold text-[25px] z-12">
      <h1>{name}</h1>
      <div className="absolute right-4">{children}</div>
    </div>
  );
};

export default PageHeader;
