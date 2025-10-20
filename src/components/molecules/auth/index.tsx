// export { default } from "./AuthServer";
// import { ROUTE } from "@/router";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { getUserAPI } from "@/app/api/auth/getUser";
// import { User } from "@backendClient/backendClient-js";
// import { LogIn, User as UserIcon } from "lucide-react";

// const Auth = async () => {
//   const users = await getUserAPI();

//   const href = users ? ROUTE.MY_PAGE : ROUTE.LOGIN;

//   const text = (user: User) => {
//     const { app_metadata, user_metadata } = user;
//     const isSnsUser = app_metadata.provider !== "email";
//     return isSnsUser ? user_metadata.name : user_metadata.nickname;
//   };

//   const isAdmin = users?.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

//   return (
//     <div className="flex justify-end items-center gap-2 w-auto min-w-fit">
//       <Link href={href}>
//         <Button 
//           variant="outline" 
//           className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
//         >
//           {users ? (
//             <>
//               <UserIcon className="h-4 w-4" />
//               <span>{text(users.user) || users.user.email}</span>
//             </>
//           ) : (
//             <>
//               <LogIn className="h-4 w-4" />
//               <span>LOGIN</span>
//             </>
//           )}
//         </Button>
//       </Link>

//       {isAdmin && (
//         <Link href={ROUTE.UPLOAD_HOSPITAL}>
//           <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
//             업로드 바로가기
//           </Button>
//         </Link>
//       )}
//     </div>
//   );
// };

// export default Auth;
