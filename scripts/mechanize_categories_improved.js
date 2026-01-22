import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_CSV = path.join(__dirname, '../public/categories/featured.csv');
const OUTPUT_DIR = path.join(__dirname, '../public/categories/');

// EXPANDED CATEGORY MAP - Thêm nhiều categories mới
const CATEGORY_MAP = {
    // Existing categories
    'profile-avatar.csv': ['avatar', 'profile', 'portrait', 'face', 'headshot', 'ảnh đại diện', 'chân dung', 'hồ sơ', 'selfie'],
    'social-media.csv': ['instagram', 'facebook', 'tiktok', 'post', 'social', 'mạng xã hội', 'bài đăng', 'story'],
    'infographic.csv': ['infographic', 'đồ họa thông tin', 'educational', 'giáo dục'],
    'youtube-thumbnail.csv': ['youtube', 'thumbnail', 'cover', 'tiêu đề', 'bìa', 'video'],
    'comic-storyboard.csv': ['comic', 'manga', 'storyboard', 'panel', 'truyện tranh', 'bảng phân cảnh', 'graphic novel'],
    'product-marketing.csv': ['product', 'advertisement', 'promo', 'marketing', 'sản phẩm', 'quảng cáo', 'tiếp thị', 'ad'],
    'ecommerce.csv': ['ecommerce', 'shop', 'sale', 'commercial', 'thương mại điện tử', 'shopping'],
    'game-asset.csv': ['game', 'sprite', 'asset', 'item', 'rpg', 'trò chơi', 'tài sản', 'gaming'],
    'photography.csv': ['photo', 'shot', 'camera', 'lens', 'nhiếp ảnh', 'chụp ảnh', 'photograph'],
    'cinematic.csv': ['cinematic', 'film', 'movie', 'scene', 'điện ảnh', 'phim', 'film still'],
    'anime-manga.csv': ['anime', 'manga', 'waifu', 'hoạt hình', 'japanese animation'],
    '3d-render.csv': ['3d', 'render', 'blender', 'c4d', 'unreal', 'cgi', 'maya', 'zbrush'],
    'pixel-art.csv': ['pixel', '8-bit', '16-bit', 'retro game', 'pixel art', 'pixelated'],
    'cyberpunk.csv': ['cyberpunk', 'neon', 'futuristic', 'sci-fi', 'tương lai', 'future', 'tech'],
    'minimalism.csv': ['minimal', 'simple', 'clean', 'tối giản', 'đơn giản', 'icon', 'flat design'],
    'food.csv': ['food', 'drink', 'meal', 'dish', 'thực phẩm', 'đồ ăn', 'món ăn', 'kitchen', 'bếp', 'cuisine', 'recipe'],
    'nature.csv': ['nature', 'landscape', 'mountain', 'forest', 'sea', 'thiên nhiên', 'phong cảnh', 'outdoor', 'wilderness'],
    'architecture.csv': ['architecture', 'building', 'house', 'interior', 'room', 'kiến trúc', 'nội thất', 'construction'],

    // NEW CATEGORIES - Art Styles
    'watercolor.csv': ['watercolor', 'water color', 'màu nước', 'aquarelle'],
    'oil-painting.csv': ['oil painting', 'oil paint', 'tranh sơn dầu', 'canvas painting'],
    'sketch.csv': ['sketch', 'line art', 'phác thảo', 'drawing', 'pencil', 'hand drawn', 'doodle'],
    'ink-art.csv': ['ink', 'chinese style', 'mực', 'thủy mặc', 'sumi-e', 'calligraphy'],
    'illustration.csv': ['illustration', 'minh họa', 'illustrated', 'digital art', 'artwork'],
    'chibi.csv': ['chibi', 'q-style', 'cute', 'sd', 'super deformed', 'kawaii'],
    'isometric.csv': ['isometric', 'đẳng cự', 'iso', 'isometric view'],
    'retro-vintage.csv': ['retro', 'vintage', 'cổ điển', 'old', 'classic', '80s', '90s', 'nostalgic'],

    // NEW CATEGORIES - Subjects
    'character.csv': ['character', 'nhân vật', 'oc', 'mascot', 'character design', 'original character'],
    'animal.csv': ['animal', 'creature', 'động vật', 'sinh vật', 'pet', 'wildlife', 'beast', 'dragon'],
    'vehicle.csv': ['vehicle', 'car', 'phương tiện', 'xe', 'bike', 'ship', 'plane', 'motorcycle', 'truck'],
    'fashion.csv': ['fashion', 'clothing', 'thời trang', 'outfit', 'style', 'apparel', 'wardrobe'],
    'typography.csv': ['typography', 'text', 'quote', 'kiểu chữ', 'chữ', 'lettering', 'font', 'text art', 'quote card'],
    'abstract.csv': ['abstract', 'pattern', 'texture', 'trừu tượng', 'background', 'geometric', 'shapes'],
    'diagram.csv': ['diagram', 'technical', 'blueprint', 'sơ đồ', 'chart', 'flowchart', 'schematic', 'map', 'bản đồ'],
    'cityscape.csv': ['cityscape', 'urban', 'street', 'city', 'thành phố', 'đô thị', 'downtown', 'metropolis'],

    // NEW CATEGORIES - Use Cases
    'poster.csv': ['poster', 'flyer', 'banner', 'tờ rơi', 'áp phích', 'promotional'],
    'logo-branding.csv': ['logo', 'brand', 'branding', 'nhận diện', 'identity', 'mark'],
    'book-cover.csv': ['book cover', 'book', 'bìa sách', 'novel cover', 'magazine cover'],
    'ui-design.csv': ['ui', 'ux', 'web design', 'app design', 'interface', 'giao diện', 'mockup', 'wireframe'],
    'meme.csv': ['meme', 'humor', 'funny', 'hài', 'joke', 'humorous'],
    'professional.csv': ['professional', 'linkedin', 'business', 'corporate', 'nghề nghiệp', 'công việc'],
    'fantasy.csv': ['fantasy', 'magic', 'kỳ ảo', 'magical', 'mystical', 'wizard', 'elf'],
    'historical.csv': ['historical', 'history', 'ancient', 'lịch sử', 'medieval', 'classical'],

    // Keep others for uncategorized
    'others.csv': []
};

