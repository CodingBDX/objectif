-- Photos deja envoyees : cache navigateur/CDN d'un an (les noms de fichiers sont uniques, jamais ecrases)
update storage.objects
set metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{cacheControl}', '"max-age=31536000"')
where bucket_id = 'media'
  and coalesce(metadata->>'cacheControl', '') <> 'max-age=31536000';
