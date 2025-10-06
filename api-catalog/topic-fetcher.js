// topic-fetcher.js
import fs from 'fs';
import { parse } from 'csv-parse/sync'; // ✅ Correct ESM import

/**
 * Fetch all topics from a CSV file
 * @param {Object} options
 * @param {string} options.csvFile - path to CSV file
 * @returns {Array<Object>} topics
 */
export async function fetchAllTopics({ csvFile }) {
  const topics = [];

  if (csvFile && fs.existsSync(csvFile)) {
    try {
      const csvData = fs.readFileSync(csvFile, 'utf8');
      const records = parse(csvData, { columns: true });

      for (const r of records) {
        topics.push({
          title: r.title,
          source: r.source || 'CSV',
          lang: r.lang || 'en',
        });
      }
    } catch (err) {
      console.error(`Error parsing CSV file: ${err.message}`);
    }
  } else {
    console.warn(`CSV file not found: ${csvFile}`);
  }

  return topics;
}

// CLI test
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const topics = await fetchAllTopics({ csvFile: './topics.csv' });
    console.log(topics);
  })();
}