// ENHANCED KEYWORD RULES for auto-tagging
const ENHANCED_KEYWORD_RULES = {
    // Portrait & People
    'Chân dung': ['portrait', 'chân dung', 'face', 'headshot', 'selfie', 'avatar'],
    'Nhóm người': ['group', 'couple', 'nhóm', 'cặp đôi', 'team', 'family'],

    // Photography styles
    'Nhiếp ảnh': ['photo', 'photography', 'nhiếp ảnh', 'camera', 'lens', 'f/', 'mm', 'iso', 'shot'],
    'Điện ảnh': ['cinematic', 'điện ảnh', 'film', 'movie', 'lighting', 'film still'],

    // Art Styles
    'Minh họa': ['illustration', 'minh họa', 'drawing', 'vẽ', 'illustrated'],
    '3D': ['3d', 'render', 'unreal', 'blender', 'c4d', 'maya', 'cgi'],
    'Anime': ['anime', 'manga', 'hoạt hình', 'waifu', 'chibi'],
    'Tối giản': ['minimal', 'tối giản', 'clean', 'simple', 'flat'],
    'Cổ điển': ['vintage', 'retro', 'cổ điển', 'old', 'classic'],
    'Tương lai': ['futuristic', 'cyberpunk', 'neon', 'tương lai', 'sci-fi'],
    'Màu nước': ['watercolor', 'màu nước', 'aquarelle'],
    'Sơn dầu': ['oil painting', 'oil paint', 'tranh sơn dầu'],
    'Pixel': ['pixel', 'pixel art', '8-bit', '16-bit'],
    'Phác thảo': ['sketch', 'line art', 'phác thảo', 'pencil'],
    'Ukiyo-e': ['ukiyo-e', 'japanese print', 'woodblock'],

    // Subjects
    'Thiên nhiên': ['nature', 'landscape', 'phong cảnh', 'thiên nhiên', 'outdoor', 'mountain', 'forest'],
    'Sản phẩm': ['product', 'quảng cáo', 'sản phẩm', 'marketing', 'commercial'],
    'Nội thất': ['interior', 'nội thất', 'architecture', 'room', 'kiến trúc'],
    'Đồ ăn': ['food', 'drink', 'meal', 'dish', 'đồ ăn', 'món ăn', 'cuisine'],
    'Nhân vật': ['character', 'nhân vật', 'oc', 'mascot'],
    'Động vật': ['animal', 'creature', 'động vật', 'sinh vật', 'pet'],
    'Xe cộ': ['vehicle', 'car', 'xe', 'bike', 'ship', 'plane'],
    'Thời trang': ['fashion', 'clothing', 'outfit', 'thời trang'],
    'Thành phố': ['cityscape', 'urban', 'city', 'thành phố', 'street'],
    'Văn bản': ['text', 'typography', 'quote', 'chữ', 'lettering'],
    'Trừu tượng': ['abstract', 'trừu tượng', 'geometric', 'pattern'],

    // Use Cases
    'Trò chơi': ['game', 'gaming', 'rpg', 'trò chơi'],
    'Logo': ['logo', 'brand', 'branding', 'identity'],
    'Poster': ['poster', 'flyer', 'banner', 'áp phích'],
    'UI/UX': ['ui', 'ux', 'web', 'app', 'interface'],
    'Meme': ['meme', 'humor', 'funny', 'hài'],
    'Giáo dục': ['infographic', 'educational', 'giáo dục', 'learning'],
};

