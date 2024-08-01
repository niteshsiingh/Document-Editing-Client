import DocumentUser from './document-user';

interface DocumentInterface {
  ID: number;
  Title: string;
  content: string | null;
  CreatedAt: Date;
  UpdatedAt: Date;
  DeletedAt: Date;
  UserID: number;
  users: Array<DocumentUser>;
  IsPublic: boolean;
}

export default DocumentInterface;