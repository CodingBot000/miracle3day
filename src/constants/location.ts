// export const locationNames: string[] = [
//   "Apgujung",
//   "Myungdong",
//   "Gangnam",
//   "Chungdam",
//   "Songdo",
//   "Hongdae",
// ] as const;


export enum LocationEnum {
  Apgujung = "Apgujung",
  Myungdong = "Myungdong",
  Gangnam = "Gangnam",
  Chungdam = "Chungdam",
  Songdo = "Songdo",
  Hongdae = "Hongdae",
}

export const LOCATIONS = [
  LocationEnum.Apgujung,
  LocationEnum.Myungdong,
  LocationEnum.Gangnam,
  LocationEnum.Chungdam,
  LocationEnum.Songdo,
  LocationEnum.Hongdae,
] as const;

export type LocationType = (typeof LOCATIONS)[number];


// export const locationMapper = [
//   {"Apgujung":0},
//   {"Myungdong":1},
//   {"Gangnam":2},
//   {"Chungdam":3},
//   {"Songdo":4},
//   {"Hongdae":5},
// ] as const;