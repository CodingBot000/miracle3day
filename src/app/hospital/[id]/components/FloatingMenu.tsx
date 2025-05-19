"use client";

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

const FloatingMenu = ({ float }: FloatingProps) => {
  const icon: Record<string, JSX.Element> = {
    instagram: <SkillIconsInstagram />,
    tel: <TellIcon />,
    blog: <BlogIcon />,
    ticktok: <TikTokIcon />,
    youtube: <YoutubeIcon />,
    homepage: <YoutubeIcon />,
  };

  return (
    <div className="fixed top-1/2 right-[5%] flex flex-col gap-2">
      {float.map(({ name, href }) => {
        const tel = name === "tel" ? `tel:${href}` : href;
        return (
          <a key={name} href={tel} target="_blank" rel="noopener noreferrer">
            {icon[name]}
          </a>
        );
      })}
    </div>
  );
};

export default FloatingMenu;
