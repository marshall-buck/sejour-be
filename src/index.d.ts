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

export { UserData, MessageData };
