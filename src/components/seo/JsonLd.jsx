import { Helmet } from 'react-helmet-async'

export default function JsonLd({ data }) {
  if (!data) return null
  const payload = Array.isArray(data) ? data : [data]
  return (
    <Helmet>
      {payload.map((item, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  )
}
