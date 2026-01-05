export interface RoutineTemplate {
  type: 'basic' | 'intermediate' | 'advanced';
  morning: StepTemplate[];
  midday: StepTemplate[];
  evening: StepTemplate[];
}

export interface StepTemplate {
  step_order: number;
  step_type: string;
  step_name: string;
  required: boolean;
  recommended_ingredients?: string[];
  recommendation_reason?: string;
}

/**
 * 주의 : product_category_step_mapping 테이블의 routine_step 컬럼 값과 step_type 가 현재 일치되어야함.
 * step_type 를 변경/추가/삭제시 반드시 product_category_step_mapping 테이블의 routine_step 컬럼도 변경되어야함. 
 * 더 유연하고 안정적인 관리방법이 필요함 
 */
export const BASIC_TEMPLATE: RoutineTemplate = {
  type: 'basic',
  morning: [
    {
      step_order: 1,
      step_type: 'cleanser',
      step_name: 'Gentle Cleanser',
      required: true,
      recommended_ingredients: ['ceramide', 'glycerin'],
      recommendation_reason: 'Maintain skin barrier'
    },
    {
      step_order: 2,
      step_type: 'moisturizer',
      step_name: 'Hydrating Moisturizer',
      required: true,
      recommended_ingredients: ['hyaluronic_acid', 'squalane'],
      recommendation_reason: 'Lock in hydration'
    },
    {
      step_order: 3,
      step_type: 'sunscreen',
      step_name: 'Broad Spectrum Sunscreen',
      required: true,
      recommended_ingredients: ['zinc_oxide'],
      recommendation_reason: 'UV protection essential'
    }
  ],
  midday: [
    {
      step_order: 1,
      step_type: 'sunscreen',
      step_name: 'Sunscreen Reapplication',
      required: true,
      recommended_ingredients: ['zinc_oxide'],
      recommendation_reason: 'SPF wears off after 2-3 hours'
    }
  ],
  evening: [
    {
      step_order: 1,
      step_type: 'cleanser',
      step_name: 'Cleansing Oil',
      required: true,
      recommended_ingredients: ['jojoba_oil'],
      recommendation_reason: 'Remove makeup and sunscreen'
    },
    {
      step_order: 2,
      step_type: 'cleanser',
      step_name: 'Foam Cleanser',
      required: true,
      recommended_ingredients: ['ceramide'],
      recommendation_reason: 'Double cleanse'
    },
    {
      step_order: 3,
      step_type: 'moisturizer',
      step_name: 'Night Cream',
      required: true,
      recommended_ingredients: ['ceramide', 'niacinamide'],
      recommendation_reason: 'Repair skin barrier overnight'
    }
  ]
};

export const INTERMEDIATE_TEMPLATE: RoutineTemplate = {
  type: 'intermediate',
  morning: [
    {
      step_order: 1,
      step_type: 'cleanser',
      step_name: 'Gentle Cleanser',
      required: true
    },
    {
      step_order: 2,
      step_type: 'toner',
      step_name: 'Hydrating Toner',
      required: false,
      recommended_ingredients: ['hyaluronic_acid']
    },
    {
      step_order: 3,
      step_type: 'serum',
      step_name: 'Vitamin C Serum',
      required: false,
      recommended_ingredients: ['ascorbic_acid', 'vitamin_e']
    },
    {
      step_order: 4,
      step_type: 'moisturizer',
      step_name: 'Lightweight Moisturizer',
      required: true
    },
    {
      step_order: 5,
      step_type: 'sunscreen',
      step_name: 'SPF 50 Sunscreen',
      required: true
    }
  ],
  midday: [
    {
      step_order: 1,
      step_type: 'blotting_paper',
      step_name: 'Oil Control Paper',
      required: false,
      recommendation_reason: 'Remove excess sebum (oily skin)'
    },
    {
      step_order: 2,
      step_type: 'sunscreen',
      step_name: 'Cushion Sunscreen SPF 50',
      required: true,
      recommended_ingredients: ['zinc_oxide']
    }
  ],
  evening: [
    {
      step_order: 1,
      step_type: 'cleanser',
      step_name: 'Double Cleanse (Oil + Foam)',
      required: true
    },
    {
      step_order: 2,
      step_type: 'toner',
      step_name: 'pH Balancing Toner',
      required: false
    },
    {
      step_order: 3,
      step_type: 'serum',
      step_name: 'Treatment Serum',
      required: false,
      recommended_ingredients: ['niacinamide', 'peptides']
    },
    {
      step_order: 4,
      step_type: 'moisturizer',
      step_name: 'Night Cream',
      required: true
    },
    {
      step_order: 5,
      step_type: 'treatment',
      step_name: 'Retinol (2-3x/week)',
      required: false,
      recommended_ingredients: ['retinol']
    }
  ]
};

