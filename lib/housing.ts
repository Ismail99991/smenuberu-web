// lib/housing.ts

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
  partnerEmployerId?: string;
  availableFrom: string;
  availableTo: string;
  totalBeds: number;
  availableBeds: number;
  distanceToTransport?: string;
  nearestMetro?: string;
}

// Мок-данные для хостелов
export const mockHostels: Hostel[] = [
  {
    id: "1",
    name: "Хостел 'Южный'",
    type: "hostel",
    city: "Краснодар",
    address: "ул. Красная, 45",
    lat: 45.0355,
    lng: 38.975,
    pricePerNight: 500,
    pricePerWeek: 3000,
    pricePerMonth: 10000,
    rating: 4.5,
    reviews: 128,
    photos: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5"
    ],
    description: "Уютный хостел в центре города. Рядом остановки общественного транспорта, магазины. Есть общая кухня, зона отдыха, Wi-Fi на всей территории.",
    amenities: ["wifi", "kitchen", "washing", "shower", "parking", "lockers"],
    contactPhone: "+7 (999) 123-45-67",
    contactName: "Анна",
    isPartner: true,
    availableFrom: "2025-01-01",
    availableTo: "2025-12-31",
    totalBeds: 50,
    availableBeds: 15,
    distanceToTransport: "5 мин пешком",
    nearestMetro: "Центральный рынок"
  },
  {
    id: "2",
    name: "Гостиница 'Строитель'",
    type: "hotel",
    city: "Сочи",
    address: "ул. Олимпийская, 12",
    lat: 43.5855,
    lng: 39.723,
    pricePerNight: 1200,
    pricePerWeek: 7000,
    pricePerMonth: 25000,
    rating: 4.2,
    reviews: 89,
    photos: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945"
    ],
    description: "Комфортабельная гостиница для рабочих. Бесплатный wi-fi, кухня, прачечная. Номера с удобствами. Есть обеденный зал.",
    amenities: ["wifi", "kitchen", "washing", "shower", "parking", "tv", "canteen"],
    contactPhone: "+7 (999) 234-56-78",
    contactName: "Михаил",
    isPartner: true,
    availableFrom: "2025-01-01",
    availableTo: "2025-12-31",
    totalBeds: 80,
    availableBeds: 25,
    distanceToTransport: "10 мин на автобусе",
    nearestMetro: "Олимпийский парк"
  },
  {
    id: "3",
    name: "Общежитие 'Виноградник'",
    type: "dormitory",
    city: "Анапа",
    address: "с. Виноградное, ул. Винодельческая, 45",
    lat: 44.895,
    lng: 37.316,
    pricePerNight: 400,
    pricePerWeek: 2500,
    pricePerMonth: 8000,
    rating: 4.0,
    reviews: 45,
    photos: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5"
    ],
    description: "Рабочее общежитие прямо на территории виноградников. Есть столовая, душевые, комнаты на 4-6 человек.",
    amenities: ["kitchen", "shower", "canteen", "lockers"],
    contactPhone: "+7 (999) 345-67-89",
    contactName: "Елена",
    isPartner: true,
    availableFrom: "2025-05-01",
    availableTo: "2025-10-31",
    totalBeds: 100,
    availableBeds: 40,
    distanceToTransport: "3 мин пешком",
    nearestMetro: "Виноградная"
  },
  {
    id: "4",
    name: "Апартаменты 'Рыбацкий'",
    type: "apartment",
    city: "Владивосток",
    address: "порт 'Рыбацкий', терминал 3",
    lat: 43.115,
    lng: 131.885,
    pricePerNight: 1500,
    pricePerWeek: 9000,
    pricePerMonth: 30000,
    rating: 4.7,
    reviews: 32,
    photos: [
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc",
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc"
    ],
    description: "Отдельные апартаменты с кухней и санузлом. В 5 минутах от рыбного порта. Идеально для работников завода.",
    amenities: ["wifi", "kitchen", "washing", "shower", "tv", "iron"],
    contactPhone: "+7 (999) 456-78-90",
    contactName: "Дмитрий",
    isPartner: false,
    availableFrom: "2025-01-01",
    availableTo: "2025-12-31",
    totalBeds: 20,
    availableBeds: 5,
    distanceToTransport: "15 мин пешком"
  },
  {
    id: "5",
    name: "Хостел 'Горный'",
    type: "hostel",
    city: "Красная Поляна",
    address: "ул. Горная, 8",
    lat: 43.679,
    lng: 40.205,
    pricePerNight: 600,
    pricePerWeek: 3500,
    pricePerMonth: 12000,
    rating: 4.3,
    reviews: 67,
    photos: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5"
    ],
    description: "Уютный хостел в горах. Отличный вариант для сезонных работников горнолыжного курорта.",
    amenities: ["wifi", "kitchen", "shower", "lockers", "parking"],
    contactPhone: "+7 (999) 567-89-01",
    contactName: "Ольга",
    isPartner: true,
    availableFrom: "2025-11-01",
    availableTo: "2025-04-30",
    totalBeds: 60,
    availableBeds: 30,
    distanceToTransport: "7 мин пешком"
  },
  {
    id: "6",
    name: "Гостиница 'Карельская'",
    type: "hotel",
    city: "Петрозаводск",
    address: "ул. Лесная, 15",
    lat: 61.789,
    lng: 34.359,
    pricePerNight: 900,
    pricePerWeek: 5500,
    pricePerMonth: 20000,
    rating: 4.1,
    reviews: 23,
    photos: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945"
    ],
    description: "Гостиница для сборщиков ягод и грибов. Есть сушилка для одежды, столовая.",
    amenities: ["wifi", "shower", "canteen", "lockers", "washing"],
    contactPhone: "+7 (999) 678-90-12",
    contactName: "Иван",
    isPartner: false,
    availableFrom: "2025-06-01",
    availableTo: "2025-09-30",
    totalBeds: 40,
    availableBeds: 12,
    distanceToTransport: "10 мин на автобусе"
  }
];

// Получить хостел по ID
export function getHostelById(id: string): Hostel | undefined {
  return mockHostels.find(h => h.id === id);
}

// Поиск хостелов по городу
export function getHostelsByCity(city: string): Hostel[] {
  return mockHostels.filter(h => h.city.toLowerCase() === city.toLowerCase());
}

// Поиск хостелов с партнёрскими условиями
export function getPartnerHostels(): Hostel[] {
  return mockHostels.filter(h => h.isPartner);
}

// Получить уникальные города
export function getUniqueCities(): string[] {
  return [...new Set(mockHostels.map(h => h.city))];
}