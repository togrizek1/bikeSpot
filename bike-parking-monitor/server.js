import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { Buffer } from 'buffer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

/* 1️⃣  serve the React build */
app.use(express.static(path.join(__dirname, 'dist')));

/* 2️⃣  proxy every /api/* request */
app.use('/api', async (req, res) => {
    try {
        const target = req.originalUrl.replace(/^\/api/, '');
        const upstream = await fetch(`https://djx.entlab.hr${target}`, {
            headers: {
                Accept: 'application/vnd.ericsson.m2m.output+json',
                Authorization:
                    'Basic ' +
                    Buffer.from(
                        `${process.env.BIKE_USER}:${process.env.BIKE_PASS}`,
                    ).toString('base64'),
            },
        });

        res.status(upstream.status);
        upstream.body.pipe(res);
    } catch (err) {
        res.status(502).json({ error: err.message });
    }
});

/* 3️⃣  history-fallback for React Router */
app.get('*', (_, res) =>
    res.sendFile(path.join(__dirname, 'dist', 'index.html')),
);

app.listen(PORT, () => console.log(`✔️  server listening on ${PORT}`));
