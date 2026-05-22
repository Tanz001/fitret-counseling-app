import { supabase } from '../utils/supabase';
import { getCurrentUserId } from './resourcesApi';

/** Forms assigned to the logged-in patient (enforced by RLS). */
export async function fetchPatientForms() {
  const userId = await getCurrentUserId();

  const { data: accessRows, error: accessError } = await supabase
    .from('form_access')
    .select('form_id')
    .eq('patient_id', userId);

  if (accessError) throw accessError;
  const formIds = (accessRows || []).map((r) => r.form_id).filter(Boolean);
  if (formIds.length === 0) return [];

  const { data, error } = await supabase
    .from('forms')
    .select('id, title, description, file_url, file_type, is_active, created_at')
    .in('id', formIds)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function getTherapistAssignedPatientIds() {
  const therapistId = await getCurrentUserId();
  const { data: assignments, error } = await supabase
    .from('patient_therapists')
    .select('patient_id')
    .eq('therapist_id', therapistId);
  if (error) throw error;
  return [...new Set((assignments || []).map((a) => a.patient_id).filter(Boolean))];
}

/** Forms assigned to the therapist's patients (patient_therapists + RLS). */
export async function fetchTherapistForms(patientId = null) {
  const assignedPatientIds = await getTherapistAssignedPatientIds();
  if (assignedPatientIds.length === 0) return [];

  const { data: accessRows, error: accessError } = await supabase
    .from('form_access')
    .select('id, patient_id, form_id, created_at')
    .in('patient_id', assignedPatientIds)
    .order('created_at', { ascending: false });

  if (accessError) throw accessError;
  if (!accessRows?.length) return [];

  const scopedRows = patientId
    ? accessRows.filter((r) => r.patient_id === patientId)
    : accessRows;
  if (!scopedRows.length) return [];

  const formIds = [...new Set(scopedRows.map((r) => r.form_id).filter(Boolean))];
  const { data: forms, error: formsError } = await supabase
    .from('forms')
    .select('id, title, description, file_url, file_type, is_active, created_at')
    .in('id', formIds)
    .eq('is_active', true);

  if (formsError) throw formsError;

  const formMap = {};
  (forms || []).forEach((f) => {
    formMap[f.id] = f;
  });

  const patientIds = [...new Set(scopedRows.map((r) => r.patient_id).filter(Boolean))];
  let patientMap = {};
  if (patientIds.length > 0) {
    const { data: patients } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', patientIds);
    (patients || []).forEach((p) => {
      patientMap[p.id] = p.full_name || p.email || 'Patient';
    });
  }

  return scopedRows
    .map((row) => {
      const form = formMap[row.form_id];
      if (!form) return null;
      return {
        accessId: row.id,
        patientId: row.patient_id,
        patientName: patientMap[row.patient_id] || 'Patient',
        assignedAt: row.created_at,
        form,
      };
    })
    .filter(Boolean);
}
