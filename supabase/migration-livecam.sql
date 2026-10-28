-- ===== Profils livecam : paiement Wero / PayPal ===== a lancer UNE fois
alter table public.profiles add column if not exists pay_wero text check (pay_wero is null or char_length(pay_wero) <= 80);
alter table public.profiles add column if not exists pay_paypal text check (pay_paypal is null or char_length(pay_paypal) <= 80);
grant update (pay_wero, pay_paypal) on public.profiles to authenticated;
