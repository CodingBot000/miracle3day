##database 

create table attendance_monthly (
   user_id uuid not null, 
   ym date not null, -- 그 달의 1일 (예: 2025-09-01) 
days boolean[] not null default array_fill(false, ARRAY[31]), -- 1~31일
 user_tz text not null default 'UTC',
  created_at timestamptz not null default now(),
   updated_at timestamptz not null default now(), 
   primary key (user_id, ym), -- 항상 길이 31 유지 (UI에서 말일 초과분은 무시)
    check (array_length(days, 1) = 31) ); 
    
    
    create index on attendance_monthly (ym);







    create table point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  amount int not null,            -- +적립 / -사용
  type text not null,             -- 'attendance', 'consultation', 'community', ...
  idempotency_key text unique,    -- 예: 'attendance:{user_id}:{ym}:{day}'
  meta jsonb,
  created_at timestamptz not null default now()
);



-- 3) RLS (사용자 본인만 접근)
alter table public.attendance_monthly enable row level security;
alter table public.point_transactions enable row level security;

-- 본인 데이터 읽기/쓰기 허용
drop policy if exists am_select on public.attendance_monthly;
create policy am_select on public.attendance_monthly
  for select using (user_id = auth.uid());

drop policy if exists am_ins on public.attendance_monthly;
create policy am_ins on public.attendance_monthly
  for insert with check (user_id = auth.uid());

drop policy if exists am_upd on public.attendance_monthly;
create policy am_upd on public.attendance_monthly
  for update using (user_id = auth.uid());

drop policy if exists pt_select on public.point_transactions;
create policy pt_select on public.point_transactions
  for select using (user_id = auth.uid());

drop policy if exists pt_insert on public.point_transactions;
create policy pt_insert on public.point_transactions
  for insert with check (user_id = auth.uid());
