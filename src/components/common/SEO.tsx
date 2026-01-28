import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'video.movie' | 'video.tv_show';
  keywords?: string[];
  structuredData?: Record<string, unknown>;
}

const SEO: React.FC<SEOProps> = ({ 
  title = 'VidPlay - Watch Movies & TV Shows', 
  description = 'Stream the latest movies and TV shows on VidPlay. Your personal streaming library.',
  image = '/og-image.jpg', // Default image (ensure this exists or use a remote URL)
  url = window.location.href,
  type = 'website',
  keywords = ['movies', 'streaming', 'tv shows', 'watch online', 'vidplay'],
  structuredData
}) => {
  const siteTitle = title === 'VidPlay - Watch Movies & TV Shows' ? title : `${title} | VidPlay`;

  // Manual fallback to ensure title updates
  useEffect(() => {
     document.title = siteTitle;
  }, [siteTitle]);

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
