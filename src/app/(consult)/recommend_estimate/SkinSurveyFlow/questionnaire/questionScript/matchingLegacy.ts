import { TreatmentType } from "./treatmentType";
import { USER_INFO, BUDGET, HEALTH_CONDITIONS, SKIN_CONCERNS, TREATMENT_GOALS, UPLOAD_PHOTO, VISIT_PATHS } from '@/constants/estimate_steps';

const recommend: typeof TreatmentType[keyof typeof TreatmentType][] = [];

export function matching(stepId: string, age: number, budget: number, data: any) {
    
        switch (stepId) {
          case SKIN_CONCERNS:
            data.skinConcerns.forEach((concern: any) => {
                if (concern.id === "acne") {
                    recommend.push(TreatmentType.capri);
                    recommend.push(TreatmentType.neobeam);
                }
                else if (concern.id === "pores") {
                    //a
                    recommend.push(TreatmentType.potenza);
                    recommend.push(TreatmentType.secret);
                    recommend.push(TreatmentType.fraxel);

                    // or  b
                    recommend.push(TreatmentType.skinbooster_juvelook);
                    recommend.push(TreatmentType.skinbooster_rejuran);
                    recommend.push(TreatmentType.skinbooster_ha);
                    


                    // or ab
                    
                    
                }
                else if (concern.id === "redness") {
                    // a
                    recommend.push(TreatmentType.v_beam);
                    recommend.push(TreatmentType.exel_v);

                    // or b
                    recommend.push(TreatmentType.stem_cell);
                    recommend.push(TreatmentType.skinbooster_juvelook);
                    recommend.push(TreatmentType.skinbooster_rejuran);
                    recommend.push(TreatmentType.skinbooster_ha);

                    // or ab
                    
                }
                else if (concern.id === "uneven_tone") {
                    recommend.push(TreatmentType.toning);
                    recommend.push(TreatmentType.genesis);
                }
                else if (concern.id === "sagging") {
                    if (age >= 30 && age < 40) {
                        recommend.push(TreatmentType.ulthera_400);
                        recommend.push(TreatmentType.shrink_400);
                        recommend.push(TreatmentType.liftera_400);

                    }
                    else if (age >= 40 && age < 50) {
                        recommend.push(TreatmentType.ulthera_600);
                        recommend.push(TreatmentType.shrink_600);
                        recommend.push(TreatmentType.liftera_600);
                    }
                    else if (age >= 50) {
                        recommend.push(TreatmentType.ulthera_800);
                        recommend.push(TreatmentType.shrink_800);
                        recommend.push(TreatmentType.liftera_800);
                    }
                    recommend.push(TreatmentType.inmode);
                    recommend.push(TreatmentType.onda);
                    recommend.push(TreatmentType.tune_liner);
                }
                else if (concern.id === "elasticity") {
                    if (age >= 30 && age < 40) {
                        recommend.push(TreatmentType.thermage_600);
                        recommend.push(TreatmentType.oligio_600);
                        recommend.push(TreatmentType.density_600);

                    }
                    else if (age >= 40 && age < 50) {
                        recommend.push(TreatmentType.thermage_900);
                        recommend.push(TreatmentType.oligio_900);
                        recommend.push(TreatmentType.density_900);
                    }
                    recommend.push(TreatmentType.tune_face);
                    recommend.push(TreatmentType.inmode);
                    recommend.push(TreatmentType.onda);
                }
                else if (concern.id === "doublie_chin") {
                    recommend.push(TreatmentType.ulthera_200);
                    recommend.push(TreatmentType.shrink_200);
                    recommend.push(TreatmentType.liftera_200);                    
                    recommend.push(TreatmentType.tune_face);
                    recommend.push(TreatmentType.inmode);
                    recommend.push(TreatmentType.onda);
                }
                else if (concern.id === "volumizing") {
                    recommend.push(TreatmentType.juvelook);
                    recommend.push(TreatmentType.scultra);
                    recommend.push(TreatmentType.filler);
                    
                }
                else if (concern.id === "wrinkles") {
                    recommend.push(TreatmentType.botox);
                    recommend.push(TreatmentType.sof_wave_200);
                    // recommend.push(TreatmentType.sof_wave_300);
                }
                else if (concern.id === "dryness_glow") {
                    recommend.push(TreatmentType.stem_cell);
                    recommend.push(TreatmentType.skinbooster_juvelook);
                    recommend.push(TreatmentType.skinbooster_rejuran);
                    recommend.push(TreatmentType.skinbooster_ha);
                }
                else if (concern.id === "pigmentation") {
                    if (concern.subOptions.id === "Moles") {
                        recommend.push(TreatmentType.co2);
                    } else if (concern.subOptions.id === "lentigo") {
                        recommend.push(TreatmentType.repot_or_toning_and_genesis);
                    } else {
                        recommend.push(TreatmentType.toning);
                        recommend.push(TreatmentType.genesis);
                    }

                }
                else if (concern.id === "scars") {
                    if (concern.subOptions.id === "red") {
                        recommend.push(TreatmentType.v_beam);
                        recommend.push(TreatmentType.exel_v);
                        
                    } else if (concern.subOptions.id === "brown") {
                        recommend.push(TreatmentType.toning);
                        recommend.push(TreatmentType.genesis);
                    } else if (concern.subOptions.id === "rough") {
                        recommend.push(TreatmentType.potenza);
                        recommend.push(TreatmentType.secret);
                        recommend.push(TreatmentType.fraxel);
                        recommend.push(TreatmentType.juvegen);
                        recommend.push(TreatmentType.skinbooster_juvelook);
                        recommend.push(TreatmentType.skinbooster_rejuran);
                        recommend.push(TreatmentType.skinbooster_ha);                        
                        recommend.push(TreatmentType.stem_cell);
                    }
                }
                else if (concern.id === "filler") {
                    recommend.push(TreatmentType.filler);
                }
                else if (concern.id === "other") {
                    // recommend.push(TreatmentType.other);
                }
            });
    
        }
}