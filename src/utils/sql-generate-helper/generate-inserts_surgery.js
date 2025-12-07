import { log } from "@/utils/logger";

const categories = [
  {
    key: 1000000,
    name: "눈",
    label: "눈",
    children: [
      { key: 1000001, name: "쌍꺼풀", label: "쌍꺼풀" },
      { key: 1000002, name: "트임", label: "트임" },
      { key: 1000003, name: "눈매교정", label: "눈매교정" },
      { key: 1000004, name: "눈모양교정", label: "눈모양교정" },
      { key: 1000005, name: "눈재수술", label: "눈재수술" },
    ],
  },
  {
    key: 1010000,
    name: "코",
    label: "코",
    children: [
      { key: 1010001, name: "콧대", label: "콧대" },
      { key: 1010002, name: "코끝", label: "코끝" },
      { key: 1010003, name: "콧볼", label: "콧볼" },
      { key: 1010004, name: "기능코", label: "기능코" },
      { key: 1010005, name: "코재수술", label: "코재수술" },
    ],
  },
  {
    key: 1020000,
    name: "지방흡입/이식",
    label: "지방흡입/이식",
    children: [
      { key: 1020001, name: "바디지방흡입", label: "바디지방흡입" },
      { key: 1020002, name: "얼굴지방흡입", label: "얼굴지방흡입" },
      { key: 1020003, name: "얼굴지방이식", label: "얼굴지방이식" },
      { key: 1020004, name: "바디지방이식", label: "바디지방이식" },
    ],
  },
  {
    key: 1030000,
    name: "안면윤곽/양악",
    label: "안면윤곽/양악",
    children: [
      { key: 1030001, name: "광대", label: "광대" },
      { key: 1030002, name: "윤곽", label: "윤곽" },
      { key: 1030003, name: "이마", label: "이마" },
      { key: 1030004, name: "양악", label: "양악" },
      { key: 1030005, name: "안면윤곽재수술", label: "안면윤곽재수술" },
    ],
  },
  {
    key: 1040000,
    name: "가슴",
    label: "가슴",
    children: [
      { key: 1040001, name: "가슴모양교정", label: "가슴모양교정" },
      { key: 1040002, name: "유두/유륜", label: "유두/유륜" },
      { key: 1040003, name: "가슴재수술", label: "가슴재수술" },
    ],
  },
  {
    key: 1050000,
    name: "남자성형",
    label: "남자성형",
    children: [
      { key: 1050001, name: "눈", label: "눈" },
      { key: 1050002, name: "코", label: "코" },
      { key: 1050003, name: "가슴", label: "가슴" },
      { key: 1050004, name: "지방흡입/이식", label: "지방흡입/이식" },
      { key: 1050005, name: "안면윤곽/양악", label: "안면윤곽/양악" },
    ],
  },
  {
    key: 1060000,
    name: "기타",
    label: "기타",
    children: [
      { key: 1060001, name: "여성성형", label: "여성성형" },
      { key: 1060002, name: "바디거상", label: "바디거상" },
      { key: 1060003, name: "입술성형", label: "입술성형" },
      { key: 1060004, name: "인중성형", label: "인중성형" },
      { key: 1060005, name: "팔자성형", label: "팔자성형" },
      { key: 1060006, name: "보조개성형", label: "보조개성형" },
      { key: 1060007, name: "엉덩이성형", label: "엉덩이성형" },
      { key: 1060008, name: "귀성형", label: "귀성형" },
      { key: 1060009, name: "기타성형", label: "기타성형" },
    ],
  },
];
  function makeInsert(code, department, level1, name, unit) {
    // unit이 있으면 'unit', 없으면 NULL
    const unitStr = unit ? `'${unit}'` : "NULL";
    // level1, name은 작은따옴표 이스케이프 필요 (있으면 추가)
    return `INSERT INTO treatment (code, department, level1, name, unit) VALUES (${code}, '${department}', '${level1}', '${name}', ${unitStr});`;
  }
  
  const queries = [];
  
  categories.forEach(cat1 => {
    const department = "surgery";
    const level1 = cat1.label;
  
    if (cat1.children) {
      cat1.children.forEach(cat2 => {
        queries.push(
          makeInsert(
            cat2.key,
            department,
            level1,
            cat2.label,
            cat2.unit // 있으면 값, 없으면 undefined/빈값
          )
        );
      });
    }
  });
  
  log.info(queries.join('\n'));
  