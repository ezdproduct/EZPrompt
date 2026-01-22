// Extended translations for new categories
export const categoryTranslations = {
    en: {
        // Existing categories
        'All': 'All',
        'Profile/Avatar': 'Profile & Avatar',
        'Social Media': 'Social Media',
        'Infographic': 'Infographic',
        'YouTube Thumbnail': 'YouTube Thumbnail',
        'Comic/Storyboard': 'Comic & Storyboard',
        'Product Marketing': 'Product Marketing',
        'E-commerce': 'E-commerce',
        'Game Asset': 'Game Asset',
        'Photography': 'Photography',
        'Cinematic': 'Cinematic',
        'Anime/Manga': 'Anime & Manga',
        '3D Render': '3D Render',
        'Pixel Art': 'Pixel Art',
        'Cyberpunk': 'Cyberpunk',
        'Minimalism': 'Minimalism',
        'Portrait': 'Portrait',
        'Food': 'Food',
        'Nature': 'Nature & Landscape',
        'Architecture': 'Architecture',

        // NEW Art Style Categories
        'Watercolor': 'Watercolor',
        'Oil Painting': 'Oil Painting',
        'Sketch': 'Sketch & Line Art',
        'Ink Art': 'Ink Art',
        'Illustration': 'Illustration',
        'Chibi': 'Chibi & Cute',
        'Isometric': 'Isometric',
        'Retro/Vintage': 'Retro & Vintage',

        // NEW Subject Categories
        'Character': 'Character Design',
        'Animal': 'Animal & Creature',
        'Vehicle': 'Vehicle',
        'Fashion': 'Fashion',
        'Typography': 'Typography & Text',
        'Abstract': 'Abstract & Pattern',
        'Diagram': 'Diagram & Chart',
        'Cityscape': 'Cityscape & Urban',

        // NEW Use Case Categories
        'Poster': 'Poster & Flyer',
        'Logo/Branding': 'Logo & Branding',
        'Book Cover': 'Book Cover',
        'UI/UX Design': 'UI/UX Design',
        'Meme': 'Meme & Humor',
        'Professional': 'Professional',
        'Fantasy': 'Fantasy',
        'Historical': 'Historical',

        // Category Groups
        'Personal & Social': 'Personal & Social',
        'Marketing & Business': 'Marketing & Business',
        'Content Creation': 'Content Creation',
        'Creative & Art': 'Creative & Art',
        'Technical & Design': 'Technical & Design',
        'Photography & Realism': 'Photography & Realism',
        'Art Styles': 'Art Styles',
        'Subjects': 'Subjects',
        'Use Cases': 'Use Cases',
        'Themes': 'Themes'
    },

    vi: {
        // Existing categories
        'All': 'Tất cả',
        'Profile/Avatar': 'Ảnh đại diện',
        'Social Media': 'Mạng xã hội',
        'Infographic': 'Đồ họa thông tin',
        'YouTube Thumbnail': 'Thumbnail YouTube',
        'Comic/Storyboard': 'Truyện tranh',
        'Product Marketing': 'Marketing sản phẩm',
        'E-commerce': 'Thương mại điện tử',
        'Game Asset': 'Tài sản game',
        'Photography': 'Nhiếp ảnh',
        'Cinematic': 'Điện ảnh',
        'Anime/Manga': 'Anime & Manga',
        '3D Render': 'Kết xuất 3D',
        'Pixel Art': 'Nghệ thuật Pixel',
        'Cyberpunk': 'Cyberpunk',
        'Minimalism': 'Tối giản',
        'Portrait': 'Chân dung',
        'Food': 'Đồ ăn',
        'Nature': 'Thiên nhiên',
        'Architecture': 'Kiến trúc',

        // NEW Art Style Categories
        'Watercolor': 'Màu nước',
        'Oil Painting': 'Tranh sơn dầu',
        'Sketch': 'Phác thảo',
        'Ink Art': 'Nghệ thuật mực',
        'Illustration': 'Minh họa',
        'Chibi': 'Chibi',
        'Isometric': 'Đẳng cự',
        'Retro/Vintage': 'Cổ điển',

        // NEW Subject Categories
        'Character': 'Nhân vật',
        'Animal': 'Động vật',
        'Vehicle': 'Phương tiện',
        'Fashion': 'Thời trang',
        'Typography': 'Chữ nghệ thuật',
        'Abstract': 'Trừu tượng',
        'Diagram': 'Sơ đồ',
        'Cityscape': 'Đô thị',

        // NEW Use Case Categories
        'Poster': 'Poster',
        'Logo/Branding': 'Logo & Thương hiệu',
        'Book Cover': 'Bìa sách',
        'UI/UX Design': 'Thiết kế UI/UX',
        'Meme': 'Meme',
        'Professional': 'Chuyên nghiệp',
        'Fantasy': 'Kỳ ảo',
        'Historical': 'Lịch sử',

        // Category Groups
        'Personal & Social': 'Cá nhân & Xã hội',
        'Marketing & Business': 'Marketing & Kinh doanh',
        'Content Creation': 'Sáng tạo nội dung',
        'Creative & Art': 'Sáng tạo & Nghệ thuật',
        'Technical & Design': 'Kỹ thuật & Thiết kế',
        'Photography & Realism': 'Nhiếp ảnh & Chân thực',
        'Art Styles': 'Phong cách nghệ thuật',
        'Subjects': 'Chủ đề',
        'Use Cases': 'Ứng dụng',
        'Themes': 'Chủ đề'
    }
};

