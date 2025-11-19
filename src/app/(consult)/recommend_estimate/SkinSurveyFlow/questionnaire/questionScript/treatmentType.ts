
export type TreatmentType = {
    key: string;
    label: string;
    unit?: string | null;
    value?: number;
  };
  
  // 객체 안에 직접 등록
  export const TreatmentType = {
    botox: { key: "botox", label: "botox" },
    capri: { key: "capri", label: "capri" },
    co2: { key: "co2", label: "co2" },
    density_600: { key: "density_600", label: "density", unit: "shot", value: 600 },
    density_900: { key: "density_900", label: "density", unit: "shot", value: 900 },
    exel_v: { key: "exel_v", label: "exel v" },
    exosome: { key: "exosome", label: "exosome" },
    filler: { key: "filler", label: "filler" },
    genesis: { key: "genesis", label: "genesis" },
    gensis: { key: "gensis", label: "gensis" }, // 오타 확인 권장
    inmode: { key: "inmode", label: "inmode" },
    juvegen: { key: "juvegen", label: "juvegen" },
    juvelook: { key: "juvelook", label: "juvelook" },
    liftera_200: { key: "liftera_200", label: "liftera", unit: "shot", value: 200 },
    liftera_400: { key: "liftera_400", label: "liftera", unit: "shot", value: 400 },
    liftera_600: { key: "liftera_600", label: "liftera", unit: "shot", value: 600 },
    liftera_800: { key: "liftera_800", label: "liftera", unit: "shot", value: 800 },
    neobeam: { key: "neobeam", label: "neobeam" },
    oligio_600: { key: "oligio_600", label: "oligio", unit: "shot", value: 600 },
    oligio_900: { key: "oligio_900", label: "oligio", unit: "shot", value: 900 },
    onda: { key: "onda", label: "onda" },
    potenza: { key: "potenza", label: "potenza" },
    fraxel: { key: "fraxel", label: "fraxel" },
    repot_or_toning_and_genesis: {
      key: "repot_or_toning_and_genesis",
      label: "repot or toning&genesis",
    },
    scultra: { key: "scultra", label: "scultra" },
    secret: { key: "secret", label: "secret" },
    shrink_200: { key: "shrink_200", label: "shrink", unit: "shot", value: 200 },
    shrink_400: { key: "shrink_400", label: "shrink", unit: "shot", value: 400 },
    shrink_600: { key: "shrink_600", label: "shrink", unit: "shot", value: 600 },
    shrink_800: { key: "shrink_800", label: "shrink", unit: "shot", value: 800 },
    skinbooster_rejuran: { key: "skinbooster-rejuran", label: "skinbooster rejuran" },
    skinbooster_juvelook: { key: "skinbooster_juvelook", label: "skinbooster juvelook" },
    skinbooster_ha: { key: "skinbooster_ha", label: "skinbooster ha" },
    sof_wave_200: { key: "sof_wave_200", label: "sof wave", unit: "shot", value: 200 },
    sof_wave_300: { key: "sof_wave_300", label: "sof wave", unit: "shot", value: 300 },
    stem_cell: { key: "stem_cell", label: "stem cell" },
    thermage_600: { key: "thermage_600", label: "thermage", unit: "shot", value: 600 },
    thermage_900: { key: "thermage_900", label: "thermage", unit: "shot", value: 900 },
    
    toning: { key: "toning", label: "toning" },
    tune_face: { key: "tune_face", label: "tune face" },
    tune_liner: { key: "tune_liner", label: "tune liner" },
    ulthera_200: { key: "ulthera_200", label: "ulthera", unit: "shot", value: 200 },
    ulthera_400: { key: "ulthera_400", label: "ulthera", unit: "shot", value: 400 },
    ulthera_600: { key: "ulthera_600", label: "ulthera", unit: "shot", value: 600 },
    ulthera_800: { key: "ulthera_800", label: "ulthera", unit: "shot", value: 800 },
    v_beam: { key: "v_beam", label: "v beam" },
  } as const;
  