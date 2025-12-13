

// 각 토픽별로 미리 정의된 이미지 배열 (topic_id를 키로 사용하는 Map)
export const TOPIC_IMAGES: Record<string, string[]> = {
  // lifting_firming
  lifting_firming: [
    "/landing_model/model_2.jpeg",
    "/landing_model/img1.png",
    "/landing_model/img2.png",
    "/landing_model/img3.png"
  ],

  // lifting_elasticity
  lifting_elasticity: [
    "/landing_model/model_2.jpeg",
    "/landing_model/img1.png",
    "/landing_model/img2.png",
    "/landing_model/img3.png"
  ],

  // intimate_wellness
  intimate_wellness: [
    "/landing_model/model_3.jpeg",
    "/landing_model/model_4.jpeg",
    "/landing_model/img4.png",
    "/landing_model/img5.png",
  ],

  // body_contouring_fat
  body_contouring_fat: [
    "/landing_model/body_contuoring_fat_5.jpg",
    "/landing_model/body_contuoring_fat_3.jpg",
    "/landing_model/body_contuoring_fat_4.jpg",
    "/landing_model/body_contuoring_fat_1.jpg",
  ],

  // volume_enhancement
  volume_enhancement: [
    "/landing_model/img4.png",
    "/landing_model/img18.jpg",
    "/landing_model/img19.jpg",
    "/landing_model/img21.jpg"
  ],

  // pore_texture
  pore_texture: [
    "/landing_model/img23.jpg",
    "/landing_model/img13.jpg",
    "/landing_model/img14.jpg",
    "/landing_model/img16.jpg"
  ],

  // tone_spots
  tone_spots: [
    "/landing_model/img12.jpg",
    "/landing_model/img13.jpg",
    "/landing_model/img14.jpg",
    "/landing_model/img16.jpg"
  ],

  // antiaging_regeneration
  antiaging_regeneration: [
    "/landing_model/img20.png",
    "/landing_model/img24.jpg",
    "/landing_model/img25.jpg",
    "/landing_model/img26.jpg"
  ],

  // wrinkle_reduction
  wrinkle_reduction: [
    "/landing_model/img22.jpg",
    "/landing_model/img24.jpg",
    "/landing_model/img25.jpg",
    "/landing_model/img26.jpg"
  ],

  // misc_hair_body
  misc_hair_body: [
    "/landing_model/misc_hair_body.jpg",
    "/landing_model/img27.jpg",
    "/landing_model/img28.jpg",
    "/landing_model/img29.jpg",
    "/landing_model/img31.jpg"
  ],

  // contour_line
  contour_line: [
    "/landing_model/vline.jpg",
    "/landing_model/img8.png",
    "/landing_model/img9.png",
    "/landing_model/model_1.png",
    "/landing_model/img11.jpg"
  ],
};



// 각 카테고리별로 미리 정의된 이미지 배열 (11개 카테고리)
export const CATEGORY_IMAGES = [
    // 카테고리 0: Lifting_Firming
    [
      "/landing_model/model_1.png",
      "/landing_model/model_2.jpeg", 
      "/landing_model/img1.png",
      "/landing_model/img2.png",
      "/landing_model/img3.png"
    ],
    // 카테고리 1: Body_Contouring
    [
      "/landing_model/model_3.jpeg",
      "/landing_model/model_4.jpeg",
      "/landing_model/img4.png",
      "/landing_model/img5.png",
      "/landing_model/img6.jpg"
    ],
    // 카테고리 2: Wrinkle_AntiAging
    [
      "/landing_model/model_5.png",
      "/landing_model/img7.png",
      "/landing_model/img8.png",
      "/landing_model/img9.png",
      "/landing_model/img10.jpg"
    ],
    // 카테고리 3: Tone_Texture
    [
      "/landing_model/img11.jpg",
      "/landing_model/img12.jpg",
      "/landing_model/img13.jpg",
      "/landing_model/img14.jpg",
      "/landing_model/img15.jpg"
    ],
    // 카테고리 4: Acne_Scars
    [
      "/landing_model/img16.jpg",
      "/landing_model/img17.jpg",
      "/landing_model/img18.jpg",
      "/landing_model/img19.jpg",
      "/landing_model/img20.png"
    ],
    // 카테고리 5: Pores_Sebum
    [
      "/landing_model/img21.jpg",
      "/landing_model/img22.jpg",
      "/landing_model/img23.jpg",
      "/landing_model/img24.jpg",
      "/landing_model/img25.jpg"
    ],
    // 카테고리 6: Pigmentation_Spots
    [
      "/landing_model/img26.jpg",
      "/landing_model/img27.jpg",
      "/landing_model/img28.jpg",
      "/landing_model/img29.jpg",
      "/landing_model/img30.jpg"
    ],
    // 카테고리 7: Hair_Removal
    [
      "/landing_model/img31.jpg",
      "/landing_model/img32.jpg",
      "/landing_model/img33.jpg",
      "/landing_model/img34.jpg",
      "/landing_model/model_1.png"
    ],
    // 카테고리 8: Skin_Care
    [
      "/landing_model/img17.jpg",
      "/landing_model/img18.jpg",
      "/landing_model/img1.png",
      "/landing_model/img5.png",
      "/landing_model/img9.jpg"
    ],
    // 카테고리 9: Filler_Volume
    [
      "/landing_model/model_4.jpeg",
      "/landing_model/model_5.png",
      "/landing_model/img13.jpg",
      "/landing_model/img17.jpg",
      "/landing_model/img21.jpg"
    ],
    // 카테고리 10: Hair_Scalp
    [
      "/landing_model/img25.jpg",
      "/landing_model/img29.jpg",
      "/landing_model/img33.jpg",
      "/landing_model/img6.jpg",
      "/landing_model/img10.jpg"
    ]
  ];

// 성형외과 수술용 이미지 배열 (2개 카테고리: facial_surgery, body_surgery)
export const SURGERY_IMAGES = [
  // 카테고리 0: facial_surgery (안면 성형)
  [
    "/landing_model/model_1.png",
    "/landing_model/model_2.jpeg",
    "/landing_model/img1.png",
    "/landing_model/img2.png",
  ],
  // 카테고리 1: body_surgery (신체 성형)
  [
    "/landing_model/model_3.jpeg",
    "/landing_model/model_4.jpeg",
    "/landing_model/img4.png",
    "/landing_model/img5.png",
  ],
];
