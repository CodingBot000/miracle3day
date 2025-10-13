@startuml
!theme plain

entity "treatment_similar_groups" as groups {
  * group_id : text <<PK>>
  --
  ko : text
  en : text
  sort_order : int
  icon : text
  color : text
  slug : text <<unique>>
  is_active : boolean
  description : jsonb
}

entity "treatments_root" as root {
  * id : text <<PK>>
  --
  ko : text
  en : text
  group_id : text <<FK -> groups.group_id>>
  summary : jsonb
  tags : jsonb
  attributes : jsonb
  pain_level : text (generated)
  pain_score_0_10 : int (generated)
  effect_onset_weeks_min : int (generated)
  effect_onset_weeks_max : int (generated)
  duration_months_min : int (generated)
  duration_months_max : int (generated)
  cost_currency : text (generated)
  cost_from : numeric (generated)
  rec_sessions_min : int (generated)
  rec_sessions_max : int (generated)
  rec_interval_weeks : int (generated)
}

entity "treatments_alias" as alias {
  * alias_id : text <<PK>>
  --
  root_id : text <<FK -> root.id>>
  ko : text
  en : text
  created_at : timestamptz
  updated_at : timestamptz
}

entity "treatment_care_protocols" as protocols {
  * protocol_id : serial <<PK>>
  --
  topic_id : text
  topic_title_ko : text
  topic_title_en : text
  concern_copy_ko : text
  concern_copy_en : text
  area_id : text
  area_name_ko : text
  area_name_en : text
  primary_treatment_ids : text[] <<FK -> root.id>>
  alt_treatment_ids : text[] <<FK -> root.id>>
  combo_treatment_ids : text[] <<FK -> root.id>>
  benefits_ko : text
  benefits_en : text
  sequence_ko : text
  sequence_en : text
  cautions_ko : text
  cautions_en : text
}

' 관계선 정의
groups ||--o{ root : "1:N"
root ||--o{ alias : "1:N"
root }o--o{ protocols : "N:M (via 배열 참조)"

@enduml
