type UserData = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  isAdmin: boolean;
};

type MessageData = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  body: string;
  sentAt: string;
  readAt: string;
};

type PropertyData = {
  id: number;
  title: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  latitude: string;
  longitude: string;
  description: string;
  price: number;
  ownerUsername: string;
  images?: ImagesData[];
};

type PropertySearchFilters = {
  minPrice?: number;
  maxPrice?: number;
  description?: string;
};
type ImagesData = {
  id: number;
  key: string;
  propertyId: number;
};

export {
  UserData,
  MessageData,
  PropertyData,
  PropertySearchFilters,
  ImagesData,
};
