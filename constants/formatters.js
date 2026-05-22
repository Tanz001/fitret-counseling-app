export const formatDisplayDate = (dateValue) => {
  if (!dateValue) return '—';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return String(dateValue);
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDisplayTime = (timeValue) => {
  if (!timeValue) return '—';
  const value = String(timeValue).trim();
  const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!match) return value;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3];
  if (period) {
    return `${hours}:${minutes} ${period.toUpperCase()}`;
  }
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

export const formatTimeWithLocalLabel = (timeValue, localTimeValue) => {
  const sessionTime = formatDisplayTime(timeValue);
  const localTime = formatDisplayTime(localTimeValue || timeValue);
  if (!sessionTime || sessionTime === '—') return localTime;
  return `${sessionTime} (${localTime} Local Time)`;
};

export const formatEthiopianPhone = (input = '') => {
  const raw = String(input || '').replace(/[^\d+]/g, '');
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  let local = '';
  if (digits.startsWith('251')) {
    local = digits.slice(3);
  } else if (digits.startsWith('0')) {
    local = digits.slice(1);
  } else if (digits.startsWith('9')) {
    local = digits;
  } else {
    local = digits;
  }
  return `+251${local.slice(0, 9)}`;
};
