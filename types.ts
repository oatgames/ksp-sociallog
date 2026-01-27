export interface PostEntry {
  id: string;
  imageData: string | null; // Base64 string
  description: string;
  tags: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  employeeCode?: string;
}

export enum ViewState {
  LOGIN,
  FORM,
  LIST
}