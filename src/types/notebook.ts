export type Notebook = {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  icon: string;
  color: string;
  createdAt: number;
  updatedAt: number;
  noteCount: number;
};
