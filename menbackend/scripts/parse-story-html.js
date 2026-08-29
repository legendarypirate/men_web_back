#!/usr/bin/env node
/**
 * Parse Claude Design "Insight Story" HTML exports into article seed data.
 * Usage: node scripts/parse-story-html.js /path/to/story.html ...
 *        node scripts/parse-story-html.js  (defaults to ~/Downloads/*-story*.html)
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_FILES = [
  'hlamidia-story.html',
  'zag-huiten-story-v2.html',
  'hpv-story.html',
  'hdhv-story.html',
  'gerpes-story.html',
  'gepatit-b-story.html',
  'trihomoniaz-story.html',
  'mikoplazma-story.html',
];

const TITLE_BY_FILE = {
  'hlamidia-story.html': 'Хламидиа',
  'zag-huiten-story-v2.html': 'Заг хүйтэн',
  'hpv-story.html': 'HPV',
  'hdhv-story.html': 'ХДХВ',
  'gerpes-story.html': 'Герпес',
  'gepatit-b-story.html': 'Гепатит B',
  'trihomoniaz-story.html': 'Трихомониаз',
  'mikoplazma-story.html': 'Микоплазма',
};

const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&h=1400',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&h=1400',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=900&h=1400',
  'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=900&h=1400',
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&h=1400',
  'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=900&h=1400',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&h=1400',
  'https://images.unsplash.com/photo-1584036561561-d466889a5579?auto=format&fit=crop&w=900&h=1400',
];

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .trim();
}

function extractClassText(block, className) {
  const re = new RegExp(`class="${className}"[^>]*>([\\s\\S]*?)<\\/div>`, 'i');
  const m = block.match(re);
  return m ? stripHtml(m[1]) : '';
}

function splitHeadline(headline) {
  const lines = headline.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    const words = lines[0]?.split(/\s+/) || [];
    if (words.length <= 3) return { line2: lines[0] || null, line3: null };
    const mid = Math.ceil(words.length / 2);
    return {
      line2: words.slice(0, mid).join(' ').toUpperCase(),
      line3: words.slice(mid).join(' ').toUpperCase(),
    };
  }
  return {
    line2: lines[0].toUpperCase(),
    line3: lines.slice(1).join(' ').toUpperCase(),
  };
}

function parseStoryHtml(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const m = html.match(/<script type="application\/json" id="appifact-doc">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`Missing appifact-doc in ${filePath}`);
  const doc = JSON.parse(m[1]);
  const main = doc.content?.files?.['Main.dc.html'];
  if (!main) throw new Error(`Missing Main.dc.html in ${filePath}`);

  const slideBlocks = [...main.matchAll(/<sc-if value="\{\{is(\d+)\}\}"[\s\S]*?<\/sc-if>/g)];
  const slides = slideBlocks.map((match) => {
    const block = match[0];
    const idx = Number(match[1]);
    const eyebrow = extractClassText(block, 'eyebrow').replace(/^·\s*/, '').trim();
    const headline = extractClassText(block, 'headline');
    const body = extractClassText(block, 'body-text');
    const sourceMatch = block.match(/class="source-title"[^>]*>([\s\S]*?)<\/div>[\s\S]*?class="source-pub"[^>]*>([\s\S]*?)<\/div>/i)
      || block.match(/class="source"[^>]*>([\s\S]*?)<\/div>/i);
    let sourceTitle = '';
    let sourcePublisher = '';
    if (sourceMatch) {
      if (sourceMatch.length >= 3 && sourceMatch[2] != null) {
        sourceTitle = stripHtml(sourceMatch[1]);
        sourcePublisher = stripHtml(sourceMatch[2]);
      } else {
        const lines = stripHtml(sourceMatch[1]).split('\n').filter(Boolean);
        sourceTitle = lines[0] || '';
        sourcePublisher = lines.slice(1).join(' · ') || '';
      }
    }
    const fullBody = body || '';
    const { line2, line3 } = splitHeadline(headline);

    if (idx === 0) {
      return {
        isCover: true,
        accentLine: eyebrow.split('·').pop()?.trim().toUpperCase() || eyebrow.toUpperCase() || null,
        line2: headline.replace(/\n/g, ' ').toUpperCase() || null,
        line3: body || null,
      };
    }

    return {
      isCover: false,
      accentLine: eyebrow.toUpperCase() || String(idx),
      line2: line2 || headline.toUpperCase() || null,
      line3: line3 || null,
      body: fullBody || body || headline,
      sourceTitle: sourceTitle || null,
      sourcePublisher: sourcePublisher || null,
    };
  });

  const cover = slides.find((s) => s.isCover);
  return {
    excerpt: cover?.line3 || slides[1]?.body?.split('\n')[0] || '',
    slides,
  };
}

function buildArticle(filePath, index) {
  const basename = path.basename(filePath);
  const title = TITLE_BY_FILE[basename] || basename.replace('.html', '');
  const parsed = parseStoryHtml(filePath);
  const imageUrl = IMAGE_POOL[index % IMAGE_POOL.length];

  const storySlides = parsed.slides.map((slide) => ({
    ...slide,
    imageUrl: '',
  }));

  const bodyLines = storySlides
    .filter((s) => !s.isCover && s.body)
    .map((s) => `${s.line2 || s.accentLine}: ${s.body.split('\n')[0]}`);

  return {
    category: 'Бэлгийн эрүүл мэнд',
    title,
    excerpt: parsed.excerpt.slice(0, 180),
    body: bodyLines.join('\n'),
    readMinutes: Math.max(3, Math.ceil(storySlides.length * 0.75)),
    tag: 'БЗДХ',
    isNew: true,
    sortOrder: 10 + index,
    published: true,
    featured: false,
    imageUrl,
    storySlides,
  };
}

function main() {
  const inputs =
    process.argv.length > 2
      ? process.argv.slice(2)
      : DEFAULT_FILES.map((f) => path.join(process.env.HOME || '', 'Downloads', f));

  const articles = inputs.map((filePath, index) => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return buildArticle(filePath, index);
  });

  const outPath = path.join(__dirname, '../src/data/sexualHealthStoryArticles.js');
  const content = `// Auto-generated by scripts/parse-story-html.js — do not edit by hand\n\nconst sexualHealthStoryArticles = ${JSON.stringify(articles, null, 2)};\n\nmodule.exports = { sexualHealthStoryArticles };\n`;
  fs.writeFileSync(outPath, content);
  console.log(`Wrote ${articles.length} articles to ${outPath}`);
  articles.forEach((a) => console.log(`  · ${a.title} (${a.storySlides.length} slides)`));
}

main();
