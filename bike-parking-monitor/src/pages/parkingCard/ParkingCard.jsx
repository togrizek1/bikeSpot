import { Link } from 'react-router-dom';
import styles from './ParkingCard.module.css';

export default function ParkingCard({ parking }) {
  const { id, street, freeSpots, capacity } = parking;
  const isFree = freeSpots > 0;

  return (
    <Link
      to={`/parking/${id}`}
      className={`${styles.card} ${isFree ? styles.free : styles.full}`}
    >
      <h2 className={styles.title}>{street}</h2>
      <p className={styles.subtitle}>
        {isFree ? `${freeSpots} / ${capacity} spots free` : 'Full'}
      </p>
    </Link>
  );
}
