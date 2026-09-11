export function instagramUrl(username: string): string {
  return `https://instagram.com/${username.replace(/^@/, '')}`;
}
