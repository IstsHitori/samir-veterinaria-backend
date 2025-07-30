export function generateNumericToken(length: number = 6): string {
  let token = '';
  for (let i = 0; i < length; i++) {
    token += Math.floor(Math.random() * 10).toString();
  }
  return token;
}
