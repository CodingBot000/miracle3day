
export type DeviceCard = {
    key: string;
    title: string;
    caption: string;
    bg: string;
    img: { src: string; w: number; h: number; alt?: string };
  };
  
 export const cards: DeviceCard[] = [
    {
      key: "Ulthera",
      title: "Ulthera",
      caption: "Powerful lifting deep into the skin ✨",
      bg: "bg-rose-100",
      img: { src: "/treatment-media/ulthera.png", w: 920, h: 920, alt: "Ulthera" }
    },
    {
      key: "Thermage",
      title: "Thermage",
      caption: "Tighter skin with collagen regeneration",
      bg: "bg-orange-100",
      img: { src: "/treatment-media/thermage.png", w: 1446, h: 902, alt: "Thermage" }
    },
    {
      key: "InMode",
      title: "InMode",
      caption: "Fat reduction + skin tightening for a sharp V-line",
      bg: "bg-amber-100",
      img: { src: "/treatment-media/inmode.png", w: 1296, h: 1296, alt: "InMode" }
    },
    {
      key: "Shurink",
      title: "Shurink",
      caption: "Comfortable HIFU lifting",
      bg: "bg-orange-200",
      img: { src: "/treatment-media/Shurink.png", w: 600, h: 1140, alt: "Shurink" }
    },
    {
      key: "ONDA",
      title: "ONDA",
      caption: "Body fat destruction & firming",
      bg: "bg-sky-100",
      img: { src: "/treatment-media/ONDA.png", w: 1446, h: 902, alt: "ONDA" }
    },
    {
      key: "Potenza",
      title: "Potenza",
      caption: "Improves pores, scars & skin texture",
      bg: "bg-yellow-100",
      img: { src: "/treatment-media/Potenza.png", w: 379, h: 800, alt: "Potenza" }
    },
    {
      key: "Rejuran",
      title: "Rejuran",
      caption: "Skin-repair injection for fine lines & elasticity",
      bg: "bg-lime-100",
      img: { src: "/treatment-media/Rejuran.png", w: 2048, h: 1592, alt: "Rejuran" }
    },
    {
      key: "StemCell",
      title: "Stem Cell (Blood-derived)",
      caption: "Anti-aging from the root with cell regeneration",
      bg: "bg-violet-100",
      img: { src: "/treatment-media/Stemcell.png", w: 1024, h: 1536, alt: "Stem Cell" }
    }
  ];