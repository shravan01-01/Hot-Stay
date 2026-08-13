const mongoose = require('mongoose');
const Hotel = require('../server/models/Hotel');

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/HotStay';

const hotelData = [
  {
    name: 'Azure Cove Villa',
    description: 'A luxurious coastal hideaway with panoramic sea views, warm wood interiors, and a private plunge pool for romantic stays.',
    location: 'North Goa, India',
    price: 8200,
    originalPrice: 9800,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    type: 'Oceanfront Suite',
    guests: 4,
    categories: ['Beachfront', 'Trending'],
    hostEmail: 'host@azurecove.com',
    host: 'Aditi Sharma',
    rating: 4.9,
    reviewCount: 248,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    amenities: ['High-speed WiFi', 'Infinity Pool', 'Beach Access', 'Breakfast Included', 'Private Terrace', 'Gym'],
    reviews: [
      {
        userName: 'Riya Mehta',
        avatar: 'https://i.pravatar.cc/100?img=12',
        date: 'May 2026',
        comment: 'Beautiful stay with excellent hospitality and a view that felt unreal.',
        rating: 5
      },
      {
        userName: 'Aman Verma',
        avatar: 'https://i.pravatar.cc/100?img=32',
        date: 'April 2026',
        comment: 'Very clean, stylish, and perfectly located for beach lovers.',
        rating: 4.8
      }
    ]
  },
  {
    name: 'Golden Horizon Resort',
    description: 'An elegant mountain escape with sunrise decks, wellness spaces, and modern rooms designed for rest and recreation.',
    location: 'Munnar, Kerala, India',
    price: 6900,
    originalPrice: 8600,
    images: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80'
    ],
    type: 'Mountain Chalet',
    guests: 3,
    categories: ['Amazing views', 'Design'],
    hostEmail: 'host@goldenhorizon.com',
    host: 'Nikhil Rao',
    rating: 4.8,
    reviewCount: 183,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    amenities: ['Mountain View', 'Spa Access', 'Room Service', 'Private Hot Tub', 'Breakfast Included', 'Parking'],
    reviews: [
      {
        userName: 'Sana Khan',
        avatar: 'https://i.pravatar.cc/100?img=54',
        date: 'June 2026',
        comment: 'The view and quiet atmosphere made the trip unforgettable.',
        rating: 4.9
      }
    ]
  },
  {
    name: 'Desert Bloom Retreat',
    description: 'A warm, handcrafted desert stay with open-air courtyards, local cuisine, and starlit evenings under the sand dunes.',
    location: 'Jaisalmer, Rajasthan, India',
    price: 5400,
    originalPrice: 7200,
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'
    ],
    type: 'Desert Retreat',
    guests: 2,
    categories: ['Desert', 'Trending'],
    hostEmail: 'host@desertbloom.com',
    host: 'Karan Singh',
    rating: 4.7,
    reviewCount: 126,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: ['Fireplace', 'Outdoor Shower', 'Breakfast Included', 'Parking', 'Private Terrace', 'High-speed WiFi'],
    reviews: [
      {
        userName: 'Neha Joshi',
        avatar: 'https://i.pravatar.cc/100?img=22',
        date: 'January 2026',
        comment: 'The sunset dinner and cozy room made this a lovely desert getaway.',
        rating: 4.7
      }
    ]
  },
  {
    name: 'Emerald Palace',
    description: 'A heritage-inspired mansion blending royal elegance with contemporary luxury and curated guest experiences.',
    location: 'Pink City, Jaipur, India',
    price: 9400,
    originalPrice: 11300,
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=80'
    ],
    type: 'Heritage Mansion',
    guests: 5,
    categories: ['Castles', 'Design'],
    hostEmail: 'host@emeraldpalace.com',
    host: 'Simran Gupta',
    rating: 4.9,
    reviewCount: 311,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3,
    amenities: ['Breakfast Included', 'Room Service', 'Parking', 'Gym', 'Private Terrace', 'High-speed WiFi'],
    reviews: [
      {
        userName: 'Ishaan Kapoor',
        avatar: 'https://i.pravatar.cc/100?img=45',
        date: 'May 2026',
        comment: 'A truly royal stay with warm service and beautiful architecture.',
        rating: 5
      },
      {
        userName: 'Disha Sen',
        avatar: 'https://i.pravatar.cc/100?img=67',
        date: 'April 2026',
        comment: 'Perfect for family vacations and photo-worthy spaces.',
        rating: 4.8
      }
    ]
  },
  {
    name: 'Pearl Cloud Lodge',
    description: 'A cozy alpine retreat with snow-view balconies, warm interiors, and wellness facilities for an uplifting mountain stay.',
    location: 'Swiss Alps, Switzerland',
    price: 11100,
    originalPrice: 13900,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=800&q=80'
    ],
    type: 'Mountain Chalet',
    guests: 4,
    categories: ['Amazing views', 'Arctic'],
    hostEmail: 'host@pearlcloud.com',
    host: 'Enzo Martin',
    rating: 4.9,
    reviewCount: 274,
    bedrooms: 2,
    beds: 3,
    bathrooms: 2,
    amenities: ['Sauna', 'Fireplace', 'Mountain View', 'Breakfast Included', 'Private Hot Tub', 'High-speed WiFi'],
    reviews: [
      {
        userName: 'Lina Petrov',
        avatar: 'https://i.pravatar.cc/100?img=81',
        date: 'March 2026',
        comment: 'Switzerland at its best—quiet, luxurious, and breathtakingly scenic.',
        rating: 5
      }
    ]
  },
  {
    name: 'Forest Nest Haven',
    description: 'A serene woodland villa with natural textures, outdoor lounge spaces, and a peaceful ambiance for long weekend escapes.',
    location: 'Bali, Indonesia',
    price: 7600,
    originalPrice: 9200,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80'
    ],
    type: 'Design Villa',
    guests: 4,
    categories: ['Design', 'Trending'],
    hostEmail: 'host@forestnest.com',
    host: 'Luca Hartono',
    rating: 4.8,
    reviewCount: 215,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    amenities: ['Yoga Deck', 'Private Terrace', 'Breakfast Included', 'High-speed WiFi', 'Garden Access', 'Parking'],
    reviews: [
      {
        userName: 'Priya Dutta',
        avatar: 'https://i.pravatar.cc/100?img=63',
        date: 'June 2026',
        comment: 'Well-designed, peaceful, and extremely comfortable for a long stay.',
        rating: 4.8
      }
    ]
  }
];

async function seedHotels() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Hotel.deleteMany({});
    const result = await Hotel.insertMany(hotelData);
    console.log(`Inserted ${result.length} dummy hotel records into ${mongoURI}`);
  } catch (error) {
    console.error('Error seeding hotel data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedHotels();
