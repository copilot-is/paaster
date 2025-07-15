export interface Content {
  id: string;
  text?: string;
  title?: string;
  format: string;
  attachment?: {
    data: string;
    name: string;
    size: number;
  };
  expires: string;
  burnAfterRead: boolean;
  hasPassword: boolean;
  createdAt: string;
  expiresAt?: string;
}
