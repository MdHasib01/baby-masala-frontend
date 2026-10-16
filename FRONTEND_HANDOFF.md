# Baby Care by Baby Masala — Frontend Handoff & Technical Documentation

This document outlines the complete frontend architecture, service layer contracts, state management, point-award rules, mock data models, and backend integration guidelines for the **Baby Care** application by Baby Masala.

---

## 1. Run & Build Instructions

- **Framework**: React SPA with TypeScript, Vite, and Tailwind CSS (v4).
- **Package Manager**: npm / bun
- **Development Server**:
  ```bash
  npm run dev
  ```
- **Production Build**:
  ```bash
  npm run build
  ```
- **Preview Production Build**:
  ```bash
  npm run preview
  ```

---

## 2. Screen & Route Inventory

The application features a sticky top navigation structure (5 primary tabs) and a sliding left-side profile drawer.

1. **Auth & Onboarding Flow**:
   - `WelcomeScreen`: Branding by Baby Masala, warm mother-focused layout, buttons for “অ্যাকাউন্ট খুলুন” (Sign Up) and “লগইন করুন” (Login).
   - `SignUpScreen`: Name, Email/WhatsApp contact selector with format validation.
   - `LoginVerifyScreen`: 6-digit code verification with paste support, resend countdown, and contact change action.
   - `MembershipActivationScreen`: Fictional membership activation with demo coupon code validation (`BABYCARE` for lifetime free demo access).

