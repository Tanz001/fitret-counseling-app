-- Run in Supabase SQL Editor to allow phone-number login (lookup email before sign-in).
-- Matches phones by digits only so formats like +92 300 1234567 and 03001234567 align.

CREATE OR REPLACE FUNCTION public.get_email_by_phone(phone_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_email text;
  input_digits text;
BEGIN
  input_digits := regexp_replace(phone_input, '[^0-9]', '', 'g');
  IF length(input_digits) < 8 THEN
    RETURN NULL;
  END IF;

  SELECT u.email INTO found_email
  FROM public.users u
  WHERE regexp_replace(coalesce(u.phone, ''), '[^0-9]', '', 'g') = input_digits
     OR regexp_replace(coalesce(u.phone, ''), '[^0-9]', '', 'g') = right(input_digits, 10)
     OR right(regexp_replace(coalesce(u.phone, ''), '[^0-9]', '', 'g'), 10) = right(input_digits, 10)
  LIMIT 1;

  RETURN found_email;
END;
$$;

REVOKE ALL ON FUNCTION public.get_email_by_phone(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_email_by_phone(text) TO anon, authenticated;
