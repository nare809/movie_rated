# VidPlay - Modern Movie & TV Streaming App

VidPlay is a premium, high-performance React application for browsing and tracking movies and TV shows. It features a modern, responsive UI, real-time user libraries, and advanced Server-Side SEO powered by Cloudflare Edge Functions.

## 🚀 Features

- **🎬 extensive Library**: Browse trending, popular, and top-rated Movies and TV shows using the TMDB API.
- **🔍 Search & Discovery**: Powerful search with instant results for movies, shows, and people.
- **👤 User Accounts**: Secure authentication via Firebase.
- **❤️ Favorites & Watchlist**: Real-time synchronization of your personal library across devices.
- **⚡ Edge-Side SEO**:
  - **Dynamic Meta Tags**: Server-side injection of Open Graph tags for rich social sharing (Twitter, Facebook, Discord).
  - **Rich Snippets**: Automatic Schema.org JSON-LD generation for Google Search star ratings.
  - **Dynamic Sitemap**: Auto-updating `sitemap.xml` that fetches trending content daily.
- **📱 Responsive Design**: A stunning, "Netflix-style" interface built with Tailwind CSS.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4, Lucide React (Icons)
- **Routing**: React Router v7
- **State/Data**: React Query, Context API
- **Backend/Auth**: Firebase (Auth, Firestore)
- **Deployment**: Cloudflare Pages (Advanced Mode with Workers)

## 📦 Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/nare809/movie-rated.git
    cd movie-rate
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory (though the app has fallbacks, it's best to configure your own):
    ```env
    VITE_TMDB_API_KEY=your_tmdb_api_key
    VITE_FIREBASE_API_KEY=your_firebase_key
    # ... other firebase config keys
    ```

## 💻 Development

Start the local development server:

```bash
npm run dev
```

Visit `http://localhost:5173` to view the app.

## 🏗️ Build & Deployment

This project uses a hybrid build system to support both the Client (SPA) and the Server (Edge Functions).

### The "One Command" Build

We have automated the entire process. Simply run:

```bash
npm run build
```

**What this does:**

1.  **TypeScript Check**: Verifies type safety.
2.  **Vite Build**: Compiles the React application to `dist/`.
3.  **Worker Compilation**: Runs `scripts/build-worker.js` to compile all Cloudflare Functions (`functions/`) into a single optimzed `dist/_worker.js` file.

### deploy to Cloudflare Pages

**Method 1: Direct Upload (Drag & Drop)**

1.  Run `npm run build`.
2.  Go to your Cloudflare Pages Dashboard -> Create Project -> Direct Upload.
3.  Upload the entire **`dist`** folder.
    - _Note: Because we use Advanced Mode (`_worker.js`), this method DOES safely deploy your SEO functions!_

**Method 2: CLI (Wrangler)** (Recommended)

```bash
npx wrangler pages deploy dist --project-name vidplay
```

## 📂 Project Structure

```
/
├── dist/                  # Production build output
│   ├── _worker.js         # Compiled Edge Functions (Server)
│   ├── index.html         # Client Entry
│   └── assets/            # CSS/JS
├── functions/             # Cloudflare Edge Functions (Source)
│   ├── movie/[[path]].js  # SEO for Movies
│   ├── tv/[[path]].js     # SEO for TV Shows
│   └── sitemap.xml.js     # Dynamic Sitemap
├── public/                # Static assets (robots.txt, images)
├── scripts/               # Build utilities (build-worker.js)
├── src/                   # React Source Code
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route pages (Home, Player, etc.)
│   ├── services/          # API services (TMDB, Firebase)
│   └── hooks/             # Custom React Hooks
└── task.md                # Development Log
```

## 🧩 Edge SEO Implementation

We bypass the limitations of SPAs (Single Page Applications) by using Cloudflare Workers to intercept requests.

1.  **Crawler hits `/movie/123`**.
2.  **Worker Intercepts**: `functions/movie/[[path]].js` runs before the page loads.
3.  **Fetch Data**: Worker calls TMDB API to get movie details.
4.  **Inject HTML**: Uses `HTMLRewriter` to inject `<title>`, `<meta>`, and `JSON-LD` into the HTML stream.
5.  **Serve**: The user/bot receives a fully rendered page with perfect metadata.

---

Built with ❤️ by iitzthop
