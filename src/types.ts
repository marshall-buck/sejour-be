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
  avatar: string;
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

// type MessageQueryResult = {

// }

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
  images?: Omit<ImageData, "propertyId">[];
};

type PropertySearchFilters = {
  minPrice?: number;
  maxPrice?: number;
  description?: string;
  pageSize?: number;
  pageNumber?: number;
};

type PropertyUpdateData = Pick<
  PropertyData,
  "id" | "description" | "title" | "price"
>;

type ImageData = {
  id: number;
  imageKey: string;
  propertyId: number;
  isCoverImage?: boolean;
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

type PaginationInfo = {
  currentPage: number;
  totalResults: number;
  totalPages: number;
  limit: number;
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
  ImageData,
  PaginationInfo,
};
