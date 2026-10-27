-- ===== Supprimer mon profil et toutes mes donnees ===== a lancer UNE fois
-- Efface le compte de connexion : le profil, les commentaires, les signalements de numeros,
-- la fiche association et les favoris partent avec (suppression en cascade).
-- Les photos et videos sont effacees par le site juste avant (dossier de la personne).
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Non connecte'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
