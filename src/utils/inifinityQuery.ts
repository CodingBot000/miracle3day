interface infinityParamsType {
  req: Request;
  limits: number;
}

export const infinityParams = ({ req, limits }: infinityParamsType) => {
  const { searchParams } = new URL(req.url);

  const pageParam = parseInt(searchParams.get("pageParam") as string);

  const offset = pageParam * limits;
  const limit = offset + limits - 1;

  const nextCursor = (count: number | null) => count && limit < count;

  return {
    offset,
    limit,
    nextCursor,
  };
};
