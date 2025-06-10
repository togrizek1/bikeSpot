/* eslint-env node */
import 'dotenv/config';            // loads .env → process.env
import express from 'express';
import fetch from 'node-fetch';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { Buffer } from 'buffer';

/* ─────────────────────────────────────────────────────────────── */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

/* 1️⃣  Serve the static React build (vite build → dist/) */
app.use(express.static(path.join(__dirname, 'dist')));

/* 2️⃣  Proxy every request that starts with /api/ */
app.use('/api', async (req, res) => {
    try {
        const targetPath = req.originalUrl.replace(/^\/api/, '');
        const upstream = await fetch(`https://djx.entlab.hr${targetPath}`, {
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

/* 3️⃣  History-API fallback for React Router
       (runs ONLY if no previous middleware matched) */
app.use((_, res) =>
    res.sendFile(path.join(__dirname, 'dist', 'index.html')),
);

/* 4️⃣  Start the server */
app.listen(PORT, () =>
    console.log(`✔  Server running on http://localhost:${PORT}`),
);
