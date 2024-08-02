type SidebarPath<T extends string> = {
  menu: T;
  href: string;
};

export const handleRouter = (tab: string) => (href: string) =>
  `?${tab}=${href}`;

export const createSidebarPath = <T extends string>(
  list: readonly T[],
  prefix: string
): SidebarPath<T>[] => {
  return list.map((menu) => ({
    menu,
    href: `/${prefix}/${menu.toLocaleLowerCase()}`,
  }));
};

export const createActionRedirectUrl = (path: string, errorMsg?: string) => {
  const status = typeof errorMsg !== "undefined" ? "error" : "success";

  if (status === "error") {
    return `${path}?status=${status}&msg=${errorMsg}`;
  }

  return `${path}?status=${status}`;
};
