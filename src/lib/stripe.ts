
import { loadStripe } from '@stripe/stripe-js';

// This should be your publishable key from Stripe dashboard
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

export { stripePromise };
