-- RLS policies for therapy_journal (patients: read, update, delete own entries)
-- Run in Supabase SQL Editor. Ensure the table and INSERT policy exist first.

-- Patients can read their journals
create policy "Patients can read their journals"
on therapy_journal
for select
to authenticated
using (auth.uid() = patient_id);

-- Patients can update their journals
create policy "Patients can update their journals"
on therapy_journal
for update
to authenticated
using (auth.uid() = patient_id)
with check (auth.uid() = patient_id);

-- Patients can delete their journals
create policy "Patients can delete their journals"
on therapy_journal
for delete
to authenticated
using (auth.uid() = patient_id);
