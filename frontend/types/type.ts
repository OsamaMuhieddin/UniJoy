export interface EventCategory {
  _id: string;
  title: string;
  description: string;
  time: string;
  date: string;
  status?: string;
  startDate: string;
  endDate: string;
  location: string;
  price?: number;
  capacity: number;
  hall?: Hall;
  category: HostCategory;
  image: string;
  isRegistered?: boolean;
}
export interface HostCategory {
  _id: string;
  name: string;
  description: string;
  image: string;
}
export interface Hall {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  status: string;
}