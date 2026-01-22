import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILES = [
    path.join(__dirname, '../public/data.csv'),
    path.join(__dirname, '../public/template02.csv')
];
const OUTPUT_DIR = path.join(__dirname, '../public/categories');

// Define categories and their keywords
const CATEGORIES = {
    'profile-avatar': ['avatar', 'profile', 'selfie', 'portrait', 'headshot', 'face', 'identity'],
    'social-media': ['instagram', 'tiktok', 'social media', 'post', 'story', 'influencer'],
    'infographic': ['infographic', 'diagram', 'chart', 'map', 'visualization', 'structure'],
    'youtube-thumbnail': ['thumbnail', 'cover', 'youtube', 'title card'],
    'comic-storyboard': ['comic', 'manga', 'storyboard', 'panel', 'strip', 'webtoon'],
    'product-marketing': ['product', 'marketing', 'advertisement', 'commercial', 'promo', 'branding'],
    'ecommerce': ['ecommerce', 'shop', 'store', 'sale', 'item', 'catalog'],
    'game-asset': ['game', 'asset', 'sprite', 'texture', 'isometric', '3d model', 'character sheet'],
    'photography': ['photo', 'camera', 'shot', 'lighting', 'realistic', '8k', 'photoreal', 'lens'],
    'cinematic': ['cinematic', 'movie', 'film', 'scene', 'dramatic', 'cinema'],
    'anime-manga': ['anime', 'manga', 'waifu', 'kawaii', '2d', 'illustration'],
    '3d-render': ['3d', 'render', 'blender', 'c4d', 'octane', 'unreal', 'clay'],
    'pixel-art': ['pixel', 'retro', '8-bit', '16-bit', 'dot art'],
    'cyberpunk': ['cyberpunk', 'neon', 'sci-fi', 'futuristic', 'robot', 'cyborg'],
    'minimalism': ['minimal', 'simple', 'clean', 'flat', 'vector'],
    'nature': ['nature', 'landscape', 'flower', 'tree', 'forest', 'animal', 'outdoor'],
    'architecture': ['architecture', 'building', 'house', 'interior', 'room', 'urban'],
    'food': ['food', 'drink', 'meal', 'fruit', 'cake', 'coffee'],
    'featured': [] // Will hold a subset for initial load
};

// Ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function processData() {
    let allData = [];

    // Read and parse all input files
    for (const file of INPUT_FILES) {
        if (fs.existsSync(file)) {
            console.log(`Reading ${file}...`);
            const content = fs.readFileSync(file, 'utf8');
            const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
            allData = allData.concat(parsed.data);
        } else {
            console.warn(`File not found: ${file}`);
        }
    }

    console.log(`Total rows: ${allData.length}`);

    // Deduplicate (simple check by title + description)
    const seen = new Set();
    const uniqueData = [];
    for (const item of allData) {
        const key = (item.title || '') + (item.description || '').substring(0, 50);
        if (!seen.has(key) && item.title) { // Ensure it has at least a title
            seen.add(key);
            uniqueData.push(item);
        }
    }

    console.log(`Unique rows: ${uniqueData.length}`);

    // Categorize
    const categorizedData = {};
    for (const cat of Object.keys(CATEGORIES)) {
        categorizedData[cat] = [];
    }
    categorizedData['others'] = [];

    for (const item of uniqueData) {
        const text = ((item.title || '') + ' ' + (item.description || '') + ' ' + (item.content || '')).toLowerCase();

        let assigned = false;

        // Check standard categories
        for (const [cat, keywords] of Object.entries(CATEGORIES)) {
            if (cat === 'featured') continue;

            if (keywords.some(k => text.includes(k))) {
                categorizedData[cat].push(item);
                assigned = true;
            }
        }

        if (!assigned) {
            categorizedData['others'].push(item);
        }
    }

    // Create Featured/Recent (e.g., first 200 items of uniqueData)
    categorizedData['featured'] = uniqueData.slice(0, 200);

    // Identify empty categories to avoid creating empty files
    const nonEmptyCategories = [];

    // Write Files
    for (const [cat, items] of Object.entries(categorizedData)) {
        if (items.length > 0) {
            const csv = Papa.unparse(items);
            fs.writeFileSync(path.join(OUTPUT_DIR, `${cat}.csv`), csv);
            console.log(`Examples written to ${cat}.csv: ${items.length}`);
            nonEmptyCategories.push(cat);
        }
    }

    console.log('Done processing CSVs.');
}

processData();
