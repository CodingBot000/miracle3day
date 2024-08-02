export interface InfinityScrollInputDto {
  offset?: number;
  limit?: number;

  pageParam: number;
}

export interface InfinityScrollOutputDto {
  nextCursor?: boolean | number;
}
