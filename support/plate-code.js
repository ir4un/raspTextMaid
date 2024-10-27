import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

// Define __dirname for ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Function to sanitize and clean input
const cleanText = (text) => {
    return text.replace(/<[^>]*>/g, '').trim(); // Remove any HTML tags and trim whitespace
};

export async function getData() {
    try {
        // Fetch the HTML content from the URL
        const { data: html } = await axios.get("https://www.jpj.my/JPJ_Latest_Number_Plates.htm");

        // Load the HTML into Cheerio
        const $ = cheerio.load(html);
        const regions = {
            Peninsular: [],
            Sarawak: [],
            Sabah: []
        };

        // Target each item1, item2, item3 class container
        $('.grid-container .item1, .grid-container .item2, .grid-container .item3').each((index, element) => {
            // Extract the text and split by line breaks
            const lines = $(element).find('p').html().split('<br>').map(item => item.trim()).filter(item => item !== '');

            let currentRegion = $(element).hasClass('item1') ? 'Peninsular' :
                $(element).hasClass('item2') ? 'Sarawak' :
                    'Sabah'; // Default to 'Sabah' for item3

            // Extract state and plate information
            lines.forEach(line => {
                const match = line.match(/^(.*?)-\s*(.*)$/); // Match the state and plate
                if (match) {
                    const state = cleanText(match[1]); // Clean the state text
                    const plate = cleanText(match[2]); // Clean the plate text
                    regions[currentRegion].push({ state, plate });
                }
            });
        });

        // Sort data within each region by state name
        for (const region in regions) {
            regions[region].sort((a, b) => a.state.localeCompare(b.state));
        }

        // Write data to JSON file
        // fs.writeFileSync(jsonFilePath, JSON.stringify(regions, null, 2));

        return regions;

    } catch (error) {
        console.error("Error fetching or processing data:", error);
    }
}

// Function to fetch the date details
export async function getDate() {
    try {
        const { data: html } = await axios.get("https://www.jpj.my/JPJ_Latest_Number_Plates.htm");
        const $ = cheerio.load(html);

        const dateText = $("p:contains('as on')").text().match(/as on (.+):/);
        return dateText ? dateText[1].trim() : "Date not available";
    } catch (error) {
        console.error("Error fetching date:", error);
        return "Date not available";
    }
}
