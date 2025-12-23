export interface PastaPreset {
  name: string
  cookingTime: number // in seconds
  category?: string
}

export const pastaPresets: PastaPreset[] = [
  { name: 'spaghetti', cookingTime: 4 * 60 }, // 4 minutes
  { name: 'tagliatelle', cookingTime: 2 * 60 }, // 2 minutes
  { name: 'sedanini', cookingTime: 90 }, // 1.5 minutes
  { name: 'casarecho', cookingTime: 3 * 60 }, // 3 minutes
  { name: 'fusilli', cookingTime: 2 * 60 }, // 2 minutes
  { name: 'bucatini', cookingTime: 3 * 60 }, // 3 minutes
  { name: 'ravioli - brasato', cookingTime: 4 * 60, category: 'ravioli' }, // 4 minutes minimum
  { name: 'ravioli - black truffle', cookingTime: 4 * 60, category: 'ravioli' }, // 4 minutes minimum
  { name: 'ravioli - spinach', cookingTime: 4 * 60, category: 'ravioli' }, // 4 minutes minimum
]

// Ravioli has a range: 4 mins minimum, max 10 mins
export const RAVIOLI_MIN_TIME = 4 * 60 // 4 minutes in seconds
export const RAVIOLI_MAX_TIME = 10 * 60 // 10 minutes in seconds

export const getPastaPreset = (name: string): PastaPreset | undefined => {
  return pastaPresets.find(p => p.name.toLowerCase() === name.toLowerCase())
}

