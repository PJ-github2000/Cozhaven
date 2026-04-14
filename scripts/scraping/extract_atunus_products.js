import fs from 'fs';
import https from 'https';

const sitemaps = [
    'https://atunushome.com/product-sitemap1.xml',
    'https://atunushome.com/product-sitemap2.xml'
];

async function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function decodeHtml(html) {
    if (!html) return '';
    return html.replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&#8211;/g, '-')
        .replace(/&#38;/g, '&')
        .replace(/&#36;/g, '$')
        .replace(/<.*?>/g, '')
        .trim();
}

async function scrape() {
    const allUrls = [];
    try {
        for (const sitemapUrl of sitemaps) {
            console.log(`Fetching sitemap: ${sitemapUrl}`);
            const xml = await fetchUrl(sitemapUrl);
            const locMatches = xml.match(/<loc>(.*?)<\/loc>/g);
            if (locMatches) {
                const urls = locMatches.map(l => l.replace(/<\/?loc>/g, ''));
                allUrls.push(...urls);
            }
        }
    } catch (err) {
        console.error(`Sitemap fetch failed: ${err.message}`);
    }

    if (allUrls.length === 0) {
        allUrls.push('https://atunushome.com/product/modular-cloud-couch-white-boucle/'); // Fallback for testing
    }

    console.log(`Found ${allUrls.length} products. Starting limited scrape (10 URLs)...`);
    const subsetUrls = allUrls.slice(0, 10);
    const products = [];
    const parallelLimit = 6;

    for (let i = 0; i < subsetUrls.length; i += parallelLimit) {
        const chunk = subsetUrls.slice(i, i + parallelLimit);
        await Promise.all(chunk.map(async (url) => {
            try {
                const html = await fetchUrl(url);

                const nameMatch = html.match(/<meta property="og:title" content="(.*?)"/);
                const name = nameMatch ? decodeHtml(nameMatch[1]) : '';

                const imageMatch = html.match(/<meta property="og:image" content="(.*?)"/);
                const image = imageMatch ? imageMatch[1] : '';

                const descMatch = html.match(/<meta property="og:description" content="(.*?)"/);
                const description = descMatch ? decodeHtml(descMatch[1]) : '';

                // ROBUST PRICE DETECTION
                let price = '';
                let originalPrice = '';

                // Strategy 1: Look for "sale_price" class (common in Atunus theme)
                const saleMatch = html.match(/class="s_a_s_p_sale_price"[\s\S]*?>.*?([\d\.,]+)/);
                if (saleMatch) {
                    price = saleMatch[1].replace(/,/g, '');
                }

                // Strategy 2: Look for regular price
                const regMatch = html.match(/class="s_a_s_p_regular_price"[\s\S]*?>.*?([\d\.,]+)/);
                if (regMatch) {
                    originalPrice = regMatch[1].replace(/,/g, '');
                }

                // Strategy 3: Standard WooCommerce price
                if (!price) {
                    const wooMatch = html.match(/<ins>.*?amount">.*?([\d\.,]+)<\/bdi>/) ||
                        html.match(/amount">.*?([\d\.,]+)<\/bdi>/) ||
                        html.match(/Price:.*?\$([\d\.,]+)/);
                    if (wooMatch) price = wooMatch[1].replace(/,/g, '');
                }

                // Strategy 4: Meta Price
                if (!price) {
                    const metaPrice = html.match(/property="product:price:amount" content="(.*?)"/) ||
                        html.match(/name="twitter:data1" value="\$([\d\.,]+)"/);
                    if (metaPrice) price = metaPrice[1].replace(/,/g, '');
                }

                // Strategy 5: Price range - grab the lowest
                if (!price) {
                    const rangeMatch = html.match(/\$([\d\.,]+)\s*&ndash;\s*\$([\d\.,]+)/);
                    if (rangeMatch) price = rangeMatch[1].replace(/,/g, '');
                }

                // --- NEW TECHNICAL FIELDS EXTRACTION ---
                const softnessMatch = html.match(/(?:Softness|Softness Level|Cushion):?\s*(Plush|Cloud-like|Medium|Firm|Soft)/i);
                const softnessMap = { 'firm': 1, 'medium': 2, 'plush': 3, 'cloud': 4, 'ethereal': 5 };
                let softness_val = softnessMatch ? (softnessMap[softnessMatch[1].toLowerCase()] || 3) : null;

                const warrantyMatch = html.match(/(\d+)[\s-]*year\s*manufacturer\s*warranty/i);
                const warranty = warrantyMatch ? parseInt(warrantyMatch[1]) : null;

                const shipsMatch = html.match(/ships\s*in\s*(\d+-\d+|\d+)\s*days/i) || html.match(/delivery:?\s*(\d+-\d+|\d+)\s*days/i);
                const ships = shipsMatch ? shipsMatch[1] : null;

                const heightMatch = html.match(/Seat\s*Height:?\s*([\d\.]+(?:\"|in|inch))/i);
                const seatHeight = heightMatch ? heightMatch[1] : null;

                const videoMatch = html.match(/iframe.*?src=["']((?:https?:)?\/\/www\.youtube\.com\/embed\/.*?)["']/i);
                const video = videoMatch ? videoMatch[1] : null;

                const diagramMatch = html.match(/class="s_a_s_p_i_c_p_specifications_image"[\s\S]*?src=["'](.*?)["']/i);
                const diagram = diagramMatch ? diagramMatch[1] : null;

                const careMatch = html.match(/Maintenance:?\s*([\s\S]*?)(?=<|$)/i);
                const care = careMatch ? decodeHtml(careMatch[1]) : null;

                if (name && name !== 'Atunus Home') {
                    products.push({
                        id: `atunus-${Math.random().toString(36).substr(2, 9)}`,
                        product_name: name,
                        category: "Designer Collection",
                        price: price || "0",
                        original_price: originalPrice || price || "0",
                        image: image,
                        description: decodeHtml(description),
                        url: url,
                        is_atunus: true,
                        // Enrichment fields
                        softness_level: softness_val,
                        warranty_years: warranty,
                        ships_in_days: ships,
                        seat_height: seatHeight,
                        assembly_video_url: video,
                        dimensional_image_url: diagram,
                        care_instructions: care
                    });
                }
            } catch (err) {
            }
        }));
        if (i % 30 === 0) console.log(`Progress: ${i}/${allUrls.length}...`);
    }

    console.log(`Scraped ${products.length} products. Saving...`);
    fs.writeFileSync('atunus_products.json', JSON.stringify(products, null, 4));
}

scrape();
