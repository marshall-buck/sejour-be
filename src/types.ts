type UserData = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  isAdmin: boolean;
};

type UserMessageData = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  body: string;
  sentAt: string;
  readAt: string;
};

type MessageData = {
  id: number;
  fromUsername: string;
  toUsername: string;
  body: string;
  sentAt: string;
  readAt?: string;
};

type MessageResultData = {
  id: number;
  fromUser: Pick<UserData, "username" | "firstName" | "lastName" | "avatar">;
  toUser: Pick<UserData, "username" | "firstName" | "lastName" | "avatar">;
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

type PropertyUpdateData = Pick<
  PropertyData,
  "id" | "description" | "title" | "price"
>;

type ImagesData = {
  id: number;
  key: string;
  propertyId: number;
};

type BookingData = {
  id: number;
  startDate: string;
  endDate: string;
  propertyId: number;
  guestUsername: string;
};

type BookingResultData = Omit<BookingData, "propertyId"> & {
  property: PropertyData;
};

export {
  BookingData,
  BookingResultData,
  UserData,
  UserMessageData,
  MessageData,
  MessageResultData,
  PropertyData,
  PropertySearchFilters,
  PropertyUpdateData,
  ImagesData,
};
