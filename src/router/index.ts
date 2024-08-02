const createRouter = (prefix: string) => (path: string) => {
  const replaceHyphen = path.replace(/_/g, "-").toLowerCase();

  if (prefix) {
    return `/${prefix}/${replaceHyphen}`;
  }

  return `/${replaceHyphen}`;
};

const createAuthRouter = createRouter("auth");
const createUserRouter = createRouter("user");
const createNormalRouter = createRouter("");
const createAdminRouter = createRouter("admin");

// db role
// user role = 'gold '

// ÷"/auth/forget-password"

/**
 * nextjs 디테일 페이지 라우팅 방법은 경로/id 입니다.
 * id 대신 원하는 slug 를 사용하시면 되는데 그 인자를 받아서 자동으로 router 만들어주는 함수입니다.
 *
 * @param router - 베이스 루트 ex) blog
 * @param slug - slug ex) id
 * @returns ex) /blog/id
 */
const createDetailRouter = (router: string) => (slug: string) => {
  return `${createNormalRouter(router)}/${slug}`;
};

export const ROUTE = {
  HOME: createNormalRouter("HOME"),
  LOGIN: createAuthRouter("LOGIN"),
  SIGN_UP: createAuthRouter("SIGN_UP"),
  EMAIL_VERIFICATION: createAuthRouter("EMAIL_VERIFICATION"),
  MY_PAGE: createUserRouter("MY_PAGE"),
  FORGET_PASSWORD: createAuthRouter("FORGET_PASSWORD"),
  LOCATION: createNormalRouter("LOCATION"),
  LOCATION_DETAIL: createDetailRouter("LOCATION"),
  HOSPITAL: createNormalRouter("HOSPITAL"),
  HOSPITAL_DETAIL: createDetailRouter("HOSPITAL"),
  EVENT: createNormalRouter("EVENT"),
  EVENT_DETAIL: createDetailRouter("EVENT"),
  RECOMMEND: createNormalRouter("RECOMMEND"),
  RECOMMEND_DETAIL: createDetailRouter("RECOMMEND"),
  FAVORITE: createUserRouter("FAVORITE"),
  UPDATE_PASSWORD: createNormalRouter("update-password"),
  UPLOAD_HOSPITAL: createAdminRouter("upload"),
};