export const ADVANCED_TEMPLATE: RoutineTemplate = {
  type: 'advanced',
  morning: [
    {
      step_order: 1,
      step_type: 'cleanser',
      step_name: 'Gentle Cleanser',
      required: true
    },
    {
      step_order: 2,
      step_type: 'toner',
      step_name: 'Hydrating Toner',
      required: true
    },
    {
      step_order: 3,
      step_type: 'essence',
      step_name: 'First Essence',
      required: false,
      recommended_ingredients: ['galactomyces', 'niacinamide']
    },
    {
      step_order: 4,
      step_type: 'serum',
      step_name: 'Vitamin C Serum',
      required: false
    },
    {
      step_order: 5,
      step_type: 'eye_cream',
      step_name: 'Eye Cream',
      required: false,
      recommended_ingredients: ['caffeine', 'peptides']
    },
    {
      step_order: 6,
      step_type: 'moisturizer',
      step_name: 'Lightweight Moisturizer',
      required: true
    },
    {
      step_order: 7,
      step_type: 'sunscreen',
      step_name: 'SPF 50+ PA++++ Sunscreen',
      required: true
    }
  ],
  midday: [
    {
      step_order: 1,
      step_type: 'blotting_paper',
      step_name: 'Oil Blotting Paper',
      required: false
    },
    {
      step_order: 2,
      step_type: 'mist',
      step_name: 'Hydrating Mist',
      required: false,
      recommended_ingredients: ['hyaluronic_acid', 'aloe_vera']
    },
    {
      step_order: 3,
      step_type: 'sunscreen',
      step_name: 'Cushion Sunscreen SPF 50+',
      required: true
    }
  ],
  evening: [
    {
      step_order: 1,
      step_type: 'cleanser',
      step_name: 'Cleansing Oil',
      required: true
    },
    {
      step_order: 2,
      step_type: 'cleanser',
      step_name: 'Foam Cleanser',
      required: true
    },
    {
      step_order: 3,
      step_type: 'exfoliant',
      step_name: 'AHA/BHA Exfoliant (2x/week)',
      required: false,
      recommended_ingredients: ['glycolic_acid', 'salicylic_acid']
    },
    {
      step_order: 4,
      step_type: 'toner',
      step_name: 'pH Balancing Toner',
      required: true
    },
    {
      step_order: 5,
      step_type: 'essence',
      step_name: 'Treatment Essence',
      required: false
    },
    {
      step_order: 6,
      step_type: 'serum',
      step_name: 'Treatment Serum',
      required: false
    },
    {
      step_order: 7,
      step_type: 'eye_cream',
      step_name: 'Anti-Aging Eye Cream',
      required: false
    },
    {
      step_order: 8,
      step_type: 'moisturizer',
      step_name: 'Rich Night Cream',
      required: true
    },
    {
      step_order: 9,
      step_type: 'facial_oil',
      step_name: 'Nourishing Facial Oil',
      required: false,
      recommended_ingredients: ['squalane', 'rosehip_oil']
    }
  ]
};
