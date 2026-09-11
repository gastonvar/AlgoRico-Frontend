import { CSRF_COOKIE_NAME } from '@/types/domain';

export function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const prefix = `${encodeURIComponent(name)}=`;
  const match = document.cookie.split('; ').find((part) => part.startsWith(prefix));
  if (!match) {
    return undefined;
  }

  return decodeURIComponent(match.slice(prefix.length));
}

export function readCsrfCookie(): string | undefined {
  return readCookie(CSRF_COOKIE_NAME);
}
