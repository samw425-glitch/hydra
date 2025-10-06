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
  let topics = [];

  if (csvFile && fs.existsSync(csvFile)) {
    const csvData = fs.readFileSync(csvFile, 'utf8');
    const records = parse(csvData, { columns: true });
    records.forEach(r => {
      topics.push({
        title: r.title,
        source: r.source || 'CSV',
        lang: r.lang || 'en',
      });
    });
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
