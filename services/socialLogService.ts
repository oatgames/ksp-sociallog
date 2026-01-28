import { PostEntry, PostType } from '../types';
import { 
  BACKEND_ACTIONS, 
  BACKEND_COLUMNS, 
  REQUEST_FIELDS, 
  POST_STATUS,
  BackendPost,
  BackendResponse 
} from '../constants';

const API_URL = import.meta.env.VITE_SOCIALLOG_URL;
const API_TOKEN = import.meta.env.VITE_SOCIALLOG_API_TOKEN;
const AUTH_API_URL = import.meta.env.VITE_API_BASE_URL;
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN;

// Helper to fetch image from Drive via Backend proxy and convert to base64
export async function fetchDriveImageAsBase64(fileId: string): Promise<string | null> {
  if (!fileId || !API_URL || !API_TOKEN) return null;
  
  try {
    // Call Backend proxy to get image as base64
    // Backend expects: ?action=get_image&file_id=xxx (no token required for get_image)
    const proxyUrl = `${API_URL}?action=get_image&file_id=${encodeURIComponent(fileId)}`;
    const response = await fetch(proxyUrl, { method: 'GET' });
    
    if (!response.ok) return null;
    
    const result = await response.json();
    if (result.ok && result.data) {
      // result.data is base64 string, result.contentType is mime type
      return `data:${result.contentType || 'image/jpeg'};base64,${result.data}`;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch Drive image:', error);
    return null;
  }
}

// Interface for employee data
export interface EmployeeData {
  EmployeeCode: string;
  Nickname?: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
}

// In-memory cache for post types to avoid refetching on remounts
let cachedPostTypes: PostType[] | null = null;

// ดึงข้อมูลพนักงานทั้งหมดจาก Backend
export const getAllEmployees = async (): Promise<Map<string, string>> => {
  const employeeMap = new Map<string, string>();
  
  if (!AUTH_API_URL || !AUTH_TOKEN) {
    console.error('Auth API URL or Token not configured');
    return employeeMap;
  }

  try {
    const url = `${AUTH_API_URL}?token=${encodeURIComponent(AUTH_TOKEN)}&action=list_employees`;
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.ok && Array.isArray(result.employees)) {
      result.employees.forEach((emp: EmployeeData) => {
        if (emp.EmployeeCode && emp.Nickname) {
          employeeMap.set(emp.EmployeeCode, emp.Nickname);
        }
      });
    }
    
    return employeeMap;
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return employeeMap;
  }
};

// Helper to convert proxy URL to data URI
async function fetchImageAsDataUri(proxyUrl: string): Promise<string | null> {
  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) return null;
    
    const result = await response.json() as { ok: boolean; data: string; contentType: string };
    if (!result.ok || !result.data) return null;
    
    return `data:${result.contentType};base64,${result.data}`;
  } catch (error) {
    console.error('Failed to fetch image:', error);
    return null;
  }
}

export interface SavePostResponse {
  success: boolean;
  message?: string;
  postId?: string;
}

export const savePostToBackend = async (post: PostEntry, userEmail: string, employeeCode?: string): Promise<SavePostResponse> => {
  if (!API_URL || !API_TOKEN) {
    console.error('API URL or Token not configured');
    return {
      success: false,
      message: 'ไม่พบการตั้งค่า API'
    };
  }

  try {
    // Extract image data and metadata
    let imageBase64 = '';
    let imageMime = 'image/png';
    let imageName = `${post.id}.png`;
    
    if (post.imageData) {
      // Remove data URL prefix if present
      const matches = post.imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        imageMime = matches[1];
        imageBase64 = matches[2];
        const ext = imageMime.split('/')[1] || 'png';
        imageName = `${post.id}.${ext}`;
      } else {
        imageBase64 = post.imageData;
      }
    }

    // Prepare data object with action field
    const data = {
      [REQUEST_FIELDS.ACTION]: BACKEND_ACTIONS.CREATE_POST,
      [REQUEST_FIELDS.TOKEN]: API_TOKEN,
      [REQUEST_FIELDS.EMPLOYEE_EMAIL]: userEmail,
      [REQUEST_FIELDS.CAPTION]: post.description,
      [REQUEST_FIELDS.TAGS]: post.tags,
      [REQUEST_FIELDS.POST_TYPE]: post.postType || '',
      [REQUEST_FIELDS.POST_URL]: post.postUrl || '',
      [REQUEST_FIELDS.IMAGE_BASE64]: imageBase64,
      [REQUEST_FIELDS.IMAGE_NAME]: imageName,
      [REQUEST_FIELDS.IMAGE_MIME]: imageMime,
      ...(employeeCode ? { [REQUEST_FIELDS.EMPLOYEE_CODE]: employeeCode } : {}),
    };

    // Use POST with text/plain to avoid CORS preflight
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: BackendResponse<{ post_id: string; image_url: string }> = await response.json();
    
    // Backend returns { ok: true, data: { post_id, image_url } }
    if (result.ok) {
      return {
        success: true,
        postId: result.data?.post_id,
        message: 'บันทึกสำเร็จ'
      };
    } else {
      return {
        success: false,
        message: result.error || 'เกิดข้อผิดพลาด'
      };
    }

  } catch (error) {
    console.error('Failed to save post to backend:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
    };
  }
};

