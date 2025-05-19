import { Delete, Headset } from "lucide-react";
import { LanguageSelector } from "@/components/organism/layout/LanguageSelector";
import Link from "next/link";
// export const Footer = () => {
//   return (
//     <footer className="flex justify-center items-center p-8 mt-8 bg-[#fdfcfc]">
//       {/* <DeleteUserButton uid="109baff6-2d4a-4119-818d-e65fd9289a41" /> */}
//       {/* todo footer 내용 */}
//       <span> <LanguageSelector /> Language </span> 

//       <address>ⓒ BeautyLink Corp.</address>
//     </footer>
//   );
// };
export const Footer = () => {
  return (
    <footer className="min-h-[150px] flex flex-col items-center gap-3 p-8 mt-8 bg-[#fdfcfc] text-center text-sm text-gray-600">
      <div className="flex flex-wrap justify-center items-center gap-4">
        <span className="flex items-center gap-1">
          <LanguageSelector /> Language
        </span>

        <Link href="/support/customer-support" className="flex items-center gap-1 hover:underline">
          <Headset size={16} /> Customer Support
        </Link>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-2">
        <span>@BeautyLink Corp</span>
        <span className="mx-1">|</span>
        <Link href="/legal/privacy" className="hover:underline">
          Privacy Policy
        </Link>
        <span className="mx-1">|</span>
        <Link href="/legal/terms" className="hover:underline">
          Terms
        </Link>
      </div>
    </footer>
  );
};
