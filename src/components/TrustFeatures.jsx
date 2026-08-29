import { HeartHandshake, Lock, RotateCcw, Truck } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Quick delivery to your doorstep',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    description: 'Safe and secure checkout',
  },
  {
    icon: HeartHandshake,
    title: 'Pet First',
    description: 'Products selected with pets in mind',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: 'Simple hassle-free returns',
  },
]

export default function TrustFeatures() {
  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-surface p-4 sm:gap-4 sm:p-6 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-start gap-2 rounded-xl bg-white p-4 shadow-card sm:flex-row sm:items-center sm:gap-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-ink">{title}</h3>
                <p className="mt-0.5 text-xs text-muted">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
