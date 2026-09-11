import { Link } from 'react-router-dom'
import { Mail, MessageCircle, PawPrint, Phone } from 'lucide-react'
import { STORE } from '../config/store'

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'Dogs', to: '/products/dogs' },
      { label: 'Cats', to: '/products/cats' },
      { label: 'Food', to: '/products/dog-food' },
      { label: 'Toys', to: '/products/toys' },
      { label: 'Accessories', to: '/products/accessories' },
      { label: 'Offers', to: '/offers' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Contact Us', to: '/contact' },
      { label: 'Shipping', to: '/shipping' },
      { label: 'Returns', to: '/returns' },
      { label: 'FAQs', to: '/faq' },
      { label: 'Track Order', to: '/orders' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Blog', to: '/blog' },
      { label: 'Account', to: '/account' },
      { label: 'Wishlist', to: '/wishlist' },
    ],
  },
]

const socialLinks = [
  {
    label: 'Instagram',
    href: STORE.social.instagram,
    path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z',
  },
  {
    label: 'Facebook',
    href: STORE.social.facebook,
    path: 'M14 8h3V5h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z',
  },
  {
    label: 'YouTube',
    href: STORE.social.youtube,
    path: 'M22.5 7.2a3 3 0 0 0-2.1-2.1C18.6 4.5 12 4.5 12 4.5s-6.6 0-8.4.6A3 3 0 0 0 1.5 7.2 31.5 31.5 0 0 0 1 12a31.5 31.5 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.8.6 8.4.6 8.4.6s6.6 0 8.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 23 12a31.5 31.5 0 0 0-.5-4.8zM10 15.2V8.8L15.5 12 10 15.2z',
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500">
                <PawPrint className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-lg font-extrabold">
                  Noah&apos;s Pets
                </span>
                <span className="text-xs text-white/60">
                  Premium care for every pet
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              A modern pet marketplace based in Chennai, Tamil Nadu — premium
              food, toys and accessories delivered across Tamil Nadu.
            </p>
            <p className="mt-3 text-sm text-white/55">
              {STORE.address.line1}, {STORE.address.city},{' '}
              {STORE.address.state} {STORE.address.pincode}
            </p>
            <div className="mt-5 flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-brand-500"
                  aria-label={social.label}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 fill-current"
                    aria-hidden="true"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-bold uppercase tracking-wide text-white">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/65 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">
              Customer Support
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>
                <a
                  href={`mailto:${STORE.email}`}
                  className="inline-flex items-center gap-2 transition hover:text-white"
                >
                  <Mail className="h-4 w-4 text-brand-300" />
                  {STORE.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${STORE.phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-2 transition hover:text-white"
                >
                  <Phone className="h-4 w-4 text-brand-300" />
                  {STORE.phone}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${STORE.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 transition hover:text-white"
                >
                  <MessageCircle className="h-4 w-4 text-brand-300" />
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Noah&apos;s Pets. All rights reserved.</p>
          <p>Delivering across Tamil Nadu · Made for happy pets & happier homes.</p>
        </div>
      </div>
    </footer>
  )
}
