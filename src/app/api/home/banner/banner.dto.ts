export interface BannerItem {
  id: number;
  created_at: Date;
  imgurl: string;
  name: string;
  id_unique: number;
  id_surgeries: number[];
}

export interface BannerOutputDto {
  data: BannerItem[];
}