2. **Main Application Tabs (Sticky Top Navigation)**:
   - **হোম (Home / Community)**:
     - Community feed with stacked post cards, topic filters (সব পোস্ট, খাবার, ঘুম, বিকাশ, মায়ের গল্প), sorting (newest / popular).
     - Compact composer (mother's avatar, “কী শেয়ার করতে চান?”, photo/video buttons).
     - Recipe & Tips quick shortcut banner.
     - Post interactions: Likes/Reactions (+2 points, one award per user per post), Comments (+2 points), replies, sharing modal with link copying, edit/delete/hide/report.
   - **মাই বেবি (My Baby)**:
     - Child selector for mothers with multiple children.
     - Child photo, name, automatically calculated age from Date of Birth.
     - Add Child & Edit Profile actions.
     - Interactive cards for: খাবারের চার্ট (Food Chart), বয়স অনুযায়ী টিপস (Age-based Tips), প্রস্তাবিত রেসিপি (Suggested Recipes), ডাক্তারকে জিজ্ঞেস করুন (Ask Doctor).
     - Empty state for new users without children.
   - **ফ্রেন্ডস (Friends)**:
     - আমার ফ্রেন্ডস (My Friends), ফ্রেন্ড রিকোয়েস্ট (Friend Requests), মায়েদের খুঁজুন (Find Mothers / Search & Connect).
     - Direct action to start chat in Messenger.
   - **রিওয়ার্ডস (Rewards & Contests)**:
     - Sub-tabs: আমার রিওয়ার্ডস (My Rewards) & কনটেস্ট (Contests).
     - **Available Points Card** with prominent “রিডিম করুন” button.
     - **Point Earning Rules** (“পয়েন্ট পাবেন যেভাবে”): Text/image post (+5), Video post (+10), React (+2), Comment (+2), Shop purchase (product-specific), Contest (contest-specific).
     - **Leaderboard** (“পয়েন্ট লিডারবোর্ড”): Ranked list by total earned points (Rank #1, #2, #3..., avatar, name, total points), highlighting top 3 and current user.
     - **Redeem Catalog** (opens on “রিডিম করুন” click): Gift catalog (Baby Basil, Oregano, Mixed Herbs), gift detail → address → confirmation → success flow. Point deduction and stock tracking.
     - **Contests**: Active contests, My Submissions, Past Winners, and submission modal with order eligibility check.
   - **শপ (Shop)**:
     - Product catalog with categories (হার্বস ও স্পাইস, কম্বো প্যাক), search bar, and product-specific reward points.
     - Product detail modal with weight, rating, stock, reviews count, and add-to-cart action.
     - Slide-over Cart & Checkout modal (Delivery address, order notes, payment method Cash on Delivery / Online, points earned calculation).

3. **Profile Drawer & Secondary Screens**:
   - Left-side navigation drawer (88% width on mobile, max 380px on desktop, backdrop dimming).
   - Links to: Profile, Shortcuts, ফ্রেন্ডস (Friends), মেসেঞ্জার (Messenger with unread badge), রেসিপি ও টিপস (Recipes & Tips), ডাক্তারকে জিজ্ঞেস করুন (Ask Doctor), Orders, Saved posts/recipes, Settings, and Membership.
   - Dedicated screens:
     - `MessengerScreen`: Conversations list, message thread, sending text/media messages, simulated unread badges.
     - `AskDoctorScreen`: Question submission form (category, title, detailed description, optional attachment) and consultation thread with simulated doctor replies.
     - `RecipesScreen`: Filterable recipe library by age group with ingredients, steps, texture notes, allergens, and shop product links.

---

## 3. Mock Service Methods & Data Models (`src/services/babyCareService.ts`)

All local storage persistence and mock state operations are encapsulated behind `babyCareService`:

- `getAuthState()` / `setAuthState(state)`
- `getUser()` / `saveUser(user)`
- `getChildren()` / `saveChildren(children)`
- `getPosts()` / `savePosts(posts)`
- `getComments()` / `saveComments(comments)`
- `getRecipes()` / `saveRecipes(recipes)`
- `getProducts()` / `saveProducts(products)`
- `getSubmissions()` / `saveSubmissions(subs)`
- `getGifts()` / `saveGifts(gifts)`
- `getOrders()` / `saveOrders(orders)`
- `getRewardTx()` / `saveRewardTx(txs)`
- `getGiftRedemptions()` / `saveGiftRedemptions(reds)`
- `getNotifications()` / `saveNotifications(notifs)`
- `getCart()` / `saveCart(cart)`
- `getFriends()` / `saveFriends(friends)`
- `getConversations()` / `saveConversations(convs)`
- `getMessages()` / `saveMessages(msgs)`
- `getDoctors()` / `saveDoctors(docs)`
- `getDoctorQuestions()` / `saveDoctorQuestions(qs)`

---

## 4. Backend Integration Points & API Contracts (Proposed)

When connecting a real production backend, replace the localStorage-backed methods in `babyCareService.ts` with REST/GraphQL endpoints:

1. **Authentication (`/api/auth/*`)**:
   - `POST /api/auth/signup`: Accepts `{ name, contact, method }`. Returns JWT token and user profile.
   - `POST /api/auth/verify-otp`: Accepts `{ contact, code }`. Verifies 6-digit OTP.
   - `POST /api/auth/activate-membership`: Accepts `{ couponCode }`. Validates lifetime/promotional coupon.

2. **Community Feed (`/api/posts/*`)**:
   - `GET /api/posts`: Returns paginated feed posts with reactions and comment counts.
   - `POST /api/posts`: Creates a new post. Triggers server-side point awarding (+5 for text/image, +10 for video).
   - `POST /api/posts/:id/react`: Awards +2 points strictly once per user per post.
   - `POST /api/posts/:id/comments`: Adds a comment and awards +2 points.

3. **Shop & Orders (`/api/shop/*`, `/api/orders/*`)**:
   - `GET /api/products`: Returns product catalog with stock and points earned.
   - `POST /api/orders`: Submits checkout cart. Validates stock, calculates points earned (product-specific), and saves order.

4. **Rewards & Redemptions (`/api/rewards/*`)**:
   - `GET /api/rewards/leaderboard`: Returns ranked users sorted by total earned points.
   - `POST /api/rewards/redeem`: Deducts points from user balance, decreases gift stock, and creates redemption record.

5. **Medical & Social (`/api/doctor/*`, `/api/friends/*`, `/api/messenger/*`)**:
   - `POST /api/doctor/questions`: Submits medical query to verified doctors.
   - `GET /api/messenger/conversations`: Returns user messaging threads.

---

## 5. Point-Award, Redemption & Order Rules

- **Text/Image Post**: +5 points (awarded upon publishing).
- **Video Post**: +10 points total (awarded upon publishing).
- **Post Reaction (Like)**: +2 points (awarded only once per user per post; switching reactions does not award duplicate points).
- **Comment**: +2 points (awarded per comment).
- **Shop Purchase**: Product-specific reward points credited upon order confirmation.
- **Contest Participation**: Contest-specific points credited upon submission.
- **Leaderboard Ranking**: Ranked strictly by **total earned points**, ensuring gift redemptions (`spentPoints`) do not reduce leaderboard ranking.
- **Redemption Validation**: Prevented if available balance (`earnedPoints - spentPoints`) is less than `pointsCost`, or if gift stock is `0`.

---

## 6. Demo Credentials & Coupon

- **Demo Phone / WhatsApp**: `01712345678`
- **OTP Code**: Any 6 digits (e.g., `123456`) or auto-verified via paste.
- **Membership Coupon Code**: `BABYCARE` (grants lifetime free demo access and verifies membership).
