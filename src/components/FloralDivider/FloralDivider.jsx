import styles from './FloralDivider.module.css'

export default function FloralDivider({ position = 'top' }) {
  return (
    <div
      className={styles.wrapper}
      style={position === 'bottom' ? { transform: 'scaleY(-1)' } : undefined}
    >
      <svg viewBox="0 0 400 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {/* Tallo central */}
        <line x1="200" y1="0" x2="200" y2="58" stroke="#9aab8a" strokeWidth="1" opacity="0.65"/>

        {/* Ramas izquierda */}
        <path d="M 200 18 Q 178 28 158 33" stroke="#9aab8a" strokeWidth="0.9" fill="none" opacity="0.6"/>
        <path d="M 200 33 Q 168 44 138 44" stroke="#7a8c6e" strokeWidth="0.9" fill="none" opacity="0.55"/>
        <path d="M 200 48 Q 172 60 148 65" stroke="#9aab8a" strokeWidth="0.7" fill="none" opacity="0.5"/>

        {/* Ramas derecha */}
        <path d="M 200 18 Q 222 28 242 33" stroke="#9aab8a" strokeWidth="0.9" fill="none" opacity="0.6"/>
        <path d="M 200 33 Q 232 44 262 44" stroke="#7a8c6e" strokeWidth="0.9" fill="none" opacity="0.55"/>
        <path d="M 200 48 Q 228 60 252 65" stroke="#9aab8a" strokeWidth="0.7" fill="none" opacity="0.5"/>

        {/* Hojas izquierda */}
        <ellipse cx="151" cy="33" rx="13" ry="5" transform="rotate(-22 151 33)" fill="#7a8c6e" opacity="0.7"/>
        <ellipse cx="165" cy="25" rx="9" ry="4" transform="rotate(-38 165 25)" fill="#9aab8a" opacity="0.6"/>
        <ellipse cx="128" cy="43" rx="15" ry="5.5" transform="rotate(-10 128 43)" fill="#9aab8a" opacity="0.65"/>
        <ellipse cx="143" cy="56" rx="10" ry="4" transform="rotate(-28 143 56)" fill="#7a8c6e" opacity="0.55"/>
        <ellipse cx="148" cy="67" rx="11" ry="4.5" transform="rotate(-16 148 67)" fill="#9aab8a" opacity="0.5"/>
        <ellipse cx="112" cy="37" rx="8" ry="3.5" transform="rotate(-42 112 37)" fill="#c4a882" opacity="0.48"/>
        <ellipse cx="95" cy="48" rx="10" ry="4" transform="rotate(-8 95 48)" fill="#7a8c6e" opacity="0.4"/>

        {/* Hojas derecha (espejo) */}
        <ellipse cx="249" cy="33" rx="13" ry="5" transform="rotate(22 249 33)" fill="#7a8c6e" opacity="0.7"/>
        <ellipse cx="235" cy="25" rx="9" ry="4" transform="rotate(38 235 25)" fill="#9aab8a" opacity="0.6"/>
        <ellipse cx="272" cy="43" rx="15" ry="5.5" transform="rotate(10 272 43)" fill="#9aab8a" opacity="0.65"/>
        <ellipse cx="257" cy="56" rx="10" ry="4" transform="rotate(28 257 56)" fill="#7a8c6e" opacity="0.55"/>
        <ellipse cx="252" cy="67" rx="11" ry="4.5" transform="rotate(16 252 67)" fill="#9aab8a" opacity="0.5"/>
        <ellipse cx="288" cy="37" rx="8" ry="3.5" transform="rotate(42 288 37)" fill="#c4a882" opacity="0.48"/>
        <ellipse cx="305" cy="48" rx="10" ry="4" transform="rotate(8 305 48)" fill="#7a8c6e" opacity="0.4"/>

        {/* Detalles dorados */}
        <circle cx="158" cy="33" r="2.5" fill="#b8935a" opacity="0.65"/>
        <circle cx="138" cy="44" r="2" fill="#c4a882" opacity="0.6"/>
        <circle cx="148" cy="65" r="2" fill="#b8935a" opacity="0.55"/>
        <circle cx="242" cy="33" r="2.5" fill="#b8935a" opacity="0.65"/>
        <circle cx="262" cy="44" r="2" fill="#c4a882" opacity="0.6"/>
        <circle cx="252" cy="65" r="2" fill="#b8935a" opacity="0.55"/>
        <circle cx="200" cy="58" r="3" fill="#c4a882" opacity="0.7"/>
      </svg>
    </div>
  )
}
