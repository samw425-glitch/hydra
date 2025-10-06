import fs from 'fs';
import { parse } from 'csv-parse/sync';

const csvFile = './spawned-containers.csv';
const csvData = fs.readFileSync(csvFile, 'utf-8');

const records = parse(csvData, {
  columns: true,
  skip_empty_lines: true
});

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hydra Spawned Containers</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 2rem; background:#f4f4f4; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
    th, td { padding: 0.8rem; border: 1px solid #ccc; text-align: left; }
    th { background: #222; color: #fff; }
    tr:nth-child(even) { background: #eee; }
  </style>
</head>
<body>
  <h1>Hydra Spawned Containers</h1>
  <table>
    <thead>
      <tr>
        <th>Host Port</th>
        <th>Container Name</th>
        <th>Subdomain</th>
        <th>Image</th>
        <th>Open</th>
      </tr>
    </thead>
    <tbody>
      ${records.map(r => `
        <tr>
          <td>${r.host_port}</td>
          <td>${r.container_name}</td>
          <td>${r.subdomain}</td>
          <td>${r.image}</td>
          <td><a href="http://${r.subdomain}:${r.host_port}" target="_blank">Open</a></td>
        </tr>`).join('')}
    </tbody>
  </table>
</body>
</html>
`;

fs.writeFileSync('./spawned-containers.html', html);
console.log('✅ Webpage generated at spawned-containers.html');
