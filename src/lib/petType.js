/** Pet = the animal. Category = the product type. These labels are pets, not categories. */
const PET_LABELS = {
  dog: 'Dogs',
  dogs: 'Dogs',
  cat: 'Cats',
  cats: 'Cats',
  bird: 'Birds',
  birds: 'Birds',
  fish: 'Fish',
  rabbit: 'Small Pets',
  rabbits: 'Small Pets',
  'small pet': 'Small Pets',
  'small pets': 'Small Pets',
  reptile: 'Reptiles',
  reptiles: 'Reptiles',
  poultry: 'Poultry',
  primate: 'Primate',
  primates: 'Primate',
  other: 'Other',
}

export function normalizePetType(petType) {
  const key = String(petType ?? '')
    .trim()
    .toLowerCase()
  if (!key) return 'Dogs'
  return PET_LABELS[key] || String(petType).trim()
}

/** True when the value is an animal label (Dogs, Cat, …), not a product type like Dog Food. */
export function isPetLabel(value) {
  const key = String(value ?? '')
    .trim()
    .toLowerCase()
  return Boolean(key && PET_LABELS[key])
}

export function petSlug(petType) {
  return normalizePetType(petType).toLowerCase().replace(/\s+/g, '-')
}

export function productMatchesPet(product, petType) {
  if (!product || !petType) return false
  return normalizePetType(product.petType) === normalizePetType(petType)
}
