
export interface CarListing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  bodyType: string;
  fuelType: string;
  color: string;
  description: string;
  imageUrl: string;
  features: string[];
}

export const MOCK_CARS: CarListing[] = [
  {
    id: '1',
    make: 'Tesla',
    model: 'Model 3',
    year: 2022,
    price: 38500,
    mileage: 15200,
    bodyType: 'Sedan',
    fuelType: 'Electric',
    color: 'White',
    description: 'Pristine condition Tesla Model 3 with Autopilot. Single owner, garage kept.',
    imageUrl: 'https://picsum.photos/seed/ev-1/800/600',
    features: ['Autopilot', 'Premium Audio', 'Heated Seats', 'Panoramic Roof']
  },
  {
    id: '2',
    make: 'BMW',
    model: 'X5',
    year: 2021,
    price: 52000,
    mileage: 24000,
    bodyType: 'SUV',
    fuelType: 'Gasoline',
    color: 'Black',
    description: 'Powerful and luxurious SUV. Perfect for family trips with all the safety features.',
    imageUrl: 'https://picsum.photos/seed/suv-1/800/600',
    features: ['All-Wheel Drive', 'Leather Interior', 'Parking Assistant', 'Sunroof']
  },
  {
    id: '3',
    make: 'Ford',
    model: 'F-150',
    year: 2020,
    price: 45000,
    mileage: 35000,
    bodyType: 'Truck',
    fuelType: 'Gasoline',
    color: 'Blue',
    description: 'Rugged Ford F-150 ready for work or play. Ecoboost engine for great performance.',
    imageUrl: 'https://picsum.photos/seed/truck-1/800/600',
    features: ['Towing Package', 'Navigation', 'Bed Liner', 'Remote Start']
  },
  {
    id: '4',
    make: 'Honda',
    model: 'Civic',
    year: 2023,
    price: 26000,
    mileage: 5000,
    bodyType: 'Sedan',
    fuelType: 'Gasoline',
    color: 'Silver',
    description: 'Brand new feel, highly fuel efficient. The perfect city commuter.',
    imageUrl: 'https://picsum.photos/seed/sedan-1/800/600',
    features: ['Apple CarPlay', 'Lane Keep Assist', 'Adaptive Cruise', 'Backup Camera']
  },
  {
    id: '5',
    make: 'Porsche',
    model: '911 Carrera',
    year: 2021,
    price: 115000,
    mileage: 8000,
    bodyType: 'Sports',
    fuelType: 'Gasoline',
    color: 'Red',
    description: 'Iconic sports car performance. Low mileage and in showroom condition.',
    imageUrl: 'https://picsum.photos/seed/sports-1/800/600',
    features: ['Sport Chrono', 'PASM', 'Bose Surround', 'Ventilated Seats']
  },
  {
    id: '6',
    make: 'Toyota',
    model: 'Sienna',
    year: 2022,
    price: 42000,
    mileage: 12000,
    bodyType: 'Van',
    fuelType: 'Hybrid',
    color: 'Grey',
    description: 'Spacious hybrid minivan. Exceptional fuel economy for its class.',
    imageUrl: 'https://picsum.photos/seed/van-1/800/600',
    features: ['Power Sliding Doors', '7-Seater', 'Hybrid Synergy Drive', 'Safety Sense']
  }
];
