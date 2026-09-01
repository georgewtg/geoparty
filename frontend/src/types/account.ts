export type RegisterAccountPayload = {
  email: string;
  username: string;
  password: string;
};

export type LoginAccountPayload = {
  email_or_username: string;
  password: string;
};

export type AccountData = {
  id: string;
  email: string;
  username: string;
};

export type AuthContextData = {
  isAuthenticated: boolean;
  user: AccountData | null;
}