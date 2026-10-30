-- Double authentification : une fois qu'un administrateur a activé son application d'authentification,
-- les droits admin ne fonctionnent plus qu'avec un code valide (session « aal2 »).
-- Sans double authentification activée, rien ne change (aucun risque de blocage).
-- Prérequis : Supabase > Authentication > Sign In / Providers (ou Multi-Factor) > activer « TOTP » (par défaut activé).
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public, auth as
$$ select exists (select 1 from public.admins where id = auth.uid())
   and ( coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
         or not exists (select 1 from auth.mfa_factors f where f.user_id = auth.uid() and f.status = 'verified') ) $$;
