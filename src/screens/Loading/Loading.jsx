import styles from './Loading.module.css'

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.dots}>
        <span />
        <span />
        <span />
      </div>
      <p className={styles.text}>Preparando tu cartón...</p>
    </div>
  )
}
