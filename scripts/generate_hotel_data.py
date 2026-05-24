import json
from random import choice, randint, uniform, sample

destinations = [
    "Udaipur, Rajasthan, India", "Munnar, Kerala, India", "North Goa, India", "Pink City, Jaipur, India",
    "Santorini, Greece", "Tulum, Mexico", "Kyoto, Japan", "Aspen, Colorado, USA", "Bali, Indonesia",
    "Cape Town, South Africa", "Ibiza, Spain", "Paris, France", "Swiss Alps, Switzerland",
    "Queenstown, New Zealand", "Maldives", "Reykjavik, Iceland", "Dubai, UAE", "Marrakech, Morocco",
    "Napa Valley, USA", "Loire Valley, France", "Big Sur, California, USA", "Kyushu, Japan", "Amalfi Coast, Italy",
    "Positano, Italy", "Banff, Canada", "Dubai Marina, UAE", "Phuket, Thailand", "Sydney, Australia",
    "Berlin, Germany", "London, UK", "Barcelona, Spain", "Santander, Spain", "Vancouver, Canada",
    "Lisbon, Portugal", "Buenos Aires, Argentina", "Rio de Janeiro, Brazil", "Cape Winelands, South Africa",
    "Tuscany, Italy", "Provence, France", "Reethi Rah, Maldives", "Serengeti, Tanzania", "Queenstown, NZ",
    "Whistler, Canada", "Zermatt, Switzerland", "Lapland, Finland", "Aspen, USA", "Sedona, USA",
    "Marrakesh, Morocco", "Cairo, Egypt", "Santorini, Greece", "Milan, Italy", "Stockholm, Sweden",
    "Edinburgh, UK", "Prague, Czech Republic", "Vancouver, Canada", "Buenos Aires, Argentina", "Mauritius"
]

name_prefix = ["Sky", "Ocean", "Crystal", "Golden", "Emerald", "Royal", "Sunset", "Moonlight", "Azure", "Desert", "Garden", "Pearl", "Secret", "Forest", "Crown", "Velvet", "Whisper", "Honey", "Silk", "Coral"]
name_suffix = ["Villa", "Resort", "Retreat", "Suites", "Hideaway", "Palace", "Lodge", "Estate", "Haven", "Sanctuary", "Mansion", "Cottage", "Bungalow", "Oasis", "Chalet", "Manor"]

types = [
    "Luxury Boutique Stay", "Eco-Luxury Cabin", "Oceanfront Suite", "Heritage Mansion", "Mountain Chalet", "Design Villa",
    "Desert Retreat", "Arctic Lodge", "Golf Resort", "Vineyard Estate", "Beachfront Bungalow", "Treehouse Escape",
    "Wellness Sanctuary", "Urban Loft", "Historic Palace", "Island Villa", "Country Manor", "Skyline Penthouse"
]

categories = ["Castles", "Beachfront", "Amazing views", "Trending", "Design", "Golfing", "Vineyards", "Arctic", "Desert", "Boats"]

amenities_pool = [
    "High-speed WiFi", "Infinity Pool", "Mountain View", "Beach Access", "Private Hot Tub", "Breakfast Included",
    "Room Service", "Spa Access", "Gym", "Airport Shuttle", "Parking", "Pet Friendly", "Fireplace", "Sauna",
    "Private Terrace", "Wine Cellar", "Yoga Deck", "Golf Course Access", "Outdoor Shower", "Smart TV"
]

review_comments = [
    "Exceptional stay from start to finish.",
    "The service was outstanding and the atmosphere unforgettable.",
    "A truly magical escape with incredible views.",
    "Perfect for a romantic getaway.",
    "The food and decor were both top-notch.",
    "Staff were friendly and extremely attentive.",
    "This property exceeded all expectations.",
    "Clean, comfortable, and very stylish.",
    "Great location and amazing amenities.",
    "We will definitely return next time."
]

first_names = ["Aria", "Noah", "Mia", "Leo", "Aanya", "Rahul", "Priya", "Ethan", "Lina", "Sofia", "Kiran", "Nina", "Mohan", "Sara", "Tom", "Aditi", "Dev", "Anil", "Mira"]
last_names = ["Sharma", "Patel", "Gupta", "Fernandez", "Smith", "Johnson", "Lee", "Nguyen", "Garcia", "Khan", "Singh", "Rao", "Chen", "Kim", "D'Souza"]

hotel_data = []
for i in range(1, 101):
    name = f"{choice(name_prefix)} {choice(name_suffix)}"
    location = destinations[(i-1) % len(destinations)]
    rating = round(uniform(4.5, 5.0), 2)
    review_count = randint(120, 1200)
    typ = choice(types)
    base_price = randint(4200, 26000)
    original_price = base_price + randint(500, 7000)
    host = f"{choice(first_names)} {choice(last_names)}"
    guests = randint(2, 10)
    bedrooms = randint(1, min(5, guests))
    beds = bedrooms + randint(0, 2)
    bathrooms = max(1, bedrooms - randint(0, 1))
    cats = sorted(sample(categories, k=randint(1, 3)))
    desc = f"{name} is a beautiful retreat in {location}. This property offers {', '.join(sample(amenities_pool, k=3))}, elegant interiors, and a memorable stay for guests seeking a premium experience."
    images = [
        f"https://images.unsplash.com/photo-15{800 + i:03d}?auto=format&fit=crop&w=800",
        f"https://images.unsplash.com/photo-15{700 + i:03d}?auto=format&fit=crop&w=400",
        f"https://images.unsplash.com/photo-15{600 + i:03d}?auto=format&fit=crop&w=400"
    ]
    amenities = sample(amenities_pool, k=6)
    reviews = [
        {
            "userName": choice(["Vikram Singh", "Sarah Jenkins", "Emily Chen", "Rohan Mehta", "Aditi Rao", "Daniel Park", "Maya Patel", "Jason Wong", "Olivia Brown", "Zara Ahmed"]),
            "avatar": f"https://i.pravatar.cc/100?u=hotel{i}",
            "date": f"{choice(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"])} 2026",
            "comment": choice(review_comments),
            "rating": round(uniform(4.5, 5.0), 1)
        }
        for _ in range(randint(1, 2))
    ]
    hotel_data.append({
        "id": f"hot-stay-{i:03d}",
        "name": name,
        "location": location,
        "rating": rating,
        "reviewCount": review_count,
        "type": typ,
        "price": base_price,
        "originalPrice": original_price,
        "host": host,
        "guests": guests,
        "bedrooms": bedrooms,
        "beds": beds,
        "bathrooms": bathrooms,
        "categories": cats,
        "description": desc,
        "images": images,
        "amenities": amenities,
        "reviews": reviews
    })

similar_hotels = []
for i in range(1, 101):
    name = f"{choice(name_prefix)} {choice(name_suffix)}"
    location = destinations[(i-1) % len(destinations)]
    rating = round(uniform(4.5, 5.0), 2)
    price = randint(4200, 26000)
    image = f"https://images.unsplash.com/photo-16{500 + i:03d}?auto=format&fit=crop&w=400"
    similar_hotels.append({
        "id": f"hot-stay-{i:03d}",
        "name": name,
        "location": location,
        "rating": rating,
        "price": price,
        "image": image
    })

with open('database/hotelData.json', 'w', encoding='utf-8') as f:
    json.dump(hotel_data, f, indent=2, ensure_ascii=False)

with open('database/similarHotels.json', 'w', encoding='utf-8') as f:
    json.dump(similar_hotels, f, indent=2, ensure_ascii=False)

print('Generated hotelData.json and similarHotels.json with 100 entries each.')