// Helper function to get category name by language
export function getCategoryName(category, language = 'en') {
    return categoryTranslations[language][category] || category;
}

// Category groups for organized UI
export const categoryGroups = {
    'Personal & Social': [
        'Profile/Avatar',
        'Social Media'
    ],

    'Marketing & Business': [
        'Product Marketing',
        'E-commerce',
        'Poster',
        'Logo/Branding',
        'Professional'
    ],

    'Content Creation': [
        'YouTube Thumbnail',
        'Infographic',
        'Diagram',
        'Book Cover',
        'Meme'
    ],

    'Art Styles': [
        'Illustration',
        'Watercolor',
        'Oil Painting',
        'Sketch',
        'Ink Art',
        'Anime/Manga',
        'Chibi',
        'Pixel Art',
        'Isometric',
        'Retro/Vintage'
    ],

    'Photography & Realism': [
        'Photography',
        'Cinematic',
        'Portrait',
        'Food',
        'Nature',
        'Cityscape'
    ],

    'Technical & Design': [
        '3D Render',
        'Game Asset',
        'UI/UX Design',
        'Architecture'
    ],

    'Subjects': [
        'Character',
        'Animal',
        'Vehicle',
        'Fashion',
        'Typography',
        'Abstract'
    ],

    'Themes': [
        'Cyberpunk',
        'Fantasy',
        'Historical',
        'Minimalism'
    ]
};

// Popular tags for quick filtering
export const popularTags = {
    en: [
        'Portrait', 'Anime', 'Watercolor', '3D', 'Cyberpunk',
        'Food', 'Minimalism', 'Character', 'Photography', 'Cinematic'
    ],
    vi: [
        'Chân dung', 'Anime', 'Màu nước', '3D', 'Cyberpunk',
        'Đồ ăn', 'Tối giản', 'Nhân vật', 'Nhiếp ảnh', 'Điện ảnh'
    ]
};

// Category descriptions for tooltips/help text
export const categoryDescriptions = {
    en: {
        'Profile/Avatar': 'Profile pictures, avatars, and headshots',
        'Watercolor': 'Watercolor painting style artworks',
        'Typography': 'Text art, quote cards, and lettering designs',
        'Character': 'Character designs and original characters',
        'UI/UX Design': 'User interface and web design mockups',
        // Add more as needed
    },
    vi: {
        'Profile/Avatar': 'Ảnh đại diện, avatar và ảnh chân dung',
        'Watercolor': 'Nghệ thuật phong cách màu nước',
        'Typography': 'Nghệ thuật chữ, thẻ trích dẫn và thiết kế chữ',
        'Character': 'Thiết kế nhân vật và nhân vật gốc',
        'UI/UX Design': 'Mockup giao diện người dùng và thiết kế web',
        // Add more as needed
    }
};

// Category icons (using emoji or icon class names)
export const categoryIcons = {
    'Profile/Avatar': '👤',
    'Social Media': '📱',
    'Infographic': '📊',
    'YouTube Thumbnail': '🎬',
    'Comic/Storyboard': '📚',
    'Product Marketing': '🛍️',
    'E-commerce': '🛒',
    'Game Asset': '🎮',
    'Photography': '📷',
    'Cinematic': '🎥',
    'Anime/Manga': '🎌',
    '3D Render': '🎲',
    'Pixel Art': '👾',
    'Cyberpunk': '🌃',
    'Minimalism': '⚪',
    'Food': '🍱',
    'Nature': '🌲',
    'Architecture': '🏛️',

    'Watercolor': '🎨',
    'Oil Painting': '🖼️',
    'Sketch': '✏️',
    'Ink Art': '🖌️',
    'Illustration': '✨',
    'Chibi': '😊',
    'Isometric': '📐',
    'Retro/Vintage': '📻',

    'Character': '🧑',
    'Animal': '🐾',
    'Vehicle': '🚗',
    'Fashion': '👗',
    'Typography': '🔤',
    'Abstract': '🌀',
    'Diagram': '📈',
    'Cityscape': '🏙️',

    'Poster': '🎪',
    'Logo/Branding': '©️',
    'Book Cover': '📖',
    'UI/UX Design': '💻',
    'Meme': '😂',
    'Professional': '💼',
    'Fantasy': '🧙',
    'Historical': '⏳'
};
