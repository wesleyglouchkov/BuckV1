import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-11-17.clover',
});

// Client-side Stripe instance
let stripePromise: Promise<any> | null = null;
export const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
    }
    return stripePromise;
};

// BUCK Coin conversion rate
export const BUCK_COIN_TO_USD = 1; // 1 BUCK = $1 USD
