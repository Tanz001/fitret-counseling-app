-- Run this in Supabase SQL Editor so therapists can see patient names/photos on appointments.
-- Without this, RLS on public.users blocks the therapist from reading patient rows.

-- Policy: Therapists can SELECT from users only for users who are their patients
-- (i.e. the user's id appears as patient_id in an appointment where therapist_id = current user).

DROP POLICY IF EXISTS "Therapists can read their patients" ON public.users;
CREATE POLICY "Therapists can read their patients"
ON public.users
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT patient_id
    FROM public.appointments
    WHERE therapist_id = auth.uid()
  )
);

-- After running this, reload the doctor Schedule/Appointments screen;
-- patient names (e.g. Tanzeel) and profile pictures should appear.
