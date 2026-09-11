# 🎓 Student Sphere

**Student Sphere** is a collaborative college notice board where students can share ideas, post notices, announce events, find lost items, and form study groups — all in one place.

## What It Does

- **Share & Discover** — Post ideas, notices, events, lost-and-found alerts, or study group invitations. Browse what others are sharing in real time.
- **Vote & Engage** — Upvote posts you find useful. Comment to start conversations and connect with fellow students.
- **Search & Filter** — Quickly find what matters using category filters, keyword search, and sorting by newest or most voted.
- **Your Posts, Your Control** — Sign up, log in, and manage your own posts. Only you can edit or delete what you've created.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Frontend | React 19, CSS Modules |
| Backend | Next.js Route Handlers (API) |
| Database | SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| Auth | Cookie-based sessions with PBKDF2 password hashing |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Once the dev server is running, open:
- **Landing Page**: [http://localhost:3000](http://localhost:3000) (or [http://127.0.0.1:3000](http://127.0.0.1:3000))
- **Campus Board**: [http://localhost:3000/board](http://localhost:3000/board)

> *Note: If PowerShell blocks running `npm`, use `npm.cmd run dev` or `npx next dev`.*

## Features

- ✅ Full CRUD — Create, read, update, and delete posts
- ✅ Authentication — Signup & login with secure password hashing
- ✅ Upvoting — Toggle votes (one per user per post)
- ✅ Comments — Threaded comments on every post
- ✅ Categories — Idea, Notice, Event, Lost & Found, Study Group
- ✅ Search & Filter — Full-text search + category filtering + sort
- ✅ Responsive UI — Works on mobile, tablet, and desktop
- ✅ Loading Skeletons — Smooth loading states throughout
- ✅ Empty States — Friendly messages when no content matches
- ✅ Form Validation — Client-side validation with inline errors

## Project Structure

```
app/
├── page.tsx                    # Landing page
├── login/page.tsx              # Login page
├── signup/page.tsx             # Signup page
├── board/
│   ├── page.tsx                # Main board (post feed)
│   ├── layout.tsx              # Board layout (header + nav)
│   ├── components/             # PostCard, CreateModal, Search, etc.
│   └── post/[id]/page.tsx      # Post detail + comments
├── api/
│   ├── auth/                   # signup, login, logout, me
│   └── posts/                  # CRUD, vote, comments
lib/
├── db.ts                       # Database schema + queries
└── auth.ts                     # Password hashing + sessions
```

## License

Built for GCSRM Recruitment 2026 — Technical Track (Web Development).
