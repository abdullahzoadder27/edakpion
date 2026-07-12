import React from 'react';

interface SeoImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  title: string; // The product or blog title to base the alt text on
}

export default function SeoImage({ src, title, className = '', ...props }: SeoImageProps) {
  // Automatically generates a descriptive, SEO-friendly alt tag for the Streetwear niche
  const altText = `${title} - Premium Streetwear Bangladesh | Edakpion`;
  
  return (
    <img 
      src={src} 
      alt={altText} 
      className={className}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}
