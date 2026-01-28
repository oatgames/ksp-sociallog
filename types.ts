export interface PostEntry {
  id: string;
  imageData: string | null; // Base64 string
  imageFileId?: string | null; // Drive file ID for lazy loading
  description: string;
  tags: string;
  postType?: string; // Post type from POST_TYPES sheet
  postUrl?: string; // URL link for the post
  timestamp: number;
  createdBy?: string; // Employee code
  createdByEmail?: string; // Employee email
}

export interface PostType {
  type_id: string;
  type_name: string;
  display_order: number;
  is_active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  employeeCode?: string;
  nickname?: string;
}

export enum ViewState {
  LOGIN,
  FORM,
  LIST,
  DASHBOARD
}