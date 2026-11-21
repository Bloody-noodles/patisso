-- Pâtissö currency migration: Tanzanian shillings to Nigerian naira.
-- Existing numeric values are preserved; this project currently has no live fulfilment.
alter table public.patisso_demo_orders
  rename column total_tsh to total_naira;
