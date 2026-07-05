import { Link } from 'react-router-dom';
import { Blog } from '../../types';

export default function BlogCard({ blog }: { blog: Blog }) {
  const publishedDate = blog.published_at 
    ? new Date(blog.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown date';

  return (
    <div className="bg-white border border-[#E8E4DE] rounded-[24px] overflow-hidden group hover:border-[#0F3D2E]/20 transition-all duration-300">
      <Link to={`/blog/${blog.slug}`} className="block relative overflow-hidden aspect-[16/9]">
        {blog.cover_image_url ? (
          <img 
            src={blog.cover_image_url} 
            alt={blog.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
        {blog.category && (
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F3D2E] rounded-full">
            {blog.category}
          </span>
        )}
      </Link>
      
      <div className="p-6">
        <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3">
          <span>{blog.author_name || 'Admin'}</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span>{publishedDate}</span>
        </div>
        
        <Link to={`/blog/${blog.slug}`}>
          <h3 className="text-lg font-serif text-[#0F3D2E] font-medium leading-tight mb-3 group-hover:text-green-700 transition-colors">
            {blog.title}
          </h3>
        </Link>
        
        <p className="text-gray-500 text-sm font-light mb-6 line-clamp-2">
          {blog.excerpt || 'Read this article to learn more...'}
        </p>
        
        <Link to={`/blog/${blog.slug}`} className="text-xs font-bold uppercase tracking-widest text-[#0F3D2E] hover:text-green-700 transition-colors underline-offset-4 hover:underline">
          Read More
        </Link>
      </div>
    </div>
  );
}
