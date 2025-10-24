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
 * nextjs 디테일 페이지 라우팅 방법은 경로/id 
 * id 대신 원하는 slug 를 사용 그 인자를 받아서 자동으로 router 만들어주는 함수
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
  MY_PAGE: createUserRouter("MY_PAGE"),
  LOCATION: createNormalRouter("LOCATION"),
  LOCATION_DETAIL: createDetailRouter("LOCATION"),
  HOSPITAL: createNormalRouter("HOSPITAL"),
  HOSPITAL_DETAIL: createDetailRouter("HOSPITAL"),
  EVENT: createNormalRouter("EVENT"),
  EVENT_DETAIL: createDetailRouter("EVENT"),
  // DIAGNOTSTIC: createNormalRouter("DIAGNOTSTIC"),
  // DIAGNOTSTIC_DETAIL: createDetailRouter("DIAGNOTSTIC"),
  // ONLINE_CONSULTING: createNormalRouter("ONLINE_CONSULTING"),
  // ONLINE_CONSULTING_DETAIL: createDetailRouter("ONLINE_CONSULTING"),
  DIAGNOTSTIC: "https://treatment-estimate-landinng-tan.vercel.app/estimate",
  AI_ANALYSIS_PAGE: "/ai/youcam/s2s",
  AI_ANALYSIS_CAMERA_PAGE: "/ai/youcam/jscamera",
  ONLINE_CONSULTING: createNormalRouter("ONLINE_CONSULTING"),
  ONLINE_CONSULTING_DETAIL: createDetailRouter("ONLINE_CONSULTING"),
  ABOUTUS: createNormalRouter("ABOUTUS"),
  RECOMMEND: createNormalRouter("RECOMMEND"),
  RECOMMEND_DETAIL: createDetailRouter("RECOMMEND"),
  FAVORITE: createUserRouter("FAVORITE"),
  UPLOAD_HOSPITAL: createAdminRouter("upload"),
  WITHDRAWAL: '/auth/withdrawal',
  RESERVATION: (id: string) => `/hospital/${id}/reservation`
}
