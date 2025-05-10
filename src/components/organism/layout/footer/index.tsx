import { Delete } from "lucide-react";
import styles from "./footer.module.scss";
import DeleteUserButton from "@/app/DeleteUserButton";

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* <DeleteUserButton uid="109baff6-2d4a-4119-818d-e65fd9289a41" /> */}
      {/* todo footer 내용 */}
      <address>ⓒ BeautyLink dCorp.</address>
    </footer>
  );
};
