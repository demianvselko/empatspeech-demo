import crypto from 'node:crypto';

export function emailToUserId(email: string): string {
  const normalized = email.trim().toLowerCase();

  const hashHex = crypto.createHash('sha256').update(normalized).digest('hex');

  const bytes = Buffer.from(hashHex.slice(0, 32), 'hex');

  bytes[6] = (bytes[6] & 0x0f) | 0x40;

  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString('hex');

  const uuid = [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');

  return uuid;
}
