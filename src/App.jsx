import { useEffect, useState } from 'react'
import Masonry from 'react-masonry-css'
import Papa from 'papaparse'
import { supabase } from './supabaseClient'
import { IoSearch, IoNotifications, IoChatbubbleEllipses, IoPersonCircle, IoChevronDown, IoCopy, IoEye, IoEyeOff, IoImage, IoGlobeOutline } from 'react-icons/io5'
import { translations } from './translations'
import { FaPinterest } from 'react-icons/fa'

function App() {
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [language, setLanguage] = useState('vi')

  const t = translations[language]

  const categories = [
    'All',
    'Profile/Avatar', 'Social Media', 'Infographic', 'YouTube Thumbnail',
    'Comic/Storyboard', 'Product Marketing', 'E-commerce', 'Game Asset',
    'Photography', 'Cinematic', 'Anime/Manga', '3D Render', 'Pixel Art',
    'Cyberpunk', 'Minimalism', 'Portrait', 'Food', 'Nature', 'Architecture'
  ];

  const CATEGORY_FILES = {
    'All': 'featured.csv',
    'Profile/Avatar': 'profile-avatar.csv',
    'Social Media': 'social-media.csv',
    'Infographic': 'infographic.csv',
    'YouTube Thumbnail': 'youtube-thumbnail.csv',
    'Comic/Storyboard': 'comic-storyboard.csv',
    'Product Marketing': 'product-marketing.csv',
    'E-commerce': 'ecommerce.csv',
    'Game Asset': 'game-asset.csv',
    'Photography': 'photography.csv',
    'Cinematic': 'cinematic.csv',
    'Anime/Manga': 'anime-manga.csv',
    '3D Render': '3d-render.csv',
    'Pixel Art': 'pixel-art.csv',
    'Cyberpunk': 'cyberpunk.csv',
    'Minimalism': 'minimalism.csv',
    'Portrait': 'profile-avatar.csv',
    'Food': 'food.csv',
    'Nature': 'nature.csv',
    'Architecture': 'architecture.csv'
  };

  const copyImageToClipboard = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      if (blob.type === 'image/jpeg' || blob.type === 'image/jpg') {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(async (pngBlob) => {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': pngBlob })
            ]);
            alert(t.imageCopied);
          } catch (err) {
            console.error('Canvas export failed:', err);
            alert(t.copyFailed);
          }
        }, 'image/png');
      } else {
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        alert(t.imageCopied);
      }
    } catch (err) {
      console.error('Clipboard write failed:', err);
      navigator.clipboard.writeText(imageUrl);
      alert(t.urlCopied);
    }
  }

  // Helper to optimize external images (simulating CDN behavior)
  const optimizeImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x600?text=No+Image';

    // If it's already a local/relative path or jsDelivr, return as is
    if (url.startsWith('/') || url.includes('jsdelivr.net')) return url;

    // For external images (Twitter, etc.), use images.weserv.nl for caching & optimization
    // This provides CDN-like benefits without hosting all images locally
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=800&q=80&output=webp`;
  }

  const handleDoubleClick = (prompt, imageUrl) => {
    // For the modal, use higher quality
    const largeUrl = imageUrl.includes('weserv.nl')
      ? imageUrl.replace('&w=800', '&w=1600')
      : optimizeImageUrl(prompt.originalImageUrl || imageUrl).replace('&w=800', '&w=1600');

    setSelectedPrompt({ ...prompt, imageUrl: largeUrl });
    setShowPrompt(false);
  }

  const closeModal = () => {
    setSelectedPrompt(null);
  }

  useEffect(() => {
    fetchPrompts(selectedCategory)
  }, [selectedCategory])

  const fetchPrompts = async (category) => {
    setLoading(true)
    try {
      const fileName = CATEGORY_FILES[category] || 'featured.csv';
      const url = `https://cdn.jsdelivr.net/gh/ezdproduct/EZPrompt@main/public/categories/${fileName}`;

      console.log(`Fetching prompts for category: ${category} from ${url}`);

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${url}`);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data.map(item => {
            let author = {};
            try {
              author = item.author ? JSON.parse(item.author) : {};
            } catch (e) {
              author = { name: item.author || 'Unknown' };
            }

            let sourceMedia = [];
            try {
              sourceMedia = item.sourceMedia ? JSON.parse(item.sourceMedia) : [];
            } catch (e) {
              sourceMedia = [item.sourceMedia];
            }

            return {
              ...item,
              author,
              sourceMedia
            };
          }).filter(item => item.sourceMedia && item.sourceMedia.length > 0);

          setPrompts(parsedData);
          setLoading(false);
        },
        error: (err) => {
          console.error('CSV Parse Error:', err);
          setPrompts([]);
          setLoading(false);
        }
      });

    } catch (error) {
      console.error('Error fetching CSVs:', error);
      setPrompts([]);
      setLoading(false);
    }
  }

  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  })

  const breakpointColumnsObj = {
    default: 5,
    1800: 5,
    1500: 4,
    1100: 3,
    800: 2,
    500: 2
  };

  return (
    <div className="app">
      <header>
        <a href="/" className="logo">
          <FaPinterest style={{ fontSize: '32px' }} />
          EZ Prompt
        </a>
        <div className="search-bar">
          <IoSearch color="#767676" size={20} />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="header-actions">
          <button
            className="btn-icon"
            onClick={() => setLanguage(l => l === 'en' ? 'vi' : 'en')}
            style={{ width: 'auto', padding: '0 8px', fontSize: '14px', fontWeight: 'bold' }}
          >
            {language === 'en' ? 'EN' : 'VI'}
          </button>
          <button className="btn-icon">
            <IoNotifications />
          </button>
          <button className="btn-icon">
            <IoChatbubbleEllipses />
          </button>
          <button className="btn-icon">
            <IoPersonCircle size={32} />
          </button>
          <button className="btn-icon" style={{ width: '24px' }}>
            <IoChevronDown />
          </button>
        </div>
      </header>

      {/* Category Bar */}
      <div className="category-bar">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {t.categories[cat] || cat}
          </button>
        ))}
      </div>

      <main className="repo-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {filteredPrompts.flatMap((prompt, promptIdx) => {
              let images = [];
              if (Array.isArray(prompt.sourceMedia) && prompt.sourceMedia.length > 0) {
                images = prompt.sourceMedia;
              } else if (typeof prompt.sourceMedia === 'string') {
                try {
                  const parsed = JSON.parse(prompt.sourceMedia);
                  if (Array.isArray(parsed) && parsed.length > 0) images = parsed;
                  else images = [prompt.sourceMedia];
                } catch (e) {
                  images = [prompt.sourceMedia];
                }
              }

              // If no images, maybe skip or show placeholder? 
              // Let's show at least one placeholder if it's a valid prompt but no media, 
              // BUT usually we want visuals.
              if (images.length === 0) images = [null];

              return images.map((rawUrl, imgIdx) => {
                const uniqueKey = `${prompt.id || promptIdx}-${imgIdx}`;
                const originalUrl = rawUrl || '';
                const displayUrl = optimizeImageUrl(originalUrl);
                const rawAuthor = prompt.author?.name || 'Unknown';
                const authorName = (rawAuthor === 'Unknown' || rawAuthor === 'Unknown User') ? t.unknownUser : rawAuthor;

                // We pass the original URL metadata so double-click knows the source
                const promptWithMeta = { ...prompt, originalImageUrl: originalUrl };

                return (
                  <div
                    key={uniqueKey}
                    className="pin-card"
                    onDoubleClick={() => handleDoubleClick(promptWithMeta, displayUrl)}
                  >
                    <div className="pin-image-wrapper">
                      <img src={displayUrl} alt={prompt.title} className="pin-image" loading="lazy" />
                      <div className="pin-overlay">
                        <div style={{ // Top right actions if any 
                        }}></div>
                        <button className="save-btn">{t.save}</button>
                      </div>
                    </div>
                    <div className="pin-info">
                      {prompt.title && <h3 className="pin-title">{prompt.title}</h3>}
                      <div className="pin-meta">
                        <div className="author-avatar" style={{
                          background: '#efefef',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          color: '#555'
                        }}>
                          {authorName.charAt(0).toUpperCase()}
                        </div>
                        <span className="author-name">{authorName}</span>
                      </div>
                    </div>
                  </div>
                )
              });
            })}
          </Masonry>
        )}
      </main>

      {/* Detail Modal */}
      {selectedPrompt && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>×</button>
            <div className="modal-image-col">
              <img src={selectedPrompt.imageUrl} alt={selectedPrompt.title} className="modal-image" />
            </div>
            <div className="modal-info-col">
              <div className="modal-header">
                <h2 className="modal-title">{selectedPrompt.title}</h2>
              </div>

              {selectedPrompt.description && (
                <p className="modal-description">{selectedPrompt.description}</p>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPrompt.content);
                    alert(t.promptCopied);
                  }}
                  className="save-btn"
                  style={{ background: '#efefef', color: '#111' }}
                >
                  <IoCopy style={{ marginRight: '6px' }} /> {t.copyPrompt}
                </button>

                <button
                  onClick={() => setShowPrompt(!showPrompt)}
                  className="save-btn"
                  style={{ background: '#efefef', color: '#111' }}
                >
                  {showPrompt ? <IoEyeOff style={{ marginRight: '6px' }} /> : <IoEye style={{ marginRight: '6px' }} />}
                  {showPrompt ? t.hidePrompt : t.viewPrompt}
                </button>

                <button
                  onClick={() => copyImageToClipboard(selectedPrompt.imageUrl)}
                  className="save-btn"
                  style={{ background: '#efefef', color: '#111' }}
                >
                  <IoImage style={{ marginRight: '6px' }} /> {t.copyImage}
                </button>
              </div>

              {showPrompt && selectedPrompt.content && (
                <div className="prompt-box">
                  {selectedPrompt.content}
                </div>
              )}

              {/* Minimized Author/Source just to keep clean as requested */}
              <div className="author-section" style={{ borderTop: 'none', paddingTop: 0 }}>
                {/* Keep author info but minimal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#767676' }}>
                  <span>{t.by} {selectedPrompt.author?.name || t.unknown}</span>
                  {selectedPrompt.sourceLink && (
                    <>
                      <span>•</span>
                      <a href={selectedPrompt.sourceLink} target="_blank" rel="noopener noreferrer" style={{ color: '#111', fontWeight: 600, textDecoration: 'none' }}>
                        {t.source} ↗
                      </a>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
