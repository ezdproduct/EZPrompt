import React, { useState } from 'react';
import { categoryGroups, categoryTranslations, categoryIcons } from './categoryTranslations';
import './CategoryFilter.css';

/**
 * Enhanced Category Filter Component
 * Supports grouped categories, multi-select, and visual organization
 */
const CategoryFilter = ({
    selectedCategories = ['All'],
    onCategoryChange,
    language = 'vi',
    mode = 'grouped' // 'flat', 'grouped', or 'tags'
}) => {
    const [expandedGroups, setExpandedGroups] = useState(
        Object.keys(categoryGroups).reduce((acc, group) => ({ ...acc, [group]: true }), {})
    );

    const t = categoryTranslations[language];

    const toggleGroup = (groupName) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    const handleCategoryClick = (category) => {
        if (category === 'All') {
            onCategoryChange(['All']);
        } else {
            let newSelected = [...selectedCategories];

            // Remove 'All' if selecting specific category
            if (newSelected.includes('All')) {
                newSelected = [category];
            } else if (newSelected.includes(category)) {
                // Toggle off
                newSelected = newSelected.filter(c => c !== category);
                // If nothing selected, select 'All'
                if (newSelected.length === 0) newSelected = ['All'];
            } else {
                // Add category
                newSelected.push(category);
            }

            onCategoryChange(newSelected);
        }
    };

    // Flat Mode: Simple horizontal list
    if (mode === 'flat') {
        const allCategories = ['All', ...Object.values(categoryGroups).flat()];
        return (
            <div className="category-filter-flat">
                {allCategories.map(cat => (
                    <button
                        key={cat}
                        className={`category-chip ${selectedCategories.includes(cat) ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(cat)}
                    >
                        {categoryIcons[cat] && <span className="cat-icon">{categoryIcons[cat]}</span>}
                        {t[cat] || cat}
                    </button>
                ))}
            </div>
        );
    }

    // Grouped Mode: Collapsible sections
    if (mode === 'grouped') {
        return (
            <div className="category-filter-grouped">
                {/* All button always visible */}
                <div className="category-section">
                    <button
                        className={`category-chip category-all ${selectedCategories.includes('All') ? 'active' : ''}`}
                        onClick={() => handleCategoryClick('All')}
                    >
                        🌟 {t['All']}
                    </button>
                </div>

                {/* Category groups */}
                {Object.entries(categoryGroups).map(([groupName, categories]) => (
                    <div key={groupName} className="category-section">
                        <button
                            className="category-group-header"
                            onClick={() => toggleGroup(groupName)}
                        >
                            <span className="group-title">{t[groupName] || groupName}</span>
                            <span className="group-toggle">
                                {expandedGroups[groupName] ? '▼' : '▶'}
                            </span>
                        </button>

                        {expandedGroups[groupName] && (
                            <div className="category-group-items">
                                {categories.map(cat => {
                                    const isActive = selectedCategories.includes(cat);
                                    const count = 0; // TODO: Get actual count from props

                                    return (
                                        <button
                                            key={cat}
                                            className={`category-item ${isActive ? 'active' : ''}`}
                                            onClick={() => handleCategoryClick(cat)}
                                        >
                                            <span className="cat-icon">{categoryIcons[cat]}</span>
                                            <span className="cat-name">{t[cat] || cat}</span>
                                            {count > 0 && <span className="cat-count">({count})</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    // Tags Mode: Tag cloud style
    if (mode === 'tags') {
        const allCategories = Object.values(categoryGroups).flat();
        // Sort by popularity (you can customize this)
        const sortedCategories = allCategories.sort((a, b) => {
            // For now, just alphabetical. Can add popularity later
            return (t[a] || a).localeCompare(t[b] || b);
        });

        return (
            <div className="category-filter-tags">
                {/* All tag */}
                <button
                    className={`tag-chip tag-all ${selectedCategories.includes('All') ? 'active' : ''}`}
                    onClick={() => handleCategoryClick('All')}
                >
                    {t['All']}
                </button>

                {/* Category tags */}
                {sortedCategories.map(cat => (
                    <button
                        key={cat}
                        className={`tag-chip ${selectedCategories.includes(cat) ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(cat)}
                        title={t[cat] || cat}
                    >
                        {categoryIcons[cat]} {t[cat] || cat}
                    </button>
                ))}
            </div>
        );
    }

    return null;
};

export default CategoryFilter;
