/**
 * Backend API column names and constants
 * Must match with backend CFG.HEADERS.POSTS configuration
 */

// Backend column names (matches backend CFG.HEADERS.POSTS)
export const BACKEND_COLUMNS = {
  POST_ID: 'post_id',
  CREATED_AT: 'created_at',
  CREATED_BY: 'created_by',
  CREATED_BY_EMAIL: 'created_by_email',
  CAPTION: 'caption',
  TAGS: 'tags',
  IMAGE_FILE_ID: 'image_file_id',
  IMAGE_URL: 'image_url',
  STATUS: 'status',
  UPDATED_AT: 'updated_at',
} as const;

// Backend API actions
export const BACKEND_ACTIONS = {
  CREATE_POST: 'create_post',
  LIST_POSTS: 'list_posts',
  GET_POST: 'get_post',
  DELETE_POST: 'delete_post',
} as const;

// Backend post status values
export const POST_STATUS = {
  ACTIVE: 'ACTIVE',
  DELETED: 'DELETED',
} as const;

// Backend request field names
export const REQUEST_FIELDS = {
  ACTION: 'action',
  TOKEN: 'token',
  EMPLOYEE_CODE: 'employee_code',
  EMPLOYEE_EMAIL: 'employee_email',
  CAPTION: 'caption',
  TAGS: 'tags',
  IMAGE_BASE64: 'image_base64',
  IMAGE_NAME: 'image_name',
  IMAGE_MIME: 'image_mime',
  POST_ID: 'post_id',
} as const;

// Backend response structure
export interface BackendPost {
  [BACKEND_COLUMNS.POST_ID]: string;
  [BACKEND_COLUMNS.CREATED_AT]: string;
  [BACKEND_COLUMNS.CREATED_BY]: string;
  [BACKEND_COLUMNS.CREATED_BY_EMAIL]: string;
  [BACKEND_COLUMNS.CAPTION]: string;
  [BACKEND_COLUMNS.TAGS]: string;
  [BACKEND_COLUMNS.IMAGE_FILE_ID]: string;
  [BACKEND_COLUMNS.IMAGE_URL]: string;
  [BACKEND_COLUMNS.STATUS]: string;
  [BACKEND_COLUMNS.UPDATED_AT]: string;
}

export interface BackendResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
}
