import QRCode from 'qrcode';

export async function generateSlopeQRDataUrl(slopeId: string, customBaseUrl?: string): Promise<string> {
  const origin = customBaseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://demo-pbt.my');
  // Encodes ONLY the permanent public URL as required:
  // e.g. https://demo-pbt.my/cerun/MPS-SEL-0012
  const url = `${origin}/cerun/${slopeId}`;
  
  try {
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M', // Clean, crisp standard density for fast smartphone scanning
      margin: 2,
      width: 400,
      color: {
        dark: '#000000', // Pure solid black
        light: '#ffffff'  // Pure solid white
      }
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}

export function getSlopePermanentUrl(slopeId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/cerun/${slopeId}`;
  }
  return `https://demo-pbt.my/cerun/${slopeId}`;
}

// Reads a slope ID out of scanned QR text: a full /cerun/<ID> URL or a bare ID
export function extractSlopeId(text: string): string | null {
  const fromUrl = text.match(/\/cerun\/([A-Za-z0-9-]+)/);
  if (fromUrl) return fromUrl[1];
  const bare = text.trim().match(/^[A-Z]{2,5}-[A-Z]{2,5}-\d{3,5}$/i);
  return bare ? bare[0] : null;
}
