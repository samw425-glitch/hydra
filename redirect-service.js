import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 4005;

app.use(morgan('dev'));
app.use(cookieParser());

// --- 40 ID → Affiliate URL mappings ---
const redirects = [
  { id: '1', url: 'https://affiliate1.com?utm_source=hydra' },
  { id: '2', url: 'https://affiliate2.com?utm_source=hydra' },
  { id: '3', url: 'https://affiliate3.com?utm_source=hydra' },
  { id: '4', url: 'https://affiliate4.com?utm_source=hydra' },
  { id: '5', url: 'https://affiliate5.com?utm_source=hydra' },
  { id: '6', url: 'https://affiliate6.com?utm_source=hydra' },
  { id: '7', url: 'https://affiliate7.com?utm_source=hydra' },
  { id: '8', url: 'https://affiliate8.com?utm_source=hydra' },
  { id: '9', url: 'https://affiliate9.com?utm_source=hydra' },
  { id: '10', url: 'https://affiliate10.com?utm_source=hydra' },
  { id: '11', url: 'https://affiliate11.com?utm_source=hydra' },
  { id: '12', url: 'https://affiliate12.com?utm_source=hydra' },
  { id: '13', url: 'https://affiliate13.com?utm_source=hydra' },
  { id: '14', url: 'https://affiliate14.com?utm_source=hydra' },
  { id: '15', url: 'https://affiliate15.com?utm_source=hydra' },
  { id: '16', url: 'https://affiliate16.com?utm_source=hydra' },
  { id: '17', url: 'https://affiliate17.com?utm_source=hydra' },
  { id: '18', url: 'https://affiliate18.com?utm_source=hydra' },
  { id: '19', url: 'https://affiliate19.com?utm_source=hydra' },
  { id: '20', url: 'https://affiliate20.com?utm_source=hydra' },
  { id: '21', url: 'https://affiliate21.com?utm_source=hydra' },
  { id: '22', url: 'https://affiliate22.com?utm_source=hydra' },
  { id: '23', url: 'https://affiliate23.com?utm_source=hydra' },
  { id: '24', url: 'https://affiliate24.com?utm_source=hydra' },
  { id: '25', url: 'https://affiliate25.com?utm_source=hydra' },
  { id: '26', url: 'https://affiliate26.com?utm_source=hydra' },
  { id: '27', url: 'https://affiliate27.com?utm_source=hydra' },
  { id: '28', url: 'https://affiliate28.com?utm_source=hydra' },
  { id: '29', url: 'https://affiliate29.com?utm_source=hydra' },
  { id: '30', url: 'https://affiliate30.com?utm_source=hydra' },
  { id: '31', url: 'https://affiliate31.com?utm_source=hydra' },
  { id: '32', url: 'https://affiliate32.com?utm_source=hydra' },
  { id: '33', url: 'https://affiliate33.com?utm_source=hydra' },
  { id: '34', url: 'https://affiliate34.com?utm_source=hydra' },
  { id: '35', url: 'https://affiliate35.com?utm_source=hydra' },
  { id: '36', url: 'https://affiliate36.com?utm_source=hydra' },
  { id: '37', url: 'https://affiliate37.com?utm_source=hydra' },
  { id: '38', url: 'https://affiliate38.com?utm_source=hydra' },
  { id: '39', url: 'https://affiliate39.com?utm_source=hydra' },
  { id: '40', url: 'https://affiliate40.com?utm_source=hydra' },
];

// --- Helper for click tracking ---
function trackClick(req, res, redirectId) {
  const ip = req.ip;
  const userAgent = req.headers['user-agent'] || '';
  const cookies = req.cookies;
  const utm_source = req.query.utm_source || 'none';
  const clickId = uuidv4();

  console.log(`CLICK TRACKED: ${clickId}`, {
    redirectId,
    ip,
    userAgent,
    cookies,
    utm_source,
  });

  res.cookie('hydra_click', clickId, { maxAge: 24*60*60*1000, httpOnly: true });
}

// --- Redirect endpoint ---
app.get('/r/:id', (req, res) => {
  const id = req.params.id;
  const entry = redirects.find(r => r.id === id);

  if (!entry) {
    return res.status(404).send('Redirect ID not found');
  }

  trackClick(req, res, id);
  res.redirect(entry.url);
});

app.listen(PORT, () => console.log(`Redirect service running on port ${PORT}`));
