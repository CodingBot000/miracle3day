import Image from "next/image";

import styles from "./floating.module.scss";
import { TellIcon } from "@/components/icons/tell";
import { BlogIcon } from "@/components/icons/blog";
import { SkillIconsInstagram } from "@/components/icons/instagram";
import { TikTokIcon } from "@/components/icons/tiktok";
import { YoutubeIcon } from "@/components/icons/youtube";

export type FloatItem = {
  name: string;
  href: string;
};
export interface FloatingProps {
  float: FloatItem[];
}

const Floating = ({ float }: FloatingProps) => {
  // 이미지 파일이 없어서 임시로 svg 컴포넌트 생성
  const icon: Record<string, JSX.Element> = {
    instagram: <SkillIconsInstagram />,
    tel: <TellIcon />,
    blog: <BlogIcon />,
    ticktok: <TikTokIcon />,
    youtube: <YoutubeIcon />,
    homepage: <YoutubeIcon />,
  };

  return (
    <div className={styles.floating}>
      {float.map(({ name, href }) => {
        const tel = name === "tel" ? `tel:${href}` : href;
        return (
          // target="_blank" 새창열기
          <a key={name} href={tel} target="_blank" rel="noopener noreferrer">
            {icon[name]}
          </a>
        );
      })}
    </div>
  );
};

export default Floating;
