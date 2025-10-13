# Payments Setup (Stripe)

Goal: Create a $150/mo subscription checkout.

Steps
1) Products → Add product → Name: “Social Growth (3 channels)” → Recurring price: $150/month.
2) Create payment link (Checkout) and copy the URL.
3) Paste the URL into website/index.html as {{CHECKOUT_URL}}.
4) Optional: Add 7-day trial.
5) Enable email receipts and failed payment notifications.

Customer Portal (optional)
- Enable Stripe Customer Portal for self-serve cancellations.

Automations
- On successful checkout: send onboarding form link automatically (Stripe → Zapier → Email).
