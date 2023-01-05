type UserData = {
  id: number;
  password: string;
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  isAdmin: boolean;
};

type UserResponse = Omit<UserData, "password">;

type UserMessageData = {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  avatar: string;
  body: string;
  sentAt: string;
  readAt: string;
};

type MessageData = {
  id: number;
  fromId: number;
  toId: number;
  body: string;
  sentAt: string;
  readAt?: string;
};

type MessageQueryResult = {
  id: number;
  fromId: number;
  fromFirstName: string;
  fromLastName: string;
  fromAvatar: string;
  toId: number;
  toFirstName: string;
  toLastName: string;
  toAvatar: string;
  body: string;
  sentAt: string;
  readAt: string;
};

type MessageResultData = {
  id: number;
  fromUser: Pick<UserData, "id" | "firstName" | "lastName" | "avatar">;
  toUser: Pick<UserData, "id" | "firstName" | "lastName" | "avatar">;
  body: string;
  sentAt: string;
  readAt: string;
};

type MessageFromResponse = Omit<MessageResultData, "fromUser">;
type MessageToResponse = Omit<MessageResultData, "toUser">;

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
  ownerId: number;
  images?: Omit<ImageData, "propertyId">[];
};

type PropertySearchFilters = {
  minPrice?: number;
  maxPrice?: number;
  description?: string;
  limit?: number;
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
  guestId: number;
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

type PropertyResponse = {
  properties: PropertyData[];
  pagination: PaginationInfo;
};

type TokenPayload = Pick<UserData, "isAdmin" | "id">;

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
  PropertyResponse,
  ImageData,
  PaginationInfo,
  MessageQueryResult,
  UserResponse,
  MessageFromResponse,
  MessageToResponse,
  TokenPayload,
};
