import { supabase } from '../utils/supabase';

export async function getCurrentUserId() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Not signed in');
  return user.id;
}

/** Resources assigned to the logged-in patient (enforced by RLS). */
export async function fetchPatientResources(resourceType = null) {
  const userId = await getCurrentUserId();

  const { data: accessRows, error: accessError } = await supabase
    .from('resource_access')
    .select('resource_id')
    .eq('patient_id', userId);

  if (accessError) throw accessError;
  const resourceIds = (accessRows || []).map((r) => r.resource_id).filter(Boolean);
  if (resourceIds.length === 0) return [];

  let query = supabase
    .from('resources')
    .select('id, title, description, resource_type, content, file_url, thumbnail, is_active, created_at')
    .in('id', resourceIds)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (resourceType) {
    query = query.eq('resource_type', resourceType);
  }

  const { data: resources, error } = await query;
  if (error) throw error;

  const { data: submissions } = await supabase
    .from('resource_submissions')
    .select('resource_id, submitted_at, updated_at')
    .eq('patient_id', userId);

  const submissionMap = {};
  (submissions || []).forEach((s) => {
    submissionMap[s.resource_id] = s;
  });

  return (resources || []).map((r) => ({
    ...r,
    submission: submissionMap[r.id] || null,
    status: submissionMap[r.id] ? 'Completed' : 'Assigned',
  }));
}

export async function fetchPatientSubmission(resourceId) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('resource_submissions')
    .select('id, submitted_data, submitted_at, updated_at')
    .eq('resource_id', resourceId)
    .eq('patient_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
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

/** Resources assigned to the therapist's patients (patient_therapists + RLS). */
export async function fetchTherapistResources(patientId = null) {
  const assignedPatientIds = await getTherapistAssignedPatientIds();
  if (assignedPatientIds.length === 0) return [];

  const { data: accessRows, error: accessError } = await supabase
    .from('resource_access')
    .select('id, patient_id, resource_id, created_at')
    .in('patient_id', assignedPatientIds)
    .order('created_at', { ascending: false });

  if (accessError) throw accessError;
  if (!accessRows?.length) return [];

  const scopedRows = patientId
    ? accessRows.filter((r) => r.patient_id === patientId)
    : accessRows;
  if (!scopedRows.length) return [];

  const resourceIds = [...new Set(scopedRows.map((r) => r.resource_id).filter(Boolean))];
  const { data: resources, error: resError } = await supabase
    .from('resources')
    .select('id, title, description, resource_type, content, file_url, thumbnail, is_active, created_at')
    .in('id', resourceIds)
    .eq('is_active', true);

  if (resError) throw resError;

  const resourceMap = {};
  (resources || []).forEach((r) => {
    resourceMap[r.id] = r;
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

  const { data: submissions } = await supabase
    .from('resource_submissions')
    .select('resource_id, patient_id, submitted_at, updated_at');

  const subMap = {};
  (submissions || []).forEach((s) => {
    subMap[`${s.resource_id}:${s.patient_id}`] = s;
  });

  return scopedRows
    .map((row) => {
      const resource = resourceMap[row.resource_id];
      if (!resource) return null;
      const sub = subMap[`${row.resource_id}:${row.patient_id}`];
      return {
        accessId: row.id,
        patientId: row.patient_id,
        patientName: patientMap[row.patient_id] || 'Patient',
        assignedAt: row.created_at,
        resource,
        submission: sub || null,
        status: sub ? 'Completed' : 'Pending',
      };
    })
    .filter(Boolean);
}

export async function fetchTherapistResourceSubmission(resourceId, patientId) {
  const { data, error } = await supabase
    .from('resource_submissions')
    .select('id, submitted_data, submitted_at, updated_at')
    .eq('resource_id', resourceId)
    .eq('patient_id', patientId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertResourceSubmission(resourceId, submittedData) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('resource_submissions')
    .upsert(
      {
        resource_id: resourceId,
        patient_id: userId,
        submitted_data: submittedData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'resource_id,patient_id' },
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}
