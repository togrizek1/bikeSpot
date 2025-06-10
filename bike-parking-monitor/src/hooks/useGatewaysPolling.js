// src/hooks/useGatewaysPolling.js
import { useState, useEffect } from 'react';

const API =
    '/api/m2m/data?usr=FER&dgg=FERBikeRacks&latestNCount=1';

function mapGateways(payload) {
    if (!payload?.contentNodes) return {};

    return payload.contentNodes.reduce((acc, node) => {
        const { gateway, sensor } = node.source;
        const status = node.value; // "SLOBODNO" | "ZAUZETO"

        if (!acc[gateway]) {
            acc[gateway] = {
                id: gateway,          // convenience for React keys
                sensors: [],
                counts: { free: 0, taken: 0 },
            };
        }

        acc[gateway].sensors.push({
            id: sensor,
            status,
            updatedAt: node.time,
        });

        if (status === 'ZAUZETO') acc[gateway].counts.taken += 1;
        else if (status === 'SLOBODNO') acc[gateway].counts.free += 1;

        return acc;
    }, {});
}

export function useGatewaysPolling(interval = 10_000) {     // 10 s default
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let timer;

        async function hit() {
            try {
                const res = await fetch(API, {
                    headers: {
                        Accept: 'application/vnd.ericsson.m2m.output+json',
                        Authorization:
                            'Basic ' + btoa('intstv05_bike:ZcX2wMpY59h3LPvr'),
                    },
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                setData(mapGateways(json));
            } catch (e) {
                setError(e);
            } finally {
                timer = setTimeout(hit, interval);     // schedule next round
            }
        }

        hit();                                     // kick-off first run
        return () => clearTimeout(timer);          // clean up on unmount
    }, [interval]);

    return { data, error };
}
