import React, { useState, useEffect } from 'react';
import { PostEntry } from '../types';
import { fetchDriveImageAsBase64 } from '../services/socialLogService';

interface PostListProps {
  posts: PostEntry[];
  onDelete: (id: string) => void;
  currentUserEmail: string;
  loadedImages: Map<string, string>; // รับจาก parent
  setLoadedImages: React.Dispatch<React.SetStateAction<Map<string, string>>>; // รับจาก parent
}

export const PostList: React.FC<PostListProps> = ({ 
  posts, 
  onDelete, 
  currentUserEmail, 
  loadedImages, 
  setLoadedImages 
}) => {
  const [selectedPost, setSelectedPost] = useState<PostEntry | null>(null);

  // กรองเฉพาะโพสต์ของ user ที่ login
  const userPosts = posts.filter(post => post.createdByEmail === currentUserEmail);

  // โหลดรูปภาพเฉพาะของ user ที่ login
  useEffect(() => {
    const loadImages = async () => {
      const newImages = new Map<string, string>();
      
      for (const post of userPosts) {
        // ข้ามถ้าโหลดไว้แล้ว
        if (post.imageFileId && !loadedImages.has(post.id)) {
          try {
            const imageData = await fetchDriveImageAsBase64(post.imageFileId);
            if (imageData) {
              newImages.set(post.id, imageData);
            }
          } catch (error) {
            console.error(`Failed to load image for post ${post.id}:`, error);
          }
        }
      }
      
      if (newImages.size > 0) {
        setLoadedImages(prev => new Map([...prev, ...newImages]));
      }
    };

    if (userPosts.length > 0) {
      loadImages();
    }
  }, [posts, currentUserEmail]); // ลบ userPosts ออก ใช้ posts แทน

  if (userPosts.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900">ยังไม่มีข้อมูล</h3>
        <p className="text-slate-500 mt-1">เริ่มบันทึกโพสต์แรกของคุณเลย</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800 flex items-center">
        <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        ประวัติการโพสต์ ({userPosts.length})
      </h2>
      
      {/* Table View */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  รูปภาพ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  วันที่
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  ประเภท
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  คำบรรยาย
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  แท็ก
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {userPosts.map((post) => (
                <tr 
                  key={post.id} 
                  onClick={() => setSelectedPost(post)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      {loadedImages.get(post.id) ? (
                        <img 
                          src={loadedImages.get(post.id)} 
                          alt="Post thumbnail" 
                          className="w-full h-full object-cover" 
                        />
                      ) : post.imageFileId ? (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {new Date(post.timestamp).toLocaleDateString('th-TH', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(post.timestamp).toLocaleTimeString('th-TH', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {post.postType && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {post.postType}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 line-clamp-2 max-w-md">
                      {post.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {post.tags && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.split(' ').slice(0, 2).map((tag, idx) => (
                          tag.trim() && (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                              #{tag.replace('#', '')}
                            </span>
                          )
                        ))}
                        {post.tags.split(' ').filter(t => t.trim()).length > 2 && (
                          <span className="text-xs text-slate-400">+{post.tags.split(' ').filter(t => t.trim()).length - 2}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('คุณต้องการลบโพสต์นี้หรือไม่?')) {
                          onDelete(post.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ลบข้อมูล
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Post Details */}
      {selectedPost && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">รายละเอียดโพสต์</h3>
              <button 
                onClick={() => setSelectedPost(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Image */}
              {loadedImages.get(selectedPost.id) && (
                <div className="rounded-lg overflow-hidden bg-slate-100">
                  <img 
                    src={loadedImages.get(selectedPost.id)} 
                    alt="Post content" 
                    className="w-full h-auto max-h-96 object-contain mx-auto" 
                  />
                </div>
              )}

              {/* Date */}
              <div>
                <div className="text-xs font-medium text-slate-500 mb-1">วันที่และเวลา</div>
                <div className="text-sm text-slate-900">
                  {new Date(selectedPost.timestamp).toLocaleDateString('th-TH', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>

              {/* Post Type */}
              {selectedPost.postType && (
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-1">ประเภทงานโพสต์</div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {selectedPost.postType}
                  </span>
                </div>
              )}

              {/* Post URL */}
              {selectedPost.postUrl && (
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-1">ลิงก์โพสต์</div>
                  <a 
                    href={selectedPost.postUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                  >
                    {selectedPost.postUrl}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Description */}
              <div>
                <div className="text-xs font-medium text-slate-500 mb-1">คำบรรยาย</div>
                <p className="text-sm text-slate-900 whitespace-pre-wrap">
                  {selectedPost.description}
                </p>
              </div>

              {/* Tags */}
              {selectedPost.tags && (
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-2">แท็ก</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.split(' ').map((tag, idx) => (
                      tag.trim() && (
                        <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700">
                          #{tag.replace('#', '')}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                ปิด
              </button>
              <button
                onClick={() => {
                  if (confirm('คุณต้องการลบโพสต์นี้หรือไม่?')) {
                    onDelete(selectedPost.id);
                    setSelectedPost(null);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                ลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};