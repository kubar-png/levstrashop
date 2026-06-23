import type { VariantSpec } from './types';

// btoa/atob are global in Node 18+ and browsers; TextEncoder makes it UTF-8 safe.
function base64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(s: string): string {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSpec(spec: VariantSpec): string {
  return base64urlEncode(JSON.stringify(spec));
}

export function decodeSpec(s: string): VariantSpec {
  return JSON.parse(base64urlDecode(s)) as VariantSpec;
}
