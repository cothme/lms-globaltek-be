export default interface User {
  _id?: string;
  given_name?: string;
  family_name?: string;
  stripe_customer_id?: string;
  user_name?: string;
  email?: string;
  subscription_tier?: string;
  picture?: string;
  password?: string;
  isFromGoogle?: Boolean;
}
