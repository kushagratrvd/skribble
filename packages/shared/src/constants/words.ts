const ANIMALS = [
  'dog', 'cat', 'elephant', 'giraffe', 'penguin', 'dolphin', 'tiger',
  'lion', 'monkey', 'kangaroo', 'panda', 'zebra', 'whale', 'shark',
  'eagle', 'butterfly', 'octopus', 'rabbit', 'horse', 'snake',
  'parrot', 'turtle', 'frog', 'bear', 'wolf', 'fox', 'owl',
  'flamingo', 'crocodile', 'jellyfish',
];

const FOOD = [
  'pizza', 'hamburger', 'sushi', 'taco', 'ice cream', 'pancake',
  'donut', 'spaghetti', 'sandwich', 'cookie', 'cake', 'popcorn',
  'french fries', 'hot dog', 'chocolate', 'watermelon', 'banana',
  'apple', 'grapes', 'strawberry', 'broccoli', 'cheese', 'bread',
  'egg', 'bacon', 'waffle', 'burrito', 'cupcake', 'pretzel', 'salad',
];

const SPORTS = [
  'soccer', 'basketball', 'tennis', 'swimming', 'baseball', 'golf',
  'volleyball', 'boxing', 'skateboarding', 'surfing', 'skiing',
  'hockey', 'cricket', 'archery', 'bowling', 'karate', 'wrestling',
  'badminton', 'fencing', 'cycling', 'rugby', 'gymnastics',
  'snowboarding', 'rowing', 'diving',
];

const COUNTRIES = [
  'France', 'Japan', 'Brazil', 'Australia', 'Egypt', 'Canada',
  'India', 'Italy', 'Mexico', 'China', 'Germany', 'Russia',
  'Spain', 'Argentina', 'Thailand', 'Greece', 'Norway', 'Kenya',
  'Peru', 'Iceland',
];

const MOVIES = [
  'Titanic', 'Batman', 'Spider-Man', 'Star Wars', 'Jurassic Park',
  'Harry Potter', 'Frozen', 'Shrek', 'Finding Nemo', 'Toy Story',
  'Avatar', 'Jaws', 'Rocky', 'Alien', 'Ghostbusters',
  'The Lion King', 'Aladdin', 'Pinocchio', 'Bambi', 'Cinderella',
];

const HOUSEHOLD = [
  'lamp', 'chair', 'table', 'television', 'refrigerator', 'microwave',
  'pillow', 'blanket', 'mirror', 'clock', 'scissors', 'umbrella',
  'broom', 'vacuum', 'toothbrush', 'soap', 'towel', 'fork',
  'knife', 'spoon', 'plate', 'cup', 'bottle', 'candle', 'key',
  'window', 'door', 'stairs', 'bathtub', 'toilet',
];

const NATURE = [
  'mountain', 'river', 'ocean', 'volcano', 'tornado', 'rainbow',
  'waterfall', 'desert', 'forest', 'island', 'cave', 'glacier',
  'sunset', 'lightning', 'earthquake', 'tsunami', 'beach', 'cloud',
  'moon', 'star', 'tree', 'flower', 'mushroom', 'cactus', 'leaf',
];

const OBJECTS = [
  'guitar', 'piano', 'drum', 'rocket', 'airplane', 'helicopter',
  'bicycle', 'train', 'boat', 'car', 'bus', 'trophy', 'crown',
  'sword', 'shield', 'diamond', 'treasure', 'castle', 'bridge',
  'lighthouse', 'compass', 'telescope', 'camera', 'robot', 'balloon',
  'kite', 'parachute', 'anchor', 'bell', 'wheel',
];

export const WORD_LIST: string[] = [
  ...ANIMALS,
  ...FOOD,
  ...SPORTS,
  ...COUNTRIES,
  ...MOVIES,
  ...HOUSEHOLD,
  ...NATURE,
  ...OBJECTS,
];

export function getRandomWords(n: number, exclude: string[] = []): string[] {
  const available = WORD_LIST.filter(
    (w) => !exclude.map((e) => e.toLowerCase()).includes(w.toLowerCase())
  );
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}