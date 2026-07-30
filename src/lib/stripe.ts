import "server-only"
import Stripe from "stripe"

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error(
        "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment variables to accept payments."
      )
    }
    _stripe = new Stripe(key, {
      apiVersion: "2026-07-29.dahlia",
      typescript: true,
    })
  }
  return _stripe
}
