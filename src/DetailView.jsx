import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { IoCopy, IoEye, IoEyeOff, IoImage, IoArrowBack } from 'react-icons/io5';
import Masonry from 'react-masonry-css';
import Papa from 'papaparse';
import { categoryTranslations } from './categoryTranslations';
import './DetailView.css';

const DetailView = ({ language = 'vi' }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Data from navigation state
    const { prompt, category, categoryFiles } = location.state || {};

    const [currentPrompt, setCurrentPrompt] = useState(prompt);
    const [relatedPrompts, setRelatedPrompts] = useState([]);
    const [otherPrompts, setOtherPrompts] = useState([]);
    const [showPrompt, setShowPrompt] = useState(false);
    const [copiedPrompt, setCopiedPrompt] = useState(false);
    const [copiedImage, setCopiedImage] = useState(false);
    const [loadingRelated, setLoadingRelated] = useState(true);

    const t = categoryTranslations[language] || categoryTranslations['en'];

    const optimizeImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/400x600?text=No+Image';
        if (url.startsWith('/') || url.includes('jsdelivr.net')) return url;
        return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=800&q=80&output=webp`;
    }

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!prompt) {
            navigate('/');
            return;
        }
        setCurrentPrompt(prompt);
        setShowPrompt(false);
        fetchRelatedData();
    }, [id, prompt, navigate]);

    const fetchRelatedData = async () => {
        if (!category || !categoryFiles) return;
        setLoadingRelated(true);

        try {
            // 1. Fetch same category
            const sameCatFile = categoryFiles[category] || 'featured.csv';
            const sameCatRes = await fetch(`/categories/${sameCatFile}`);
            const sameCatText = await sameCatRes.text();

            Papa.parse(sameCatText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const parsed = processRawData(results.data);
                    // Filter out current prompt
                    setRelatedPrompts(parsed.filter(p => (p.id || p.title) !== (prompt.id || prompt.title)).slice(0, 12));
                }
            });

            // 2. Fetch random category
            const allCats = Object.keys(categoryFiles).filter(c => c !== category && c !== 'All');
            const randomCat = allCats[Math.floor(Math.random() * allCats.length)];
            const otherCatFile = categoryFiles[randomCat];

            const otherCatRes = await fetch(`/categories/${otherCatFile}`);
            const otherCatText = await otherCatRes.text();

            Papa.parse(otherCatText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setOtherPrompts(processRawData(results.data).slice(0, 12));
                    setLoadingRelated(false);
                }
            });

        } catch (error) {
            console.error('Error fetching related data:', error);
            setLoadingRelated(false);
        }
    };

    const processRawData = (data) => {
        return data.map(item => {
            let author = {};
            try { author = item.author ? JSON.parse(item.author) : {}; }
            catch (e) { author = { name: item.author || 'Unknown' }; }

            let sourceMedia = [];
            try {
                if (item.sourceMedia) {
                    const parsed = JSON.parse(item.sourceMedia);
                    sourceMedia = Array.isArray(parsed) ? parsed : [parsed];
                }
            } catch (e) { sourceMedia = item.sourceMedia ? [item.sourceMedia] : []; }

            return {
                ...item,
                author,
                sourceMedia: sourceMedia.filter(url => url)
            };
        }).filter(item => item.sourceMedia && item.sourceMedia.length > 0);
    }

    const copyImageToClipboard = async (imageUrl) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const item = new ClipboardItem({ [blob.type]: blob });
            await navigator.clipboard.write([item]);
            setCopiedImage(true);
            setTimeout(() => setCopiedImage(false), 2000);
        } catch (err) {
            navigator.clipboard.writeText(imageUrl);
            setCopiedImage(true);
            setTimeout(() => setCopiedImage(false), 2000);
        }
    };

    const handlePromptClick = (p) => {
        const displayUrl = optimizeImageUrl(p.sourceMedia[0]);
        const largeUrl = displayUrl.replace('&w=800', '&w=1600');

        navigate(`/prompt/${p.id || Math.random().toString(36).substr(2, 9)}`, {
            state: {
                prompt: { ...p, imageUrl: largeUrl },
                category: category, // Keep same category context or you could detect it
                categoryFiles: categoryFiles
            }
        });
    };

    const breakpointColumns = {
        default: 5,
        1800: 4,
        1100: 3,
        800: 2,
        500: 2
    };

    if (!currentPrompt) return null;

    return (
        <div className="detail-page-container">
            <div className="detail-page-content">
                <div className="detail-main-layout">
                    <div className="detail-image-section">
                        <div className="detail-image-wrapper">
                            <img src={currentPrompt.imageUrl} alt={currentPrompt.title} className="detail-main-image" />
                        </div>
                    </div>

                    <div className="detail-info-section">
                        <div className="detail-header">
                            <h1 className="detail-title">{currentPrompt.title}</h1>
                            <div className="author-info">
                                <div className="author-avatar-large">
                                    {(currentPrompt.author?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="author-details">
                                    <span className="author-name-large">{currentPrompt.author?.name || (language === 'vi' ? 'Ẩn danh' : 'Unknown')}</span>
                                    {currentPrompt.sourceLink && (
                                        <a href={currentPrompt.sourceLink} target="_blank" rel="noopener noreferrer" className="source-link">Source ↗</a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {currentPrompt.description && <p className="detail-description">{currentPrompt.description}</p>}

                        {currentPrompt.keywords && (
                            <div className="detail-tags">
                                {currentPrompt.keywords.split(',').map(kw => (
                                    <span key={kw} className="tag-chip-detail">#{kw.trim()}</span>
                                ))}
                            </div>
                        )}

                        <div className="detail-actions-grid">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(currentPrompt.content);
                                    setCopiedPrompt(true);
                                    setTimeout(() => setCopiedPrompt(false), 2000);
                                }}
                                className={`detail-action-button ${copiedPrompt ? 'copied' : ''}`}
                            >
                                <IoCopy /> {copiedPrompt ? 'Copied!' : (language === 'vi' ? 'Sao chép Prompt' : 'Copy Prompt')}
                            </button>

                            <button onClick={() => setShowPrompt(!showPrompt)} className={`detail-action-button ${showPrompt ? 'active' : ''}`}>
                                {showPrompt ? <IoEyeOff /> : <IoEye />}
                                {showPrompt ? (language === 'vi' ? 'Ẩn Prompt' : 'Hide Prompt') : (language === 'vi' ? 'Xem Prompt' : 'View Prompt')}
                            </button>

                            <button onClick={() => copyImageToClipboard(currentPrompt.imageUrl)} className={`detail-action-button ${copiedImage ? 'copied' : ''}`}>
                                <IoImage /> {copiedImage ? 'Copied!' : (language === 'vi' ? 'Sao chép Ảnh' : 'Copy Image')}
                            </button>
                        </div>

                        {showPrompt && currentPrompt.content && (
                            <div className="detail-prompt-viewer">
                                <div className="detail-prompt-header">
                                    <span>AI Prompt</span>
                                    <button onClick={() => {
                                        navigator.clipboard.writeText(currentPrompt.content);
                                        setCopiedPrompt(true);
                                        setTimeout(() => setCopiedPrompt(false), 2000);
                                    }}><IoCopy /></button>
                                </div>
                                <div className="detail-prompt-content">{currentPrompt.content}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Section */}
                <div className="related-section">
                    <h2 className="related-title">
                        {language === 'vi' ? 'Thêm ý tưởng từ ' : 'More from '}
                        <span className="related-category-name">{category}</span>
                    </h2>

                    {loadingRelated ? (
                        <div className="related-loading"><div className="spinner-small"></div></div>
                    ) : (
                        <Masonry breakpointCols={breakpointColumns} className="my-masonry-grid" columnClassName="my-masonry-grid_column">
                            {relatedPrompts.map(p => (
                                <div key={p.id || p.title} className="pin-card" onClick={() => handlePromptClick(p)}>
                                    <div className="pin-image-wrapper">
                                        <img src={optimizeImageUrl(p.sourceMedia[0])} alt={p.title} className="pin-image" loading="lazy" />
                                    </div>
                                    <div className="pin-info">
                                        <h3 className="pin-title" style={{ fontSize: '13px' }}>{p.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </Masonry>
                    )}

                    <h2 className="related-title" style={{ marginTop: '60px' }}>
                        {language === 'vi' ? 'Khám phá thêm' : 'Explore more ideas'}
                    </h2>

                    {!loadingRelated && (
                        <Masonry breakpointCols={breakpointColumns} className="my-masonry-grid" columnClassName="my-masonry-grid_column">
                            {otherPrompts.map(p => (
                                <div key={p.id || p.title} className="pin-card" onClick={() => handlePromptClick(p)}>
                                    <div className="pin-image-wrapper">
                                        <img src={optimizeImageUrl(p.sourceMedia[0])} alt={p.title} className="pin-image" loading="lazy" />
                                    </div>
                                    <div className="pin-info">
                                        <h3 className="pin-title" style={{ fontSize: '13px' }}>{p.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </Masonry>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailView;
