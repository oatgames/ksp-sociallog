import React, { useState, useRef, useEffect } from 'react';
import { PostEntry, PostType } from '../types';
import { Button } from './Button';
import { getPostTypes } from '../services/socialLogService';

interface PostFormProps {
  onSave: (post: PostEntry) => Promise<void>;
  isSubmitting?: boolean;
}

export const PostForm: React.FC<PostFormProps> = ({ onSave, isSubmitting = false }) => {
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [postType, setPostType] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [postTypes, setPostTypes] = useState<PostType[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch post types on mount
  useEffect(() => {
    const fetchTypes = async () => {
      const types = await getPostTypes();
      setPostTypes(types);
    };
    fetchTypes();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
      alert("กรุณากรอกรายละเอียดโพสต์");
      return;
    }

    const newPost: PostEntry = {
      id: Date.now().toString(),
      imageData,
      description,
      tags,
      postType,
      postUrl,
      timestamp: Date.now(),
    };

    try {
      await onSave(newPost);
      
      // Show success state
      setSaveSuccess(true);
      
      // Reset form after short delay
      setTimeout(() => {
        setPostType('');
        setPostUrl('');
        setDescription('');
        setTags('');
        setImageData(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setSaveSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        บันทึกข้อมูลโพสต์ใหม่
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Image Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            1. รูปภาพประกอบ (ถ้ามี)
          </label>
          <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors ${imageData ? 'border-indigo-300 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-slate-50'}`}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="hidden" 
              ref={fileInputRef}
            />
            
            {!imageData ? (
              <div className="text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-slate-600 justify-center mt-2">
                  <span className="relative rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    อัปโหลดไฟล์
                  </span>
                  <p className="pl-1">หรือลากวางที่นี่</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 5MB</p>
              </div>
            ) : (
              <div className="relative w-full max-w-sm">
                 <img src={imageData} alt="Preview" className="w-full h-auto rounded-lg shadow-md" />
                 <button 
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 focus:outline-none"
                 >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Post Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            2. ประเภทงานโพสต์
          </label>
          <div className="relative">
            <select
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none bg-white"
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
            >
              <option value="">เลือกประเภทงาน</option>
              {postTypes.map((type) => (
                <option key={type.type_id} value={type.type_name}>
                  {type.type_name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* 3. Post URL */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            3. ลิงก์โพสต์
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <input
              type="url"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="https://example.com/post/123"
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
            />
          </div>
        </div>

        {/* 4. Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            4. รายละเอียดโพสต์
          </label>
          <textarea
            rows={5}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="เขียนแคปชั่นของคุณที่นี่..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* 5. SEO / Hashtags */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            5. SEO หรือ แฮชแท็ก
          </label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <span className="text-slate-400">#</span>
             </div>
             <input
              type="text"
              className="w-full pl-8 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="เช่น blog, fb, review, thailand (คั่นด้วยช่องว่าง)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button 
            type="submit" 
            className="w-full sm:w-auto min-w-[150px] relative"
            disabled={isSubmitting || saveSuccess}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังบันทึก...
              </>
            ) : saveSuccess ? (
              <>
                <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                บันทึกสำเร็จ!
              </>
            ) : (
              'บันทึกข้อมูล'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};