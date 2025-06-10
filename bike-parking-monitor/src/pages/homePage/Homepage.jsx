// src/pages/HomePage/HomePage.jsx
import ParkingCard from '../parkingCard/ParkingCard.jsx';
import { useGatewaysPolling } from '../../hooks/useGatewaysPolling.js';
import styles from './HomePage.module.css';

export default function HomePage() {
  // poll every 10 000 ms (10 s)
  const { data: gateways, error } = useGatewaysPolling(10_000);

  /* loading & error states ------------------------------------------ */
  if (error)     return <p style={{ color: 'red' }}>Error: {error.message}</p>;
  if (!gateways) return <p className={styles.loading}>Loading…</p>;

  const gatewayList = Object.values(gateways);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>Bike Parking – FER 🚵‍♂️</h1>

      <div className={styles.cards}>
        {gatewayList.map((g) => (
          <ParkingCard
            key={g.id}
            parking={{
              id: g.id,
              street: g.id.replace('FERBikeRack-', 'Rack '),
              capacity: g.counts.free + g.counts.taken,
              freeSpots: g.counts.free,
              takenSpots: g.counts.taken,
              updatedAt: g.sensors[0]?.updatedAt,
            }}
          />
        ))}
      </div>
    </div>
  );
}
