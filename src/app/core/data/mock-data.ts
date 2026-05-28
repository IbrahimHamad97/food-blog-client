/**
 * Static seed data for UI development before the API exists.
 * Images are Unsplash URLs (food photography).
 */
import { Collection, ReviewSeed } from '../models/review.model';
import { UserSummary } from '../models/user.model';

export const MOCK_USERS: UserSummary[] = [
  {
    id: 'user-1',
    name: 'Alex Rivera',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  },
  {
    id: 'user-2',
    name: 'Jordan Lee',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
  },
  {
    id: 'user-3',
    name: 'Sam Okonkwo',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
  },
];

/** Reviews sorted newest-first when consumed via {@link MockDataService}. */
export const MOCK_REVIEWS: ReviewSeed[] = [
  {
    id: 'review-1',
    title: 'Hand-pulled noodles worth the wait',
    excerpt: 'Chewy noodles, rich broth, and chili oil that actually has flavor.',
    body: 'Chewy noodles, rich broth, and chili oil that actually has flavor. The line moves fast and the portion is generous.',
    placeName: 'Lan Zhou Noodle House',
    rating: 5,
    cuisineTags: ['Chinese', 'Noodles'],
    foodTypeTags: ['Dumplings', 'Ramen'],
    imageUrl:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
    author: MOCK_USERS[0],
    publishedAt: '2026-05-20T18:30:00.000Z',
    likeCount: 24,
  },
  {
    id: 'review-2',
    title: 'Neapolitan pie with a perfect char',
    excerpt: 'Soft center, blistered crust, and buffalo mozzarella that melts into every bite.',
    body: 'Soft center, blistered crust, and buffalo mozzarella that melts into every bite. Wood-fired oven makes all the difference.',
    placeName: 'Via Roma Pizzeria',
    rating: 5,
    cuisineTags: ['Italian', 'Pizza'],
    foodTypeTags: ['Pizza'],
    imageUrl:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    author: MOCK_USERS[1],
    publishedAt: '2026-05-19T12:00:00.000Z',
    likeCount: 41,
  },
  {
    id: 'review-3',
    title: 'Tacos al pastor at midnight',
    excerpt: 'Pineapple, cilantro, and pork carved fresh off the trompo.',
    body: 'Pineapple, cilantro, and pork carved fresh off the trompo. Cash only, plastic stools, absolutely worth it.',
    placeName: 'El Trompo Taqueria',
    rating: 4,
    cuisineTags: ['Mexican', 'Street food'],
    foodTypeTags: ['Tacos'],
    imageUrl:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
    author: MOCK_USERS[2],
    publishedAt: '2026-05-18T21:15:00.000Z',
    likeCount: 12,
  },
  {
    id: 'review-4',
    title: 'Salmon don that melts',
    excerpt: 'Buttery fish over warm rice with a hint of citrus ponzu.',
    body: 'Buttery fish over warm rice with a hint of citrus ponzu. Small counter seat-only spot — go off-peak.',
    placeName: 'Sakura Counter',
    rating: 5,
    cuisineTags: ['Japanese', 'Seafood'],
    foodTypeTags: ['Sushi', 'Seafood'],
    imageUrl:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80',
    author: MOCK_USERS[0],
    publishedAt: '2026-05-17T13:45:00.000Z',
    likeCount: 38,
  },
  {
    id: 'review-5',
    title: 'Brunch burger done right',
    excerpt: 'Runny egg, sharp cheddar, and a brioche bun that holds up.',
    body: 'Runny egg, sharp cheddar, and a brioche bun that holds up. Fries are twice-cooked and never soggy.',
    placeName: 'Northside Grill',
    rating: 4,
    cuisineTags: ['American', 'Brunch'],
    foodTypeTags: ['Brunch', 'Burgers', 'Breakfast'],
    imageUrl:
      'https://images.unsplash.com/photo-1568901347635-c40d64e5a576?w=800&q=80',
    author: MOCK_USERS[1],
    publishedAt: '2026-05-16T10:30:00.000Z',
    likeCount: 8,
  },
  {
    id: 'review-6',
    title: 'Green curry with real heat',
    excerpt: 'Coconut-forward, basil-heavy, and spicy enough to notice.',
    body: 'Coconut-forward, basil-heavy, and spicy enough to notice. Ask for Thai hot if you mean it.',
    placeName: 'Bangkok Garden',
    rating: 4,
    cuisineTags: ['Thai', 'Curry'],
    foodTypeTags: ['Curry'],
    imageUrl:
      'https://images.unsplash.com/photo-1455619452474-d2be1b5580d9?w=800&q=80',
    author: MOCK_USERS[2],
    publishedAt: '2026-05-15T19:00:00.000Z',
    likeCount: 15,
  },
  {
    id: 'review-7',
    title: 'Ethiopian platter for sharing',
    excerpt: 'Injera, lentil stews, and berbere spice on one big tray.',
    body: 'Injera, lentil stews, and berbere spice on one big tray. Vegetarian combo is the move for first-timers.',
    placeName: 'Addis Kitchen',
    rating: 5,
    cuisineTags: ['Ethiopian'],
    foodTypeTags: ['Falafel'],
    imageUrl:
      'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
    author: MOCK_USERS[0],
    publishedAt: '2026-05-14T17:20:00.000Z',
    likeCount: 33,
  },
  {
    id: 'review-8',
    title: 'Crispy falafel pita',
    excerpt: 'Herby falafel, pickled turnips, and tahini that doesn’t overpower.',
    body: 'Herby falafel, pickled turnips, and tahini that doesn’t overpower. Quick lunch spot with outdoor tables.',
    placeName: 'Olive & Pita',
    rating: 4,
    cuisineTags: ['Middle Eastern', 'Vegetarian'],
    foodTypeTags: ['Falafel', 'Wraps'],
    imageUrl:
      'https://images.unsplash.com/photo-1529006557810-274b9a2a8a33?w=800&q=80',
    author: MOCK_USERS[1],
    publishedAt: '2026-05-13T14:10:00.000Z',
    likeCount: 6,
  },
  {
    id: 'review-9',
    title: 'Dumplings from a steam cart',
    excerpt: 'Shrimp har gow with translucent wrappers and a ginger dip.',
    body: 'Shrimp har gow with translucent wrappers and a ginger dip. Dim sum hours only — arrive early.',
    placeName: 'Jade Palace',
    rating: 5,
    cuisineTags: ['Chinese', 'Dim sum'],
    foodTypeTags: ['Dumplings'],
    imageUrl:
      'https://images.unsplash.com/photo-1496116218417-1a781b1df416?w=800&q=80',
    author: MOCK_USERS[2],
    publishedAt: '2026-05-12T11:00:00.000Z',
    likeCount: 47,
  },
  {
    id: 'review-10',
    title: 'Classic French onion soup',
    excerpt: 'Deep broth, gruyère cap, and bread that soaks up everything.',
    body: 'Deep broth, gruyère cap, and bread that soaks up everything. Pair with the house red.',
    placeName: 'Bistro Lumière',
    rating: 4,
    cuisineTags: ['French', 'Soup'],
    foodTypeTags: [],
    imageUrl:
      'https://images.unsplash.com/photo-1547592160-23ac45744acd?w=800&q=80',
    author: MOCK_USERS[0],
    publishedAt: '2026-05-11T20:45:00.000Z',
    likeCount: 19,
  },
];

/** Example collections — for profile pages later, not the home feed. */
export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'collection-1',
    name: 'Chinese food',
    description: 'Noodles, dumplings, and late-night spots.',
    isPublic: true,
    ownerId: 'user-1',
    reviewIds: ['review-1', 'review-9'],
  },
  {
    id: 'collection-2',
    name: 'Weekend brunch',
    description: 'Lazy Sunday favorites.',
    isPublic: true,
    ownerId: 'user-2',
    reviewIds: ['review-5'],
  },
];