function generateKeywords(prompt) {
    const searchStr = `${prompt.title} ${prompt.description} ${prompt.content}`.toLowerCase();
    const tags = new Set();

    Object.entries(ENHANCED_KEYWORD_RULES).forEach(([tag, rules]) => {
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

    console.log(`\n📊 Processing ${prompts.length} prompts...\n`);

    const categorizedPrompts = {};
    Object.keys(CATEGORY_MAP).forEach(file => {
        categorizedPrompts[file] = [];
    });

    // Statistics
    const stats = {
        total: prompts.length,
        categorized: 0,
        multiCategory: 0,
        uncategorized: 0
    };

    prompts.forEach(prompt => {
        const searchStr = `${prompt.title} ${prompt.description} ${prompt.content}`.toLowerCase();
        let matchCount = 0;

        Object.entries(CATEGORY_MAP).forEach(([file, keywords]) => {
            if (keywords.length === 0) return; // Skip 'others'

            const isMatch = keywords.some(kw => searchStr.includes(kw.toLowerCase()));
            if (isMatch) {
                categorizedPrompts[file].push(prompt);
                matchCount++;
            }
        });

        if (matchCount > 0) {
            stats.categorized++;
            if (matchCount > 1) stats.multiCategory++;
        } else {
            // Add to others if no match
            categorizedPrompts['others.csv'].push(prompt);
            stats.uncategorized++;
        }
    });

    // Write files and show statistics
    console.log('📁 Writing category files...\n');
    const categoryStats = [];

    Object.entries(categorizedPrompts).forEach(([file, data]) => {
        const csv = Papa.unparse(data);
        fs.writeFileSync(path.join(OUTPUT_DIR, file), csv);

        const count = data.length;
        const percent = ((count / prompts.length) * 100).toFixed(1);
        categoryStats.push({ file, count, percent });

        if (count > 0) {
            console.log(`✅ ${file.padEnd(30)} ${count.toString().padStart(5)} prompts (${percent}%)`);
        } else {
            console.log(`⚪ ${file.padEnd(30)} ${count.toString().padStart(5)} prompts (empty)`);
        }
    });

    // Summary statistics
    console.log('\n' + '='.repeat(60));
    console.log('📊 CATEGORIZATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total prompts:           ${stats.total}`);
    console.log(`Categorized:             ${stats.categorized} (${((stats.categorized / stats.total) * 100).toFixed(1)}%)`);
    console.log(`Multi-category:          ${stats.multiCategory} (${((stats.multiCategory / stats.total) * 100).toFixed(1)}%)`);
    console.log(`Uncategorized (others):  ${stats.uncategorized} (${((stats.uncategorized / stats.total) * 100).toFixed(1)}%)`);
    console.log('='.repeat(60));

    // Top 10 categories
    console.log('\n🏆 TOP 10 CATEGORIES:');
    categoryStats
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .forEach((cat, idx) => {
            console.log(`${(idx + 1).toString().padStart(2)}. ${cat.file.padEnd(30)} ${cat.count} prompts`);
        });

    console.log('\n✨ Categorization complete!\n');
}

categorize();
