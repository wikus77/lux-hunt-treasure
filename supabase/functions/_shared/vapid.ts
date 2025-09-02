// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* VAPID JWT Generation for Deno Edge Functions */

/**
 * Converts base64url string to Uint8Array
 */
function base64urlToUint8Array(base64url: string): Uint8Array {
  const padding = '='.repeat((4 - base64url.length % 4) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array(rawData.split('').map(c => c.charCodeAt(0)));
}

/**
 * Converts Uint8Array to base64url string
 */
function uint8ArrayToBase64url(uint8Array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...uint8Array));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Converts DER signature to JOSE format (R|S concatenation)
 */
function derToJose(der: Uint8Array): Uint8Array {
  // Parse DER: 0x30 [length] 0x02 [r-length] [r] 0x02 [s-length] [s]
  let pos = 2; // Skip 0x30 and total length
  
  // Read R
  if (der[pos] !== 0x02) throw new Error('Invalid DER: expected INTEGER for R');
  pos++;
  const rLength = der[pos++];
  let r = der.slice(pos, pos + rLength);
  pos += rLength;
  
  // Read S
  if (der[pos] !== 0x02) throw new Error('Invalid DER: expected INTEGER for S');
  pos++;
  const sLength = der[pos++];
  let s = der.slice(pos, pos + sLength);
  
  // Ensure R and S are exactly 32 bytes (remove leading zeros if needed)
  if (r.length > 32) r = r.slice(r.length - 32);
  if (s.length > 32) s = s.slice(s.length - 32);
  
  // Pad with leading zeros if needed
  const rPadded = new Uint8Array(32);
  const sPadded = new Uint8Array(32);
  rPadded.set(r, 32 - r.length);
  sPadded.set(s, 32 - s.length);
  
  // Concatenate R|S (64 bytes total)
  const result = new Uint8Array(64);
  result.set(rPadded, 0);
  result.set(sPadded, 32);
  
  return result;
}

/**
 * Generates ES256 VAPID JWT for Web Push
 * @param aud - Audience (origin of the push endpoint)
 * @param sub - Subject (mailto: or https: URL)
 * @param publicKeyBase64url - VAPID public key (base64url, 65 bytes)
 * @param privateKeyBase64url - VAPID private key (base64url, 32 bytes)
 * @returns JWT string
 */
export async function generateVapidJWT(
  aud: string, 
  sub: string, 
  publicKeyBase64url: string, 
  privateKeyBase64url: string
): Promise<string> {
  console.log('🔐 Generating VAPID JWT for:', { aud, sub });
  
  // Decode keys
  const publicKeyBytes = base64urlToUint8Array(publicKeyBase64url);
  const privateKeyBytes = base64urlToUint8Array(privateKeyBase64url);
  
  // Validate key lengths
  if (publicKeyBytes.length !== 65) {
    throw new Error(`Invalid public key length: ${publicKeyBytes.length} (expected 65)`);
  }
  if (privateKeyBytes.length !== 32) {
    throw new Error(`Invalid private key length: ${privateKeyBytes.length} (expected 32)`);
  }
  if (publicKeyBytes[0] !== 0x04) {
    throw new Error(`Invalid public key format: first byte 0x${publicKeyBytes[0].toString(16)} (expected 0x04)`);
  }
  
  console.log('✅ Key validation passed:', {
    publicLength: publicKeyBytes.length,
    privateLength: privateKeyBytes.length,
    publicFormat: '0x' + publicKeyBytes[0].toString(16)
  });
  
  // Extract X and Y coordinates from uncompressed public key (skip 0x04 prefix)
  const x = publicKeyBytes.slice(1, 33);
  const y = publicKeyBytes.slice(33, 65);
  
  // Create JWK for import
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: uint8ArrayToBase64url(x),
    y: uint8ArrayToBase64url(y),
    d: uint8ArrayToBase64url(privateKeyBytes),
    use: 'sig',
    alg: 'ES256'
  };
  
  // Import private key
  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  
  // Create JWT header and payload
  const header = {
    typ: 'JWT',
    alg: 'ES256'
  };
  
  const payload = {
    aud,
    exp: Math.floor(Date.now() / 1000) + (12 * 3600), // 12 hours
    sub
  };
  
  // Encode header and payload
  const encodedHeader = uint8ArrayToBase64url(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = uint8ArrayToBase64url(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  
  // Sign the token
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );
  
  // Convert DER signature to JOSE format
  const joseSignature = derToJose(new Uint8Array(signature));
  const encodedSignature = uint8ArrayToBase64url(joseSignature);
  
  const jwt = `${unsignedToken}.${encodedSignature}`;
  
  console.log('🎯 VAPID JWT generated successfully');
  return jwt;
}