import React, { useState, useEffect } from 'react';
import { User, PostEntry, ViewState } from './types';
import { Login } from './components/Login';
import { PostForm } from './components/PostForm';
import { PostList } from './components/PostList';
import { Button } from './components/Button';
import { savePostToBackend, getPostsFromBackend, deletePostFromBackend } from './services/socialLogService';

const STORAGE_KEY_POSTS = 'sociallog_posts';
const STORAGE_KEY_USER = 'sociallog_user';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [viewState, setViewState] = useState<ViewState>(ViewState.LOGIN);
  const [posts, setPosts] = useState<PostEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize
  useEffect(() => {
    const initializeApp = async () => {
      // Load posts from local storage first
      const savedPosts = localStorage.getItem(STORAGE_KEY_POSTS);
      if (savedPosts) {
        try {
          setPosts(JSON.parse(savedPosts));
        } catch (e) {
          console.error("Failed to parse posts");
        }
      }

      // Check login session
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setUser(user);
        setViewState(ViewState.FORM);
        
        // Load posts from backend when user is logged in
        await loadPostsFromBackend(user.email);
      }
    };

    initializeApp();
  }, []);

  const handleLogin = async (newUser: User) => {
    console.log('[App] handleLogin - newUser:', newUser);
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    console.log('[App] Saved to localStorage:', JSON.parse(localStorage.getItem(STORAGE_KEY_USER) || '{}'));
    setViewState(ViewState.FORM);
    
    // Load posts from backend
    await loadPostsFromBackend(newUser.email);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    setViewState(ViewState.LOGIN);
  };

  const loadPostsFromBackend = async (email: string) => {
    setIsLoading(true);
    try {
      const backendPosts = await getPostsFromBackend(email);
      setPosts(backendPosts);
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(backendPosts));
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePost = async (post: PostEntry) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Save to backend
      const result = await savePostToBackend(post, user.email, user.employeeCode);
      
      if (result.success) {
        // Update local state
        const updatedPosts = [post, ...posts];
        setPosts(updatedPosts);
        localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updatedPosts));
        setViewState(ViewState.LIST); // Switch to list view to show success
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.message || 'ไม่สามารถบันทึกข้อมูลได้'}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!user) return;
    
    if (confirm("คุณต้องการลบข้อมูลนี้ใช่หรือไม่?")) {
      setIsLoading(true);
      try {
        // Delete from backend
        const result = await deletePostFromBackend(id, user.email);
        
        if (result.success) {
          // Update local state
          const updatedPosts = posts.filter(p => p.id !== id);
          setPosts(updatedPosts);
          localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updatedPosts));
          alert('ลบข้อมูลสำเร็จ!');
        } else {
          alert(`เกิดข้อผิดพลาด: ${result.message || 'ไม่สามารถลบข้อมูลได้'}`);
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (viewState === ViewState.LOGIN || !user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600 rounded-lg p-1.5">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
             </div>
             <span className="font-bold text-xl text-slate-800 tracking-tight">SocialLog AI</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center text-right">
               <div className="mr-3">
                 <p className="text-sm font-medium text-slate-700">{user.name}</p>
                 <p className="text-xs text-slate-500">{user.email}</p>
               </div>
               {user.avatarUrl ? (
                 <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 rounded-full border border-slate-200" />
               ) : (
                 <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                   {user.name.charAt(0)}
                 </div>
               )}
             </div>
             
             {/* Mobile Avatar only */}
             <div className="md:hidden">
               {user.avatarUrl ? (
                 <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full" />
               ) : (
                 <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                   {user.name.charAt(0)}
                 </div>
               )}
             </div>

             <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
             <Button variant="secondary" onClick={handleLogout} className="text-sm px-3 py-1.5">
               ออกจากระบบ
             </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-slate-700 font-medium">กำลังดำเนินการ...</span>
            </div>
          </div>
        )}
        
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
          <button 
            onClick={() => setViewState(ViewState.FORM)}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              viewState === ViewState.FORM 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            บันทึกข้อมูล
          </button>
          <button 
            onClick={() => setViewState(ViewState.LIST)}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              viewState === ViewState.LIST 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            รายการข้อมูล ({posts.length})
          </button>
        </div>

        {/* Content View */}
        <div className="animate-fade-in">
          {viewState === ViewState.FORM ? (
            <div className="max-w-3xl mx-auto">
              <PostForm onSave={handleSavePost} isSubmitting={isLoading} />
            </div>
          ) : (
            <PostList posts={posts} onDelete={handleDeletePost} />
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
         <div className="max-w-7xl mx-auto px-4 py-6 text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} SocialLog AI. Internal use only.
         </div>
      </footer>
    </div>
  );
};

export default App;