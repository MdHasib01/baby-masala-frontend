<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/81656653-a0ed-4cc6-ab2d-a81d19fec967

## Run Locally

**Prerequisites:**  Node.js, and MongoDB (local or Atlas)

1. Start the API. See [../backend/README.md](../backend/README.md):
   `cd ../backend && npm install && npm run seed && npm run dev`
   (set `MONGODB_URI` in `backend/.env` first)
2. Install dependencies:
   `npm install`
3. Run the app. Vite proxies `/api` to the backend on port 5000:
   `npm run dev`

Demo login: `01712345678`, code `123456`, membership coupon `BABYCARE`.
