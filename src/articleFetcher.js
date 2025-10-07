// src/services/articleFetcher.js

// Fetch article metadata from URL
export const fetchArticleMetadata = async (url) => {
  try {
    console.log('📰 Fetching article metadata:', url);
    
    // Use a CORS proxy or your own backend
    const response = await fetch(url);
    const html = await response.text();
    
    // Parse HTML to extract metadata
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract Open Graph tags or meta tags
    const getMetaContent = (property) => {
      const ogTag = doc.querySelector(`meta[property="${property}"]`);
      const nameTag = doc.querySelector(`meta[name="${property}"]`);
      return ogTag?.getAttribute('content') || nameTag?.getAttribute('content') || '';
    };
    
    const title = getMetaContent('og:title') || 
                  getMetaContent('twitter:title') || 
                  doc.querySelector('title')?.textContent ||
                  extractTitleFromUrl(url);
    
    const description = getMetaContent('og:description') || 
                       getMetaContent('description') || 
                       getMetaContent('twitter:description') ||
                       'Read the full article on BoomLive for detailed information.';
    
    const image = getMetaContent('og:image') || 
                  getMetaContent('twitter:image') ||
                  '/default-article-image.jpg';
    
    const author = getMetaContent('author') || 
                   getMetaContent('article:author') ||
                   'BoomLive Team';
    
    const publishedDate = getMetaContent('article:published_time') || 
                          getMetaContent('datePublished') ||
                          new Date().toISOString();
    
    return {
      url,
      title: cleanTitle(title),
      description: cleanDescription(description),
      image,
      author,
      publishedDate: formatDate(publishedDate),
      category: extractCategory(url)
    };
    
  } catch (error) {
    console.error('❌ Error fetching article:', error);
    // Fallback to URL-based extraction
    return {
      url,
      title: extractTitleFromUrl(url),
      description: 'Read the full article on BoomLive for detailed information about this scam.',
      image: null,
      author: 'BoomLive Team',
      publishedDate: 'Recent',
      category: extractCategory(url)
    };
  }
};

// Extract title from URL slug
const extractTitleFromUrl = (url) => {
  try {
    const urlParts = url.split('/');
    const slug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    
    return slug
      .split('-')
      .filter(word => !/^\d+$/.test(word)) // Remove numbers
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  } catch {
    return 'BoomLive Article';
  }
};

// Extract category from URL
const extractCategory = (url) => {
  const categories = ['scamcheck', 'decode', 'fact-check', 'explainers'];
  for (const cat of categories) {
    if (url.includes(cat)) {
      return cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return 'ScamCheck';
};

// Clean title
const cleanTitle = (title) => {
  return title
    .replace(/\|.*$/, '') // Remove site name after |
    .replace(/–.*$/, '') // Remove after –
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150); // Limit length
};

// Clean description
const cleanDescription = (desc) => {
  return desc
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200); // Limit length
};

// Format date
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return 'Recent';
  }
};

// Batch fetch articles
export const fetchMultipleArticles = async (urls) => {
  console.log(`📚 Fetching ${urls.length} articles...`);
  
  const promises = urls.map(url => fetchArticleMetadata(url));
  const results = await Promise.allSettled(promises);
  
  return results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
};
