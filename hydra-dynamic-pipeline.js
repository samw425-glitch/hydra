import { spawnContainer } from './hydra-spawner.js';
import { fetchAllTopics } from './topic-fetcher.js';

const BASE_PORT = 4000;
const MAX_CONTAINERS = 10;

function topicToEnv(topic) {
  return {
    TOPIC_TITLE: topic.title,
    TOPIC_SOURCE: topic.source,
    TOPIC_LANG: topic.lang,
    TEMPLATE_TYPE: topic.template || 'landing',
  };
}

async function spawnTopics(topics) {
  const spawned = [];
  for (let i = 0; i < Math.min(topics.length, MAX_CONTAINERS); i++) {
    const topic = topics[i];
    const env = topicToEnv(topic);
    const { containerId, hostPort } = await spawnContainer('hydra-click-tracker:latest', env, BASE_PORT + i, `./templates/landing/${topic.title}`);
    spawned.push({ topic, containerId, hostPort, url: `http://localhost:${hostPort}` });
  }
  return spawned;
}

(async () => {
  const topics = await fetchAllTopics({ csvFile: './topics.csv' });
  const containers = await spawnTopics(topics);
  containers.forEach(c => console.log(`✅ ${c.topic.title} -> ${c.url}`));
})();
