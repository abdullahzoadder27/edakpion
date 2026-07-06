import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBlogBySlug } from '../lib/api';
import { Blog } from '../types';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      getBlogBySlug(slug).then(data => {
        if (!data) {
          navigate('/blog');
        } else {
          setBlog(data);
        }
        setLoading(false);
      });
    }
  }, [slug, navigate]);

  if (loading) {
    return <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">Loading article...</div>;
  }

  if (!blog) return null;

  const publishedDate = blog.published_at 
    ? new Date(blog.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Unknown date';

  return (
    <div className="bg-[#F5F2ED] min-h-screen pb-20">
      {blog.cover_image_url && (
        <div className="w-full h-[400px] md:h-[600px] relative">
          <img loading="lazy" decoding="async" src={blog.cover_image_url} alt={blog.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      )}
      
      <div className={`max-w-3xl mx-auto px-6 ${blog.cover_image_url ? '-mt-32 relative z-10' : 'pt-20'}`}>
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl border border-[#E8E4DE]">
          <Link to="/blog" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#0F3D2E] mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journal
          </Link>
          
          {blog.category && (
            <span className="inline-block px-4 py-1.5 bg-[#F5F2ED] text-[#0F3D2E] text-xs font-bold uppercase tracking-wider rounded-full mb-6">
              {blog.category}
            </span>
          )}
          
          <h1 className="text-3xl md:text-5xl font-serif text-[#0F3D2E] leading-tight mb-8">
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-10 pb-10 border-b border-[#E8E4DE]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{blog.author_name || 'Admin'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{publishedDate}</span>
            </div>
          </div>
          
          <div className="prose prose-lg prose-green max-w-none prose-headings:font-serif prose-headings:text-[#0F3D2E] prose-a:text-[#0F3D2E]">
            <Markdown remarkPlugins={[remarkGfm]}>{blog.content}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}
