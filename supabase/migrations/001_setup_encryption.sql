-- 001 — Encryption helpers + app schema
create schema if not exists app;

-- Store PII encryption key in Vault (idempotent)
do $$
declare
  v_existing uuid;
begin
  select id into v_existing from vault.secrets where name = 'pii_encryption_key';
  if v_existing is null then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'pii_encryption_key',
      'PII (id_number, bank_account_number) symmetric encryption key'
    );
  end if;
end $$;

create or replace function app.encrypt_pii(plaintext text)
returns bytea
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text;
begin
  if plaintext is null or plaintext = '' then return null; end if;
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'pii_encryption_key';
  return extensions.pgp_sym_encrypt(plaintext, v_key);
end;
$$;

create or replace function app.decrypt_pii(ciphertext bytea)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text;
begin
  if ciphertext is null then return null; end if;
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'pii_encryption_key';
  return extensions.pgp_sym_decrypt(ciphertext, v_key);
end;
$$;

revoke all on function app.encrypt_pii(text) from public;
revoke all on function app.decrypt_pii(bytea) from public;
grant execute on function app.encrypt_pii(text) to authenticated, service_role;
grant execute on function app.decrypt_pii(bytea) to authenticated, service_role;

create or replace function app.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