export const getPostsFromBackend = async (userEmail: string): Promise<PostEntry[]> => {
  if (!API_URL || !API_TOKEN) {
    console.error('API URL or Token not configured');
    return [];
  }

  try {
    // Use GET with URL params - no preflight required for simple GET requests
    const url = `${API_URL}?${REQUEST_FIELDS.ACTION}=${BACKEND_ACTIONS.LIST_POSTS}&${REQUEST_FIELDS.TOKEN}=${encodeURIComponent(API_TOKEN)}`;
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: BackendResponse<BackendPost[]> = await response.json();
    
    // Backend returns { ok: true, data: [{ post_id, created_at, created_by, created_by_email, caption, tags, post_type, post_url, image_file_id, image_url, ... }] }
    if (result.ok && Array.isArray(result.data)) {
      // Map backend format to PostEntry format - get ALL posts (not filtered by email)
      // ไม่โหลดรูปทันที เก็บ fileId ไว้ให้ component โหลดเองตามต้องการ
      const posts = result.data
        .filter((item) => item[BACKEND_COLUMNS.STATUS] !== POST_STATUS.DELETED)
        .map((item) => {
          const fileId = item[BACKEND_COLUMNS.IMAGE_FILE_ID] || null;
          
          return {
            id: item[BACKEND_COLUMNS.POST_ID],
            imageData: null, // ไม่โหลดรูปทันที
            imageFileId: fileId, // เก็บ file ID ไว้สำหรับ lazy loading
            description: item[BACKEND_COLUMNS.CAPTION] || '',
            tags: item[BACKEND_COLUMNS.TAGS] || '',
            postType: item[BACKEND_COLUMNS.POST_TYPE] || '',
            postUrl: item[BACKEND_COLUMNS.POST_URL] || '',
            timestamp: new Date(item[BACKEND_COLUMNS.CREATED_AT]).getTime(),
            createdBy: item[BACKEND_COLUMNS.CREATED_BY],
            createdByEmail: item[BACKEND_COLUMNS.CREATED_BY_EMAIL],
          };
        });
      return posts;
    }
    return [];

  } catch (error) {
    console.error('Failed to fetch posts from backend:', error);
    return [];
  }
};

export const deletePostFromBackend = async (postId: string, userEmail: string): Promise<SavePostResponse> => {
  if (!API_URL || !API_TOKEN) {
    console.error('API URL or Token not configured');
    return {
      success: false,
      message: 'ไม่พบการตั้งค่า API'
    };
  }

  try {
    // Prepare data object with action field
    const data = {
      [REQUEST_FIELDS.ACTION]: BACKEND_ACTIONS.DELETE_POST,
      [REQUEST_FIELDS.TOKEN]: API_TOKEN,
      [REQUEST_FIELDS.EMPLOYEE_EMAIL]: userEmail,
      [REQUEST_FIELDS.POST_ID]: postId
    };

    // Use POST with text/plain to avoid CORS preflight
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: BackendResponse<{ post_id: string; deleted: boolean }> = await response.json();
    
    // Backend returns { ok: true, data: { post_id, deleted: true } }
    if (result.ok) {
      return {
        success: true,
        message: 'ลบสำเร็จ'
      };
    } else {
      return {
        success: false,
        message: result.error || 'เกิดข้อผิดพลาด'
      };
    }

  } catch (error) {
    console.error('Failed to delete post from backend:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบข้อมูล'
    };
  }
};

// Fetch post types from Backend
export const getPostTypes = async (): Promise<PostType[]> => {
  // Return cached copy if available
  if (cachedPostTypes) return cachedPostTypes;

  if (!API_URL || !API_TOKEN) {
    console.error('API URL or Token not configured');
    return [];
  }

  try {
    const url = `${API_URL}?action=list_post_types&token=${encodeURIComponent(API_TOKEN)}`;
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.ok && Array.isArray(result.data)) {
      cachedPostTypes = result.data as PostType[];
      return cachedPostTypes;
    }
    
    return [];
  } catch (error) {
    console.error('Failed to fetch post types:', error);
    return [];
  }
};

export const clearPostTypesCache = () => { cachedPostTypes = null; };
