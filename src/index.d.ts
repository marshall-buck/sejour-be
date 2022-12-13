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
  to_username: UserData;
  from_username: UserData;
  body: string;
  sent_at: string;
  read_at: string;
  first_name: string;
  last_name: string;
};

export { UserData, MessageData };
