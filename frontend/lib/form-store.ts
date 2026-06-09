import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FormCacheState {
  postId: string | null;
  title: string;
  category: string;
  coverImage: string;
  excerpt: string;
  keywords: string;
  content: string;
  activeBlocks: string[];
  setCache: (data: Partial<FormCacheState>) => void;
  clearCache: () => void;
}

export const useFormCacheStore = create<FormCacheState>()(
  persist(
    (set) => ({
      postId: null,
      title: '',
      category: '',
      coverImage: '',
      excerpt: '',
      keywords: '',
      content: '',
      activeBlocks: [],
      setCache: (data) => set((state) => ({ ...state, ...data })),
      clearCache: () => set({
        postId: null,
        title: '',
        category: '',
        coverImage: '',
        excerpt: '',
        keywords: '',
        content: '',
        activeBlocks: [],
      }),
    }),
    {
      name: 'devlog-editor-form-cache', // key name in localStorage
    }
  )
);
