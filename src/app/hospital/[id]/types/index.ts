export const floatKey = [
  "kakaotalk",
  "facebook",
  "instagram",
  "blog",
  "youtube",
  "ticktok",
  "snapchat",
  "tell",
] as const;

export type TFloatKey = (typeof floatKey)[number];

export type TFloatObj = Partial<
  Record<
    | "kakaotalk"
    | "facebook"
    | "instagram"
    | "blog"
    | "youtube"
    | "ticktok"
    | "snapchat",
    string
  >
>;

export const TFloatLogoImg: Record<TFloatKey, string> = {
  blog: "/icons/icon_sns_blog.svg",
  facebook: "/icons/icon_sns_facebook.png",
  instagram: "/icons/icon_sns_instagram.png",
  kakaotalk: "/icons/icon_sns_kakaotalk.png",
  snapchat: "/icons/icon_sns_snapchat.png",
  ticktok: "/icons/icon_sns_ticktok.png",
  youtube: "/icons/icon_sns_youtube.svg",
  tell: "/icons/icon_sns_tell.svg",
};
