// Utility for rich category emoji mapping and dynamic animation styling

export const PRESET_CATEGORY_EMOJIS = [
  { emoji: '🥞', name: 'Tiffin / Pancakes / Dosa' },
  { emoji: '🍱', name: 'Lunch Box / Thali' },
  { emoji: '🥘', name: 'Andhra Meals / Curry' },
  { emoji: '🍿', name: 'Snacks / Bites' },
  { emoji: '🍗', name: 'Biryani / Chicken' },
  { emoji: '🧆', name: 'Vada / Falafel / Starters' },
  { emoji: '🍨', name: 'Desserts / Ice Cream' },
  { emoji: '🥤', name: 'Beverages / Cold Drinks' },
  { emoji: '☕', name: 'Chai / Coffee' },
  { emoji: '🍔', name: 'Burger / Fast Food' },
  { emoji: '🍕', name: 'Pizza' },
  { emoji: '🥮', name: 'Sweets / Pastry' },
  { emoji: '🥗', name: 'Healthy / Salad' },
  { emoji: '🌶️', name: 'Spicy Specials' },
  { emoji: '⭐', name: 'Chef Special' },
]

export const CATEGORY_EMOJI_MAP = {
  tiffin: {
    emoji: '🥞',
    altEmoji: '🫓',
    bgGradient: 'from-amber-400/25 via-yellow-400/15 to-orange-400/25',
    glowColor: 'rgba(251, 191, 36, 0.45)',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    animationClass: 'animate-emoji-bounce',
    particles: ['✨', '🥞', '♨️'],
    label: 'Tiffin & Breakfast'
  },
  lunch: {
    emoji: '🍱',
    altEmoji: '🍛',
    bgGradient: 'from-orange-500/25 via-amber-500/15 to-red-400/25',
    glowColor: 'rgba(249, 115, 22, 0.45)',
    badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
    animationClass: 'animate-emoji-float',
    particles: ['✨', '🍱', '🌾'],
    label: 'Lunch Feast'
  },
  meals: {
    emoji: '🥘',
    altEmoji: '🍛',
    bgGradient: 'from-emerald-500/25 via-teal-500/15 to-amber-400/25',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    animationClass: 'animate-emoji-pulse',
    particles: ['♨️', '🍲', '✨'],
    label: 'Andhra Meals'
  },
  snacks: {
    emoji: '🍿',
    altEmoji: '🧆',
    bgGradient: 'from-rose-500/25 via-pink-400/15 to-amber-400/25',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
    animationClass: 'animate-emoji-wiggle',
    particles: ['🍿', '✨', '⚡'],
    label: 'Crispy Snacks'
  },
  biryani: {
    emoji: '🍗',
    altEmoji: '🍲',
    bgGradient: 'from-red-500/25 via-amber-600/15 to-yellow-400/25',
    glowColor: 'rgba(220, 38, 38, 0.45)',
    badgeBg: 'bg-red-100 text-red-900 border-red-300',
    animationClass: 'animate-emoji-bounce',
    particles: ['🔥', '🍗', '✨'],
    label: 'Hot Biryani'
  },
  starters: {
    emoji: '🍢',
    altEmoji: '🧆',
    bgGradient: 'from-purple-500/25 via-pink-500/15 to-amber-400/25',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    animationClass: 'animate-emoji-wiggle',
    particles: ['🍢', '✨', '🔥'],
    label: 'Starters'
  },
  desserts: {
    emoji: '🍨',
    altEmoji: '🍧',
    bgGradient: 'from-pink-400/25 via-rose-300/15 to-purple-400/25',
    glowColor: 'rgba(236, 72, 153, 0.45)',
    badgeBg: 'bg-pink-100 text-pink-900 border-pink-300',
    animationClass: 'animate-emoji-spin-bounce',
    particles: ['✨', '🍨', '🌸'],
    label: 'Sweet Desserts'
  },
  beverages: {
    emoji: '🥤',
    altEmoji: '☕',
    bgGradient: 'from-cyan-400/25 via-sky-400/15 to-blue-400/25',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    animationClass: 'animate-emoji-float',
    particles: ['🧊', '🥤', '✨'],
    label: 'Drinks & Beverages'
  },
  fastfood: {
    emoji: '🍔',
    altEmoji: '🍕',
    bgGradient: 'from-amber-500/25 via-red-400/15 to-orange-400/25',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    animationClass: 'animate-emoji-bounce',
    particles: ['🍔', '⚡', '✨'],
    label: 'Fast Food'
  },
  sweets: {
    emoji: '🥮',
    altEmoji: '🍩',
    bgGradient: 'from-amber-400/25 via-yellow-400/15 to-orange-400/25',
    glowColor: 'rgba(251, 191, 36, 0.45)',
    badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    animationClass: 'animate-emoji-pulse',
    particles: ['🥮', '✨', '⭐'],
    label: 'Sweets'
  }
}

export const getCategoryMeta = (categoryName, iconOverride) => {
  const name = String(categoryName || '').toLowerCase().trim()
  
  let mappedMeta = null

  if (name.includes('tiffin') || name.includes('dosa') || name.includes('idli') || name.includes('breakfast')) {
    mappedMeta = CATEGORY_EMOJI_MAP.tiffin
  } else if (name.includes('lunch')) {
    mappedMeta = CATEGORY_EMOJI_MAP.lunch
  } else if (name.includes('meal') || name.includes('thali') || name.includes('curry')) {
    mappedMeta = CATEGORY_EMOJI_MAP.meals
  } else if (name.includes('snack') || name.includes('samosa') || name.includes('vada') || name.includes('fry') || name.includes('bites')) {
    mappedMeta = CATEGORY_EMOJI_MAP.snacks
  } else if (name.includes('biryani') || name.includes('pulao') || name.includes('rice')) {
    mappedMeta = CATEGORY_EMOJI_MAP.biryani
  } else if (name.includes('starter') || name.includes('appetizer')) {
    mappedMeta = CATEGORY_EMOJI_MAP.starters
  } else if (name.includes('dessert') || name.includes('ice cream') || name.includes('cake')) {
    mappedMeta = CATEGORY_EMOJI_MAP.desserts
  } else if (name.includes('drink') || name.includes('beverage') || name.includes('tea') || name.includes('coffee') || name.includes('juice')) {
    mappedMeta = CATEGORY_EMOJI_MAP.beverages
  } else if (name.includes('fast food') || name.includes('burger') || name.includes('pizza')) {
    mappedMeta = CATEGORY_EMOJI_MAP.fastfood
  } else if (name.includes('sweet')) {
    mappedMeta = CATEGORY_EMOJI_MAP.sweets
  }

  if (mappedMeta) {
    // If backend or admin specified a custom icon other than default generic '🍛', use that icon with our mapped animations/colors
    const emojiToUse = iconOverride && iconOverride !== '🍛' ? iconOverride : mappedMeta.emoji
    return {
      ...mappedMeta,
      emoji: emojiToUse
    }
  }

  // Generic fallback if name doesn't match predefined rules
  const fallbackEmoji = iconOverride && iconOverride !== '🍛' ? iconOverride : '🍽️'
  return {
    emoji: fallbackEmoji,
    altEmoji: '✨',
    bgGradient: 'from-amber-400/25 via-orange-400/15 to-yellow-400/25',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    animationClass: 'animate-emoji-float',
    particles: ['✨', '🍽️'],
    label: categoryName || 'Category'
  }
}
