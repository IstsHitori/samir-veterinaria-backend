import { EncryptionService } from '../interfaces/Encryption-service.interface';
import * as bcryptjs from 'bcryptjs';

export class BcryptAdapter implements EncryptionService {
  async hash(password: string): Promise<string> {
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    return hashedPassword;
  }
  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcryptjs.compare(password, hashedPassword);
  }
}
