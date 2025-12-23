export interface PastaPreset {
  name: string
  cookingTime: number // in seconds
  category?: string
  imageUrl?: string
  emoji?: string // Fallback emoji if image fails
}

// Using placeholder images - replace with actual pasta images
const getPastaImageUrl = (pastaName: string): string => {
  const baseUrl = import.meta.env.BASE_URL
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return `${cleanBaseUrl}images/pasta/${pastaName}.png`
}


export const pastaPresets: PastaPreset[] = [
  {
    name: 'spaghetti',
    cookingTime: 4 * 60,
    emoji: '🍝',
    imageUrl: getPastaImageUrl('spaghetti')
  },
  {
    name: 'tagliatelle',
    cookingTime: 2 * 60,
    emoji: '🍜',
    imageUrl: getPastaImageUrl('tagliatelle')
  },
  {
    name: 'sedanini',
    cookingTime: 90,
    emoji: '🍝',
    imageUrl: getPastaImageUrl('sedanini')
  },
  {
    name: 'casarecho',
    cookingTime: 3 * 60,
    emoji: '🍝',
    imageUrl: getPastaImageUrl('casarecho')
  },
  {
    name: 'fusilli',
    cookingTime: 2 * 60,
    emoji: '🍝',
    imageUrl: getPastaImageUrl('fusilli')
  },
  {
    name: 'bucatini',
    cookingTime: 3 * 60,
    emoji: '🍝',
    imageUrl: getPastaImageUrl('bucatini')
  },
  {
    name: 'ravioli - brasato',
    cookingTime: 4 * 60,
    category: 'ravioli',
    emoji: '🥟',
    imageUrl: getPastaImageUrl('ravioli-brasato')
  },
  {
    name: 'ravioli - black truffle',
    cookingTime: 4 * 60,
    category: 'ravioli',
    emoji: '🥟',
    imageUrl: getPastaImageUrl('ravioli-black-truffle')
  },
  {
    name: 'ravioli - spinach',
    cookingTime: 4 * 60,
    category: 'ravioli',
    emoji: '🥟',
    imageUrl: getPastaImageUrl('ravioli-spinach')
  },
]

// Ravioli has a range: 4 mins minimum, max 10 mins
export const RAVIOLI_MIN_TIME = 4 * 60 // 4 minutes in seconds
export const RAVIOLI_MAX_TIME = 10 * 60 // 10 minutes in seconds

export const getPastaPreset = (name: string): PastaPreset | undefined => {
  return pastaPresets.find(p => p.name.toLowerCase() === name.toLowerCase())
}

