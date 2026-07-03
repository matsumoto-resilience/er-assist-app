// アクセスパスワードのハッシュ化・検証。
// Node.js / Edge Runtime の両方で動作するよう、Web標準の crypto.subtle (PBKDF2) のみを使用する
// (Bufferやbcrypt等のネイティブ依存を避け、Next.js Proxy(Edge Runtime)でも確実に動くようにするため)。
//
// NOTE: 区切り文字には "." を使用する("$" は使わない)。
// Next.jsの環境変数ローダーは .env 内の "$VARNAME" 形式を変数展開として解釈するため、
// ハッシュ文字列に "$" が含まれていると値が壊れて読み込まれてしまう。

const ALGORITHM = "PBKDF2";
const HASH = "SHA-256";
const ITERATIONS = 210_000; // OWASP推奨のPBKDF2-HMAC-SHA256反復回数の目安
const SALT_BYTES = 16;
const KEY_LENGTH_BITS = 256;
const FORMAT_PREFIX = "pbkdf2";

function bytesToBase64(bytes: Uint8Array<ArrayBuffer>): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveBits(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number
): Promise<Uint8Array<ArrayBuffer>> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    ALGORITHM,
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: ALGORITHM, salt, iterations, hash: HASH },
    keyMaterial,
    KEY_LENGTH_BITS
  );
  return new Uint8Array(bits);
}

function constantTimeEqual(
  a: Uint8Array<ArrayBuffer>,
  b: Uint8Array<ArrayBuffer>
): boolean {
  const maxLength = Math.max(a.length, b.length, 1);
  let diff = a.length === b.length ? 0 : 1;
  for (let i = 0; i < maxLength; i++) {
    const byteA = i < a.length ? a[i] : 0;
    const byteB = i < b.length ? b[i] : 0;
    diff |= byteA ^ byteB;
  }
  return diff === 0;
}

// 形式: pbkdf2.<反復回数>.<salt(base64)>.<hash(base64)>
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const derived = await deriveBits(password, salt, ITERATIONS);
  return [
    FORMAT_PREFIX,
    ITERATIONS,
    bytesToBase64(salt),
    bytesToBase64(derived),
  ].join(".");
}

export function constantTimeStringEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  return constantTimeEqual(encoder.encode(a), encoder.encode(b));
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const parts = stored.trim().split(".");
  if (parts.length !== 4 || parts[0] !== FORMAT_PREFIX) return false;

  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations <= 0) return false;

  try {
    const salt = base64ToBytes(parts[2]);
    const expected = base64ToBytes(parts[3]);
    const actual = await deriveBits(password, salt, iterations);
    return constantTimeEqual(actual, expected);
  } catch {
    return false;
  }
}
