export default function base64ToBlob(base64: string): Blob {
  const [meta, data] = base64.split(',');
  const mime = meta.match(/:(.*?);/)?.[1] || 'application/octet-stream';

  const bytes = atob(data);
  const buffer = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    buffer[i] = bytes.charCodeAt(i);
  }

  return new Blob([buffer], { type: mime });
}
