export type CategoryItem = {
    slug: string;
    href?: string;
    title_ko: string;
    title_en: string;
    subtitle_ko: string;
    cta?: string;
    badge?: string;
    accent?: {
      gradient?: string; // card media backdrop
      button?: string; // CTA gradient
      dot?: string; // small dot color
    };
    media?: {
      type: "image" | "video";
      src: string;
      alt?: string;
    };
  };
  
  export const CATEGORIES: CategoryItem[] = [
    {
      slug: "lifting",
      title_ko: "탄력/리프팅",
      title_en: "Lifting & Firming",
      subtitle_ko: "탄력 있는 V라인으로 다시 자신감을",
      badge: "추천",
      accent: {
        gradient: "linear-gradient(135deg,#ffe3ec 0%,#e0e7ff 100%)",
        button: "linear-gradient(90deg,#f472b6,#8b5cf6)",
        dot: "#f472b6",
      },
      media: {
        type: "image",
        src: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
        alt: "Confident jawline with soft glow",
      },
    },
    {
      slug: "anti-aging",
      title_ko: "주름/안티에이징",
      title_en: "Wrinkle & Anti-aging",
      subtitle_ko: "동안 피부로 더 젊게 빛나는 나",
      accent: {
        gradient: "linear-gradient(135deg,#fde68a 0%,#fbcfe8 100%)",
        button: "linear-gradient(90deg,#f59e0b,#ec4899)",
        dot: "#f59e0b",
      },
      media: {
        type: "image",
        src: "https://images.unsplash.com/photo-1546484959-f9a53db89f87?q=80&w=1600&auto=format&fit=crop",
        alt: "Radiant smiling face",
      },
    },
    {
      slug: "tone-texture",
      title_ko: "피부톤/결",
      title_en: "Tone & Texture",
      subtitle_ko: "화사하게 맑아진 피부톤",
      accent: {
        gradient: "linear-gradient(135deg,#e0f2fe 0%,#fce7f3 100%)",
        button: "linear-gradient(90deg,#06b6d4,#f43f5e)",
        dot: "#06b6d4",
      },
      media: {
        type: "image",
        src: "https://images.unsplash.com/photo-1522335789203-9d8aa2d0f5b5?q=80&w=1600&auto=format&fit=crop",
        alt: "Glowing clear skin",
      },
    },
    {
      slug: "acne-scars",
      title_ko: "여드름/흉터",
      title_en: "Acne & Scars",
      subtitle_ko: "매끈하고 깨끗한 피부 자신감",
      accent: {
        gradient: "linear-gradient(135deg,#e9d5ff 0%,#d1fae5 100%)",
        button: "linear-gradient(90deg,#8b5cf6,#10b981)",
        dot: "#8b5cf6",
      },
      media: {
        type: "image",
        src: "https://images.unsplash.com/photo-1522335789203-9baf3ffddd03?q=80&w=1600&auto=format&fit=crop",
        alt: "Cheerful close-up portrait",
      },
    },
    {
      slug: "pores-sebum",
      title_ko: "모공/피지",
      title_en: "Pores & Sebum",
      subtitle_ko: "매끈하게 정돈된 피부결",
      accent: {
        gradient: "linear-gradient(135deg,#ccfbf1 0%,#e0e7ff 100%)",
        button: "linear-gradient(90deg,#14b8a6,#6366f1)",
        dot: "#14b8a6",
      },
      media: {
        type: "image",
        src: "https://images.unsplash.com/photo-1522335789203-1b1d1da2b000?q=80&w=1600&auto=format&fit=crop",
        alt: "Fresh dewy skin",
      },
    },
    {
      slug: "pigmentation",
      title_ko: "색소/기미",
      title_en: "Pigmentation & Spots",
      subtitle_ko: "잡티 없이 환하게 빛나는 피부",
      accent: {
        gradient: "linear-gradient(135deg,#fff1f2 0%,#dbeafe 100%)",
        button: "linear-gradient(90deg,#fb7185,#3b82f6)",
        dot: "#fb7185",
      },
      media: {
        type: "image",
        src: "https://images.unsplash.com/photo-1515468381879-40d0ded81016?q=80&w=1600&auto=format&fit=crop",
        alt: "Clear bright skin under sunlight",
      },
    },
    {
      slug: "body-contouring",
      title_ko: "바디 컨투어링",
      title_en: "Body Contouring",
      subtitle_ko: "매끈하고 자신감 있는 실루엣",
      accent: {
        gradient: "linear-gradient(135deg,#e0f2fe 0%,#dcfce7 100%)",
        button: "linear-gradient(90deg,#0ea5e9,#22c55e)",
        dot: "#0ea5e9",
      },
      media: {
        type: "image",
        src: "https://images.unsplash.com/photo-1544717301-9cdcb1f5940a?q=80&w=1600&auto=format&fit=crop",
        alt: "Elegant body silhouette",
      },
    },
    {
      slug: "hair-scalp",
      title_ko: "헤어/두피",
      title_en: "Hair & Scalp",
      subtitle_ko: "풍성한 헤어로 더 당당하게",
      accent: {
        gradient: "linear-gradient(135deg,#e9d5ff 0%,#fae8ff 100%)",
        button: "linear-gradient(90deg,#8b5cf6,#d946ef)",
        dot: "#8b5cf6",
      },
      media: {
        type: "image",
        src: "https://images.unsplash.com/photo-1544716278-e513176f20b5?q=80&w=1600&auto=format&fit=crop",
        alt: "Shiny voluminous hair",
      },
    },
    {
      slug: "fat-shaping",
      title_ko: "체형·지방",
      title_en: "Fat Reduction & Shaping",
      subtitle_ko: "슬림하고 균형 잡힌 바디라인",
      accent: {
        gradient: "linear-gradient(135deg,#fef3c7 0%,#e9d5ff 100%)",
        button: "linear-gradient(90deg,#f59e0b,#8b5cf6)",
        dot: "#f59e0b",
      },
      media: {
        type: "image",
        src: "https://images.unsplash.com/photo-1540206276207-3af25c08abc0?q=80&w=1600&auto=format&fit=crop",
        alt: "Active confident posture",
      },
    },
    {
      slug: "skin-care",
      title_ko: "피부 관리",
      title_en: "Skin Care & Hydration",
      subtitle_ko: "촉촉하고 빛나는 건강한 피부",
      accent: {
        gradient: "linear-gradient(135deg,#dbeafe 0%,#cffafe 100%)",
        button: "linear-gradient(90deg,#3b82f6,#06b6d4)",
        dot: "#3b82f6",
      },
      media: {
        type: "image",
        src: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1600&auto=format&fit=crop",
        alt: "Hydrated glowing skin",
      },
    },
  ];