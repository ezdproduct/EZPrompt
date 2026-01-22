
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const README_PATH = path.join(__dirname, '../Read.md');
const OUTPUT_CSV = path.join(__dirname, '../public/categories/featured.csv');

async function parseReadme() {
    if (!fs.existsSync(README_PATH)) {
        console.error("Read.md not found!");
        return;
    }

    const content = fs.readFileSync(README_PATH, 'utf8');
    const lines = content.split('\n');
    const prompts = [];

    let currentPrompt = null;
    let mode = null; // 'description', 'prompt', 'images', 'details'
    let fullDescription = [];
    let fullPromptCode = [];

    // simple state machine
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.match(/^### No\. \d+:/)) {
            // Save previous prompt if exists
            if (currentPrompt) {
                currentPrompt.description = fullDescription.join(' ').trim();
                currentPrompt.content = fullPromptCode.join('\n').trim();
                prompts.push(currentPrompt);
            }

            // Start new prompt
            const titleMatch = line.match(/^### No\. \d+: (.*)/);
            currentPrompt = {
                id: prompts.length + 1,
                title: titleMatch ? titleMatch[1].trim() : 'Untitled',
                description: '',
                content: '',
                sourceMedia: [],
                author: { name: 'Unknown' },
                sourceLink: '',
                keywords: ''
            };
            fullDescription = [];
            fullPromptCode = [];
            mode = null;
            continue;
        }

        if (!currentPrompt) continue;

        if (line.includes('#### 📖 Mô tả')) {
            mode = 'description';
            continue;
        } else if (line.includes('#### 📝 Câu lệnh')) {
            mode = 'prompt_start'; // wait for code block
            continue;
        } else if (line.includes('#### 🖼️ Hình ảnh được tạo')) {
            mode = 'images';
            continue;
        } else if (line.includes('#### 📌 Chi tiết')) {
            mode = 'details';
            continue;
        }

        // Processing based on mode
        if (mode === 'description') {
            if (line && !line.startsWith('#')) {
                fullDescription.push(line);
            }
        } else if (mode === 'prompt_start') {
            if (line.startsWith('```')) {
                mode = 'prompt_content';
            }
        } else if (mode === 'prompt_content') {
            if (line.startsWith('```')) {
                mode = null; // End of prompt block
            } else {
                fullPromptCode.push(lines[i]); // Keep original indentation
            }
        } else if (mode === 'images') {
            // Check for markdown image or html img tag
            const mdImg = line.match(/!\[.*?\]\(([^)\s]+)(?:.*)?\)/); // Match url before space or closing paren
            const htmlImg = line.match(/<img[^>]+src="([^"]+)"/); // Match content inside src quotes

            if (mdImg) {
                currentPrompt.sourceMedia.push(mdImg[1]);
            } else if (htmlImg) {
                currentPrompt.sourceMedia.push(htmlImg[1]);
            }
        } else if (mode === 'details') {
            const authorMatch = line.match(/- \*\*Tác giả:\*\* \[(.*)\]\((.*)\)/);
            const sourceMatch = line.match(/- \*\*Nguồn:\*\* \[(.*)\]\((.*)\)/);

            if (authorMatch) {
                currentPrompt.author = JSON.stringify({ name: authorMatch[1], url: authorMatch[2] });
            } else if (line.includes('**Tác giả:**')) {
                // Fallback text only
                const textMatch = line.match(/- \*\*Tác giả:\*\* (.*)/);
                if (textMatch) currentPrompt.author = JSON.stringify({ name: textMatch[1] });
            }

            if (sourceMatch) {
                currentPrompt.sourceLink = sourceMatch[2];
            }
        }
    }

    // Push last prompt
    if (currentPrompt) {
        currentPrompt.description = fullDescription.join(' ').trim();
        currentPrompt.content = fullPromptCode.join('\n').trim();
        prompts.push(currentPrompt);
    }

    console.log(`Extracted ${prompts.length} prompts.`);

    // Convert sourceMedia array to JSON string for CSV
    const csvData = prompts.map(p => ({
        ...p,
        sourceMedia: JSON.stringify(p.sourceMedia)
    }));

    // Write CSV
    const csv = Papa.unparse(csvData);
    fs.writeFileSync(OUTPUT_CSV, csv);
    console.log(`Saved to ${OUTPUT_CSV}`);
}

parseReadme();
