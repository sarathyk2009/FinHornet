import React, { useState } from 'react';
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  Search,
  Sparkles,
  ArrowRight,
  User,
  Share2,
} from 'lucide-react';
import { BlogPost } from '../services/blogService';

interface Props {
  blogs: BlogPost[];
  isDark: boolean;
  onOpenTalkToUs: () => void;
  onTryExam: () => void;
}

export const BlogsView: React.FC<Props> = ({
  blogs,
  isDark,
  onOpenTalkToUs,
  onTryExam,
}) => {
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Cost Management', 'Exam Strategy', 'Internal Controls', 'Planning & Budgeting'];

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
    return matchesSearch && matchesCategory && b.isPublished;
  });

  // If a blog is selected, render full readable blog post
  if (selectedBlog) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20 w-full max-w-full box-border">
        {/* Back Button */}
        <button
          onClick={() => setSelectedBlog(null)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Articles</span>
        </button>

        {/* Article Header Card */}
        <div
          className="p-6 sm:p-10 rounded-3xl border shadow-sm space-y-4"
          style={{
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
              {selectedBlog.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{selectedBlog.readTime}</span>
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>{selectedBlog.publishedAt}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            {selectedBlog.title}
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            {selectedBlog.excerpt}
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>{selectedBlog.author}</span>
            </span>
            <div className="flex items-center gap-1.5">
              {selectedBlog.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 font-mono"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Article Content Body */}
        <div
          className="p-6 sm:p-10 rounded-3xl border shadow-sm space-y-6 text-sm sm:text-base leading-relaxed"
          style={{
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
        >
          <div className="prose dark:prose-invert max-w-none space-y-4">
            {selectedBlog.content.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-2">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('#### ')) {
                return (
                  <h4 key={idx} className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-4 mb-2">
                    {paragraph.replace('#### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('* ')) {
                return (
                  <ul key={idx} className="list-disc pl-5 space-y-1.5 my-2 text-slate-700 dark:text-slate-300">
                    {paragraph.split('\n* ').map((item, itemIdx) => (
                      <li key={itemIdx}>{item.replace(/^\* /, '')}</li>
                    ))}
                  </ul>
                );
              }
              if (paragraph.startsWith('$$')) {
                return (
                  <div
                    key={idx}
                    className="p-4 my-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 font-mono text-xs sm:text-sm text-center font-bold"
                  >
                    {paragraph.replace(/\$\$/g, '')}
                  </div>
                );
              }
              return (
                <p key={idx} className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Exam Practice Callout inside article */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/30 space-y-3 mt-8">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Test This Concept in Real Prometric Format</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Experience authentic questions on {selectedBlog.title} inside FinHornet's Prometric CBT Simulator with instant step-by-step math derivations.
            </p>
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={onTryExam}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Launch Practice Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onOpenTalkToUs}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Request Study Plan Call
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 w-full max-w-full box-border">
      {/* Header Banner */}
      <div
        className="p-6 sm:p-10 rounded-3xl border shadow-sm space-y-4 text-center max-w-4xl mx-auto"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 inline-flex items-center gap-1.5 shadow-2xs">
          <BookOpen className="w-3.5 h-3.5" />
          <span>FinHornet CMA Knowledge Base</span>
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          CMA Part 1 Study Guides & Exam Insights
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Deep-dives into high-frequency exam topics: Absorption vs. Variable costing, 4-variance overhead decompositions, Prometric pacing, and COSO internal controls.
        </p>

        {/* Search Bar & Category Filters */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search topics, formulas, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-slate-950 shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {cat === 'all' ? 'All Guides' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {filteredBlogs.map((blog) => (
          <article
            key={blog.id}
            onClick={() => setSelectedBlog(blog)}
            className="p-6 rounded-3xl border shadow-sm space-y-4 transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col justify-between"
            style={{
              backgroundColor: isDark ? '#0b1120' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  {blog.category}
                </span>
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{blog.readTime}</span>
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-amber-500 transition-colors">
                {blog.title}
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                {blog.excerpt}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] font-mono">{blog.publishedAt}</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span>Read Full Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
