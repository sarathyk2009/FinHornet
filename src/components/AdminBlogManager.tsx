import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Calendar,
  Clock,
  Eye,
  FileText,
} from 'lucide-react';
import { BlogPost, saveBlogToFirestore, deleteBlogFromFirestore } from '../services/blogService';

interface Props {
  blogs: BlogPost[];
  onRefreshBlogs: () => Promise<void> | void;
  isDark?: boolean;
}

export const AdminBlogManager: React.FC<Props> = ({
  blogs,
  onRefreshBlogs,
  isDark,
}) => {
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<BlogPost['category']>('Cost Management');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('FinHornet Academic Team');
  const [readTime, setReadTime] = useState('5 min read');
  const [tagsInput, setTagsInput] = useState('CMA Part 1, Exam Strategy');
  const [isPublished, setIsPublished] = useState(true);

  const handleStartCreate = () => {
    setEditingBlog(null);
    setTitle('');
    setSlug('');
    setCategory('Cost Management');
    setExcerpt('');
    setContent('');
    setAuthor('FinHornet Academic Team');
    setReadTime('5 min read');
    setTagsInput('CMA Part 1, Exam Strategy');
    setIsPublished(true);
    setIsCreating(true);
  };

  const handleStartEdit = (b: BlogPost) => {
    setEditingBlog(b);
    setTitle(b.title);
    setSlug(b.slug);
    setCategory(b.category);
    setExcerpt(b.excerpt);
    setContent(b.content);
    setAuthor(b.author);
    setReadTime(b.readTime);
    setTagsInput(b.tags.join(', '));
    setIsPublished(b.isPublished);
    setIsCreating(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBusy(true);
    setStatusMessage(null);

    const generatedSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const blogData: BlogPost = {
      id: editingBlog ? editingBlog.id : `blog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      slug: generatedSlug,
      category,
      excerpt: excerpt.trim(),
      content: content.trim(),
      author: author.trim(),
      readTime: readTime.trim(),
      publishedAt: editingBlog ? editingBlog.publishedAt : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      isPublished,
    };

    try {
      await saveBlogToFirestore(blogData);
      await onRefreshBlogs();
      setStatusMessage(`Blog "${blogData.title}" saved successfully!`);
      setIsCreating(false);
      setEditingBlog(null);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error saving blog: ${err.message || 'Unknown error'}`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (id: string, blogTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete the blog post "${blogTitle}"?`)) return;
    setIsBusy(true);
    try {
      await deleteBlogFromFirestore(id);
      await onRefreshBlogs();
      setStatusMessage(`Deleted "${blogTitle}"`);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error deleting blog: ${err.message || 'Unknown error'}`);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div
        className="p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              CMA Study Blogs & Articles Manager
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, edit, and publish high-ranking educational guides directly to Firestore (`blogs` collection).
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="p-1 hover:bg-amber-500/20 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor Modal / Panel */}
      {isCreating && (
        <div
          className="p-6 sm:p-8 rounded-3xl border shadow-md space-y-4 animate-in fade-in"
          style={{
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#cbd5e1',
          }}
        >
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h3>
            <button
              onClick={() => setIsCreating(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mastering Absorption vs. Variable Costing"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL Slug (Auto-generated if blank)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. absorption-vs-variable-costing-cma"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs cursor-pointer"
                >
                  <option value="Cost Management">Cost Management</option>
                  <option value="Exam Strategy">Exam Strategy</option>
                  <option value="Financial Reporting">Financial Reporting</option>
                  <option value="Internal Controls">Internal Controls</option>
                  <option value="Planning & Budgeting">Planning & Budgeting</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Read Time
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="e.g. 6 min read"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Excerpt / Short Summary *
              </label>
              <textarea
                rows={2}
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short 2-sentence teaser explaining the core concept..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Article Content (Markdown format supported) *
              </label>
              <textarea
                rows={10}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Use ### for Headings, #### for Subheadings, * for bullet items, $$ for formulas..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Absorption, Variance, Pacing"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                  <span>Publish Immediately (Visible to Public Visitors)</span>
                </label>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isBusy ? 'Saving...' : 'Save & Publish to Firestore'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Blogs List Table */}
      <div
        className="rounded-3xl border shadow-sm overflow-hidden"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <tr>
                <th className="py-3 px-4">Title & Excerpt</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Published</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {blogs.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4 max-w-md">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      {b.title}
                    </span>
                    <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {b.excerpt}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      {b.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {b.isPublished ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-400">
                    {b.publishedAt}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                    <button
                      onClick={() => handleStartEdit(b)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit article"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id, b.title)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
