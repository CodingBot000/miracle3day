import dayjs from "dayjs";

export const daysYMDFormat = (date: string) => {
  return dayjs(date).format("YYYY/MM/DD");
};
