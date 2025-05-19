import type { Request } from 'express';

export interface AuthRequest extends Request{
  token: string;
  user: any;
  id?:string
}
