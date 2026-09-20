export const initialAdminSettings = {
  storeName: "Noah's Pets",
  logo: '',
  email: 'noahspets99@gmail.com',
  phone: '+91 9710101045',
  address:
    '35/15, S Mada St, Sarojini Nagar, Kolathur, Chennai, Tamil Nadu 600099',
  currency: 'INR',
  deliveryFee: 49,
  freeDeliveryThreshold: 999,
  minimumOrderAmount: 299,
  taxPercent: 5,
  instagram: 'https://instagram.com/noahspets',
  facebook: 'https://facebook.com/noahspets',
  whatsapp: '+91 9710101045',
  showOutOfStock: true,
  enableReviews: true,
  enableWishlist: true,
  adminEmail: 'noahspets99@gmail.com',
}

export const initialAdminNotifications = [
  {
    id: 'n1',
    title: '5 new orders',
    message: 'You received 5 new orders in the last hour.',
    time: '12 min ago',
    read: false,
    type: 'order',
  },
  {
    id: 'n2',
    title: 'Low stock alert',
    message: '2 products are low in stock and need restocking.',
    time: '34 min ago',
    read: false,
    type: 'stock',
  },
  {
    id: 'n3',
    title: 'New customer review',
    message: 'Priya Nair left a 4-star review on Cat Scratching Post.',
    time: '1 hr ago',
    read: false,
    type: 'review',
  },
  {
    id: 'n4',
    title: 'Coupon expiring soon',
    message: 'CATCARE10 expires in 10 days.',
    time: '3 hr ago',
    read: true,
    type: 'coupon',
  },
  {
    id: 'n5',
    title: 'Product published',
    message: 'Reflective Dog Leash was updated successfully.',
    time: 'Yesterday',
    read: true,
    type: 'product',
  },
]

export const revenueSeries = {
  '7d': [
    { label: 'Mon', revenue: 12400, orders: 18 },
    { label: 'Tue', revenue: 15800, orders: 22 },
    { label: 'Wed', revenue: 11200, orders: 16 },
    { label: 'Thu', revenue: 18600, orders: 28 },
    { label: 'Fri', revenue: 22100, orders: 31 },
    { label: 'Sat', revenue: 25400, orders: 36 },
    { label: 'Sun', revenue: 19350, orders: 27 },
  ],
  '30d': [
    { label: 'W1', revenue: 82000, orders: 110 },
    { label: 'W2', revenue: 91000, orders: 124 },
    { label: 'W3', revenue: 87500, orders: 118 },
    { label: 'W4', revenue: 98400, orders: 132 },
  ],
  '3m': [
    { label: 'Jun', revenue: 286000, orders: 380 },
    { label: 'Jul', revenue: 312000, orders: 410 },
    { label: 'Aug', revenue: 248500, orders: 334 },
  ],
  '6m': [
    { label: 'Mar', revenue: 210000, orders: 290 },
    { label: 'Apr', revenue: 245000, orders: 320 },
    { label: 'May', revenue: 268000, orders: 350 },
    { label: 'Jun', revenue: 286000, orders: 380 },
    { label: 'Jul', revenue: 312000, orders: 410 },
    { label: 'Aug', revenue: 248500, orders: 334 },
  ],
  '1y': [
    { label: 'Sep', revenue: 180000, orders: 240 },
    { label: 'Oct', revenue: 195000, orders: 255 },
    { label: 'Nov', revenue: 220000, orders: 280 },
    { label: 'Dec', revenue: 265000, orders: 340 },
    { label: 'Jan', revenue: 198000, orders: 260 },
    { label: 'Feb', revenue: 205000, orders: 270 },
    { label: 'Mar', revenue: 210000, orders: 290 },
    { label: 'Apr', revenue: 245000, orders: 320 },
    { label: 'May', revenue: 268000, orders: 350 },
    { label: 'Jun', revenue: 286000, orders: 380 },
    { label: 'Jul', revenue: 312000, orders: 410 },
    { label: 'Aug', revenue: 248500, orders: 334 },
  ],
}

export const categoryRevenue = [
  { name: 'Dog', value: 48, amount: 59800 },
  { name: 'Cat', value: 32, amount: 39840 },
  { name: 'Bird', value: 8, amount: 9960 },
  { name: 'Small Pets', value: 7, amount: 8715 },
  { name: 'Other', value: 5, amount: 6225 },
]

export const topSellingProducts = [
  { name: 'Premium Adult Dog Food', sales: 420, revenue: 1049580 },
  { name: 'Clumping Cat Litter 10L', sales: 510, revenue: 458490 },
  { name: 'Interactive Rope Dog Toy', sales: 380, revenue: 151620 },
  { name: 'Premium Indoor Cat Food', sales: 298, revenue: 655302 },
  { name: 'Reflective Dog Leash', sales: 265, revenue: 158735 },
]
