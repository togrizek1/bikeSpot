// src/pages/ParkingPage/ParkingPage.jsx
import { useParams, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './ParkingPage.module.css';

export default function ParkingPage() {
  const { id } = useParams();
  const location = useLocation();

  const [parking, setParking] = useState(location.state?.parking || null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (parking) return;

    async function fetchGateway() {
      try {
        const url = `/api/m2m/data?usr=FER&dgg=FERBikeRacks&dgw=${id}&latestNCount=1`;
        const res = await fetch(url, {
          headers: {
            Accept: 'application/vnd.ericsson.m2m.output+json',
            Authorization: 'Basic ' + btoa('intstv05_bike:ZcX2wMpY59h3LPvr'),
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        setParking({
          id,
          street: id,
          counts: json.contentNodes.reduce(
            (acc, n) => {
              if (n.value === 'SLOBODNO') acc.free += 1;
              else if (n.value === 'ZAUZETO') acc.taken += 1;
              return acc;
            },
            { free: 0, taken: 0 }
          ),
          sensors: json.contentNodes.map((n) => ({
            id: n.source.sensor,
            status: n.value,
            updatedAt: n.time,
          })),
          capacity: json.contentNodes.length,
        });
      } catch (e) {
        setErr(e);
      }
    }

    fetchGateway();
  }, [id, parking]);

  if (err) return <p style={{ color: 'red' }}>Error: {err.message}</p>;
  if (!parking) return <p className={styles.loading}>Loading…</p>;

  const { street, counts, capacity, sensors } = parking;
  const isFree = counts.free > 0;

  return (
    <div className={styles.wrapper}>
      <Link className={styles.back} to="/">← Back</Link>
      <h1 className={styles.title}>{street}</h1>

      <p className={styles.status}>
        <span className={isFree ? styles.free : styles.full}>
          {isFree ? `${counts.free}/${capacity} free` : 'Full'}
        </span>
      </p>

      <h2 className={styles.subtitle}>Per-sensor view</h2>
      <ul className={styles.list}>
        {sensors.map((s) => (
          <li
          key={s.id}
          className={`${styles.item} ${
            s.status === 'SLOBODNO' ? styles.freeBorder : styles.takenBorder
          }`}
        >
            <span className={styles.sensorId}>{s.id}</span>
            <span
              className={
                s.status === 'SLOBODNO' ? styles.badgeFree : styles.badgeTaken
              }
            >
              {s.status === 'SLOBODNO' ? 'FREE' : 'TAKEN'}
            </span>
            <span className={styles.time}>
              {new Date(s.updatedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
