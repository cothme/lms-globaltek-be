export default interface User {
  _id?: string;
  given_name?: string;
  family_name?: string;
  user_name?: string;
  email?: string;
  subscription_tier?: string;
  password?: string;
  isFromGoogle?: Boolean;
}
