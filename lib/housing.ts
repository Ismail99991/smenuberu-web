export interface Hostel {
  id: string;
  name: string;
  type: "hostel" | "hotel" | "apartment" | "dormitory" | "camp";
  city: string;
  address: string;
  lat: number;
  lng: number;
  pricePerNight: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  rating: number;
  reviews: number;
  photos: string[];
  description: string;
  amenities: string[];
  contactPhone: string;
  contactName: string;
  isPartner: boolean;
  availableFrom: string;
  availableTo: string;
  totalBeds: number;
  availableBeds: number;
  distanceToTransport?: string;
  nearestMetro?: string;
}

export const mockHostels: Hostel[] = [
  {
    id: "1",
    name: "Хостел 'Южный'",
    type: "hostel",
    city: "Москва",
    address: "ул. Красная, 45",
    lat: 55.751244,
    lng: 37.618423,
    pricePerNight: 500,
    pricePerWeek: 3000,
    pricePerMonth: 10000,
    rating: 4.5,
    reviews: 128,
    photos: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5"],
    description: "Уютный хостел в центре города",
    amenities: ["wifi", "kitchen", "shower", "parking"],
    contactPhone: "+7 (999) 123-45-67",
    contactName: "Анна",
    isPartner: true,
    availableFrom: "2026-01-01",
    availableTo: "2026-12-31",
    totalBeds: 50,
    availableBeds: 15,
    distanceToTransport: "5 мин пешком",
  },
  {
    id: "2",
    name: "Гостиница 'Строитель'",
    type: "hotel",
    city: "Москва",
    address: "ул. Олимпийская, 12",
    lat: 55.751244,
    lng: 37.618423,
    pricePerNight: 1200,
    pricePerWeek: 7000,
    pricePerMonth: 25000,
    rating: 4.2,
    reviews: 89,
    photos: ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
    description: "Комфортабельная гостиница",
    amenities: ["wifi", "shower", "parking", "tv"],
    contactPhone: "+7 (999) 234-56-78",
    contactName: "Михаил",
    isPartner: true,
    availableFrom: "2026-01-01",
    availableTo: "2026-12-31",
    totalBeds: 80,
    availableBeds: 25,
    distanceToTransport: "10 мин на автобусе",
  },
];