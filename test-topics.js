// api-catalog/topic-fetcher.js
import fs from 'fs';
import path from 'path';
import csvParse from 'csv-parse/lib/sync';

// CSV + Placeholder API fetcher
export async function fetchAllTopics({ csvFile }) {
  let topics = [];

  if (csvFile && fs.existsSync(csvFile)) {
    const csvData = fs.readFileSync(csvFile, 'utf8');
    const records = csvParse(csvData, { columns: true });
    records.forEach(r => topics.push({ title: r.title, source: 'CSV', lang: r.lang || 'en' }));
  }

  // TODO: Extend with YouTube / Google Trends API

  return topics;
}

// Self-test: automatically run if this file is executed directly
if (process.argv[1].endsWith('topic-fetcher.js')) {
  (async () => {
    const csvPath = path.resolve('./api-catalog/topics.csv');
    const topics = await fetchAllTopics({ csvFile: csvPath });
    console.log('Fetched topics:', topics);
  })();
}
