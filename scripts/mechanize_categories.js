
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_CSV = path.join(__dirname, '../public/categories/featured.csv');
const OUTPUT_DIR = path.join(__dirname, '../public/categories/');

const CATEGORY_MAP = {
    'profile-avatar.csv': ['avatar', 'profile', 'portrait', 'face', 'headshot', 'ảnh đại diện', 'chân dung', 'hồ sơ'],
    'social-media.csv': ['instagram', 'facebook', 'tiktok', 'post', 'social', 'mạng xã hội', 'bài đăng'],
    'infographic.csv': ['infographic', 'chart', 'diagram', 'map', 'đồ họa thông tin', 'biểu đồ', 'bản đồ', 'sơ đồ'],
    'youtube-thumbnail.csv': ['youtube', 'thumbnail', 'cover', 'tiêu đề', 'bìa'],
    'comic-storyboard.csv': ['comic', 'manga', 'storyboard', 'panel', 'truyện tranh', 'bảng phân cảnh', 'ukiyo-e'],
    'product-marketing.csv': ['product', 'advertisement', 'promo', 'marketing', 'sản phẩm', 'quảng cáo', 'tiếp thị'],
    'ecommerce.csv': ['ecommerce', 'shop', 'sale', 'commercial', 'thương mại điện tử'],
    'game-asset.csv': ['game', 'sprite', 'asset', 'item', 'rpg', 'trò chơi', 'tài sản'],
    'photography.csv': ['photo', 'shot', 'camera', 'lens', 'nhiếp ảnh', 'chụp ảnh'],
    'cinematic.csv': ['cinematic', 'film', 'movie', 'scene', 'điện ảnh', 'phim'],
    'anime-manga.csv': ['anime', 'manga', 'waifu', 'illustration', 'hoạt hình'],
    '3d-render.csv': ['3d', 'render', 'blender', 'c4d', 'unreal'],
    'pixel-art.csv': ['pixel', '8-bit', '16-bit', 'retro game', 'pixel art'],
    'cyberpunk.csv': ['cyberpunk', 'neon', 'futuristic', 'sci-fi', 'tương lai'],
    'minimalism.csv': ['minimal', 'simple', 'clean', 'tối giản', 'đơn giản', 'icon'],
    'food.csv': ['food', 'drink', 'meal', 'dish', 'thực phẩm', 'đồ ăn', 'món ăn', 'kitchen', 'bếp'],
    'nature.csv': ['nature', 'landscape', 'mountain', 'forest', 'sea', 'thiên nhiên', 'phong cảnh'],
    'architecture.csv': ['architecture', 'building', 'house', 'interior', 'room', 'kiến trúc', 'nội thất']
};

const KEYWORD_RULES = {
    'Chân dung': ['chân dung', 'portrait', 'face', 'headshot', 'selfie'],
    'Nhiếp ảnh': ['photo', 'photography', 'nhiếp ảnh', 'camera', 'lens', 'f/1.8', '85mm', 'iso'],
    'Điện ảnh': ['cinematic', 'điện ảnh', 'film', 'movie', 'lighting'],
    'Minh họa': ['illustration', 'minh họa', 'drawing', 'vẽ'],
    '3D': ['3d', 'render', 'unreal', 'blender', 'c4d'],
    'Anime': ['anime', 'manga', 'hoạt hình'],
    'Tối giản': ['minimal', 'tối giản', 'clean', 'simple'],
    'Cổ điển': ['vintage', 'retro', 'cổ điển', 'old', 'classic'],
    'Tương lai': ['futuristic', 'cyberpunk', 'neon', 'tương lai'],
    'Thiên nhiên': ['nature', 'landscape', 'phong cảnh', 'thiên nhiên', 'outdoor'],
    'Sản phẩm': ['product', 'quảng cáo', 'sản phẩm', 'marketing'],
    'Nội thất': ['interior', 'nội thất', 'architecture', 'room', 'kiến trúc']
};

function generateKeywords(prompt) {
    const searchStr = `${prompt.title} ${prompt.description} ${prompt.content}`.toLowerCase();
    const tags = new Set();

    Object.entries(KEYWORD_RULES).forEach(([tag, rules]) => {
        if (rules.some(r => searchStr.includes(r.toLowerCase()))) {
            tags.add(tag);
        }
    });

    return Array.from(tags).join(', ');
}

async function categorize() {
    if (!fs.existsSync(INPUT_CSV)) {
        console.error("featured.csv not found!");
        return;
    }

    const csvText = fs.readFileSync(INPUT_CSV, 'utf8');
    const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    const prompts = results.data.map(p => ({
        ...p,
        keywords: generateKeywords(p)
    }));

    const categoriedPrompts = {};
    Object.keys(CATEGORY_MAP).forEach(file => {
        categoriedPrompts[file] = [];
    });

    prompts.forEach(prompt => {
        const searchStr = `${prompt.title} ${prompt.description} ${prompt.content}`.toLowerCase();

        Object.entries(CATEGORY_MAP).forEach(([file, keywords]) => {
            const isMatch = keywords.some(kw => searchStr.includes(kw.toLowerCase()));
            if (isMatch) {
                categoriedPrompts[file].push(prompt);
            }
        });

        // Special case for Portrait as it shares profile-avatar.csv in App.jsx mapping
        // But CATEGORY_MAP already uses profile-avatar.csv as key.
    });

    // Write files
    Object.entries(categoriedPrompts).forEach(([file, data]) => {
        if (data.length > 0) {
            const csv = Papa.unparse(data);
            fs.writeFileSync(path.join(OUTPUT_DIR, file), csv);
            console.log(`Generated ${file} with ${data.length} prompts.`);
        } else {
            // Create empty csv with header if no data
            const csv = Papa.unparse([]);
            fs.writeFileSync(path.join(OUTPUT_DIR, file), csv);
            console.log(`Generated empty ${file}.`);
        }
    });

    console.log("Categorization complete.");
}

categorize();
