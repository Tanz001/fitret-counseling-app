/** PDFs open via Google viewer in the browser (works without native WebView). */
export function buildFormOpenUrl(fileUrl, fileType) {
  const url = String(fileUrl || '').trim();
  const isPdf = fileType === 'pdf' || /\.pdf(\?|$)/i.test(url);
  if (isPdf) {
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
  }
  return url;
}
