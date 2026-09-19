/** Existing site logo asset (public/favicon.svg). Keeps header/footer mark size stable. */
export default function BrandMark({ className = 'h-9 w-9 sm:h-10 sm:w-10' }) {
  return (
    <img
      src="/logo.jpeg"
      alt=""
      width={40}
      height={40}
      className={`shrink-0 object-contain ${className}`}
    />
  )
}
