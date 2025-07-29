export const ENCRYPTION_SERVICE = Symbol('ENCRYPTION_SERVICE');

export interface EncryptionService {
  hash(password: string): Promise<string>;
  compare(password: string, hashedPassword: string): Promise<boolean>;
}
