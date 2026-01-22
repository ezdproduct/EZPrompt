import { useEffect, useState, useRef, useMemo } from 'react'
import { Routes, Route, useNavigate, Link } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import Papa from 'papaparse'
import { IoSearch, IoNotifications, IoChatbubbleEllipses, IoPersonCircle, IoChevronDown, IoGlobeOutline, IoExpand } from 'react-icons/io5'
import { translations } from './translations'
import { FaPinterest } from 'react-icons/fa'
import DetailView from './DetailView'

// Sub-component for each Pin to manage its own dimensions
const PinItem = ({ pin, t, onPromptClick }) => {
  const { uniqueKey, prompt, displayUrl } = pin;
  const [dims, setDims] = useState(null);
  const authorName = prompt.author?.name || t.unknownUser;

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setDims(`${naturalWidth} × ${naturalHeight}`);
  };

  return (
    <div key={uniqueKey} className="pin-card" onClick={() => onPromptClick(prompt, displayUrl)}>
      <div className="pin-image-wrapper">
        <img
          src={displayUrl}
          alt={prompt.title}
          className="pin-image"
          loading="lazy"
          onLoad={handleImageLoad}
        />
        <div className="pin-overlay">
          <div className="pin-overlay-bottom">
            {dims && <div className="pin-dims-badge">{dims}</div>}
            <div className="pin-enlarge-btn">
              <IoExpand />
            </div>
          </div>
        </div>
      </div>
      <div className="pin-info">
        {prompt.title && <h3 className="pin-title">{prompt.title}</h3>}
        <div className="pin-meta">
          <div className="author-avatar" style={{ background: '#efefef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
            {(authorName || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="author-name">{authorName}</span>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'vi')
  const [visibleItemsCount, setVisibleItemsCount] = useState(20)
  const [pendingCategoryNav, setPendingCategoryNav] = useState(false)
  const [loopedPins, setLoopedPins] = useState([])

  const navigate = useNavigate();
  const loadMoreRef = useRef(null);
  const categoryCache = useRef({});

  const categories = [
    'All',
    // Personal & Social
    'Profile/Avatar', 'Social Media',
    // Marketing & Business
    'Product Marketing', 'E-commerce', 'Poster', 'Logo/Branding', 'Professional',
    // Content Creation
    'YouTube Thumbnail', 'Infographic', 'Diagram', 'Book Cover', 'Meme',
    // Art Styles
    'Illustration', 'Watercolor', 'Oil Painting', 'Sketch', 'Ink Art',
    'Anime/Manga', 'Chibi', 'Pixel Art', 'Isometric', 'Retro/Vintage',
    // Photography & Realism
    'Photography', 'Cinematic', 'Food', 'Nature', 'Cityscape',
    // Technical & Design
    '3D Render', 'Game Asset', 'UI/UX Design', 'Architecture',
    // Subjects
    'Character', 'Animal', 'Vehicle', 'Fashion', 'Typography', 'Abstract',
    // Themes
    'Cyberpunk', 'Fantasy', 'Historical', 'Minimalism'
  ];

  const CATEGORY_FILES = {
    'All': 'featured.csv',
    'Profile/Avatar': 'profile-avatar.csv',
    'Social Media': 'social-media.csv',
    'Product Marketing': 'product-marketing.csv',
    'E-commerce': 'ecommerce.csv',
    'Poster': 'poster.csv',
    'Logo/Branding': 'logo-branding.csv',
    'Professional': 'professional.csv',
    'YouTube Thumbnail': 'youtube-thumbnail.csv',
    'Infographic': 'infographic.csv',
    'Diagram': 'diagram.csv',
    'Book Cover': 'book-cover.csv',
    'Meme': 'meme.csv',
    'Illustration': 'illustration.csv',
    'Watercolor': 'watercolor.csv',
    'Oil Painting': 'oil-painting.csv',
    'Sketch': 'sketch.csv',
    'Ink Art': 'ink-art.csv',
    'Anime/Manga': 'anime-manga.csv',
    'Chibi': 'chibi.csv',
    'Pixel Art': 'pixel-art.csv',
    'Isometric': 'isometric.csv',
    'Retro/Vintage': 'retro-vintage.csv',
    'Photography': 'photography.csv',
    'Cinematic': 'cinematic.csv',
    'Food': 'food.csv',
    'Nature': 'nature.csv',
    'Cityscape': 'cityscape.csv',
    '3D Render': '3d-render.csv',
    'Game Asset': 'game-asset.csv',
    'UI/UX Design': 'ui-design.csv',
    'Architecture': 'architecture.csv',
    'Character': 'character.csv',
    'Animal': 'animal.csv',
    'Vehicle': 'vehicle.csv',
    'Fashion': 'fashion.csv',
    'Typography': 'typography.csv',
    'Abstract': 'abstract.csv',
    'Cyberpunk': 'cyberpunk.csv',
    'Fantasy': 'fantasy.csv',
    'Historical': 'historical.csv',
    'Minimalism': 'minimalism.csv'
  };

  const optimizeImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x600?text=No+Image';
    if (url.startsWith('/') || url.includes('jsdelivr.net')) return url;
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=800&q=80&output=webp`;
  }

  const handlePromptClick = (prompt, displayUrl) => {
    const largeUrl = displayUrl.includes('weserv.nl')
      ? displayUrl.replace('&w=800', '&w=1600')
      : optimizeImageUrl(prompt.originalImageUrl || displayUrl).replace('&w=800', '&w=1600');

    const promptId = prompt.id || Math.random().toString(36).substr(2, 9);
    navigate(`/prompt/${promptId}`, {
      state: {
        prompt: { ...prompt, imageUrl: largeUrl },
        category: selectedCategory,
        categoryFiles: CATEGORY_FILES
      }
    });
  }

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchPrompts = async (category) => {
    if (categoryCache.current[category] && categoryCache.current[category].length > 0) {
      setPrompts(categoryCache.current[category]);
      setLoading(false);
      return;
    }

    setLoading(true)
    try {
      const fileName = CATEGORY_FILES[category] || 'featured.csv';
      const url = `/categories/${fileName}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${url}`);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data.map(item => {
            let author = {};
            try { author = item.author ? JSON.parse(item.author) : {}; }
            catch (e) { author = { name: item.author || 'Unknown' }; }

            let sourceMedia = [];
            try {
              if (item.sourceMedia) {
                const parsed = JSON.parse(item.sourceMedia);
                sourceMedia = Array.isArray(parsed) ? parsed : [parsed];
              }
            } catch (e) {
              sourceMedia = item.sourceMedia ? [item.sourceMedia] : [];
            }

            return {
              ...item,
              author,
              sourceMedia: sourceMedia.filter(url => url)
            };
          }).filter(item => item.sourceMedia && item.sourceMedia.length > 0);

          categoryCache.current[category] = parsedData;
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

  const processedPins = useMemo(() => {
    return prompts
      .filter(p => {
        const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.keywords?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
      .flatMap((prompt, promptIdx) => {
        const images = (prompt.sourceMedia && prompt.sourceMedia.length > 0) ? prompt.sourceMedia : [null];
        return images.map((rawUrl, imgIdx) => ({
          uniqueKey: `${prompt.id || promptIdx}-${imgIdx}`,
          prompt,
          rawUrl: rawUrl || '',
          displayUrl: optimizeImageUrl(rawUrl || '')
        }));
      });
  }, [prompts, searchTerm]);

  useEffect(() => {
    localStorage.setItem('appLanguage', language)
  }, [language])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && processedPins.length > 0) {
          if (visibleItemsCount + 20 >= loopedPins.length) {
            const extra = shuffleArray(processedPins);
            setLoopedPins(prev => [...prev, ...extra]);
          }
          setVisibleItemsCount(prev => prev + 20);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px 800px 0px' // Trigger loading ~800px before reaching the bottom (approx 70% scroll)
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loading, processedPins, loopedPins.length, visibleItemsCount]);

  useEffect(() => {
    setVisibleItemsCount(20);
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    fetchPrompts(selectedCategory)
  }, [selectedCategory])

  useEffect(() => {
    if (pendingCategoryNav && !loading && processedPins.length > 0) {
      const firstPin = processedPins[0];
      handlePromptClick(firstPin.prompt, firstPin.displayUrl);
      setPendingCategoryNav(false);
    } else if (pendingCategoryNav && !loading && processedPins.length === 0) {
      setPendingCategoryNav(false);
    }
  }, [loading, processedPins, pendingCategoryNav]);

  useEffect(() => {
    if (processedPins.length > 0) {
      setLoopedPins(shuffleArray(processedPins));
      setVisibleItemsCount(20);
    } else {
      setLoopedPins([]);
    }
  }, [processedPins]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    if (cat !== 'All') {
      setPendingCategoryNav(true);
    }
  };

  const t = translations[language]

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
        <Link to="/" className="logo">
          <FaPinterest style={{ fontSize: '32px' }} />
          EZ Prompt
        </Link>
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
          <button className="btn-icon"><IoNotifications /></button>
          <button className="btn-icon"><IoChatbubbleEllipses /></button>
          <button className="btn-icon"><IoPersonCircle size={32} /></button>
          <button className="btn-icon" style={{ width: '24px' }}><IoChevronDown /></button>
        </div>
      </header>

      <Routes>
        <Route path="/" element={
          <>
            <div className="category-bar">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {t.categories[cat] || cat}
                </button>
              ))}
            </div>

            <main className="repo-container">
              {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
              ) : (
                <Masonry
                  breakpointCols={breakpointColumnsObj}
                  className="my-masonry-grid"
                  columnClassName="my-masonry-grid_column"
                >
                  {loopedPins.slice(0, visibleItemsCount).map((pin, idx) => (
                    <PinItem
                      key={`${pin.uniqueKey}-${idx}`}
                      pin={pin}
                      t={t}
                      onPromptClick={handlePromptClick}
                    />
                  ))}
                </Masonry>
              )}
              {/* Infinite Scroll Detector */}
              <div ref={loadMoreRef} style={{ height: '20px', margin: '20px 0' }}></div>
            </main>
          </>
        } />
        <Route path="/prompt/:id" element={<DetailView language={language} />} />
      </Routes>
    </div>
  )
}

export default App
