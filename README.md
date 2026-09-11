# 🎓 Student Sphere

**Student Sphere** is a collaborative college notice board and community platform where students can share ideas, post campus notices, announce events, report lost items, and form study groups.

Built with **Next.js 16 (App Router)**, **React 19**, **CSS Modules**, and an embedded **SQLite** database.

---

## 🚀 Running on Localhost

Student Sphere is **zero-config**: it does not require external databases, API keys, or Docker containers. Everything runs out of the box with embedded SQLite and Node.js built-in cryptography.

### 1. Prerequisites

Make sure you have the following installed on your machine:
- **[Node.js](https://nodejs.org/)** (v18.18.0 or v20+ recommended)
- **npm** (comes bundled with Node.js) or **yarn** / **pnpm**
- **Git**

Verify your installation:
```bash
node -v
npm -v
```

---

### 2. Step-by-Step Local Setup

#### Step 1: Clone the Repository
```bash
git clone https://github.com/prudhvinathreddy1904/Student-Sphere.git
cd Student-Sphere
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Start the Development Server
```bash
npm run dev
```

The server will start on [http://localhost:3000](http://localhost:3000).

---

### 3. Local Routes & Navigation

Once the dev server is running, open your browser and visit:

| Route | URL | Description |
|-------|-----|-------------|
| **Home / Landing** | [http://localhost:3000](http://localhost:3000) | Landing page with hero banner and quick navigation |
| **Notice Board** | [http://localhost:3000/board](http://localhost:3000/board) | Main board with all posts, search, category filters, and sorting |
| **Sign Up** | [http://localhost:3000/signup](http://localhost:3000/signup) | Create a new student account |
| **Log In** | [http://localhost:3000/login](http://localhost:3000/login) | Log into an existing student account |
| **Post Details** | `http://localhost:3000/board/post/[id]` | Full post view with discussion and comment section |

---

### 4. Local Testing & Verification Workflow

To test all features locally:

1. **Sign Up**: Navigate to [http://localhost:3000/signup](http://localhost:3000/signup) and register an account (e.g. username, display name, email, password).
2. **Explore the Board**: Head to [http://localhost:3000/board](http://localhost:3000/board).
3. **Create a Post**: Click **+ Create Post**, choose a category (*Idea, Notice, Event, Lost & Found, Study Group*), add tags, and publish.
4. **Upvote**: Click the vote arrow on any post to toggle your vote.
5. **Join the Discussion**: Click on a post card to open the detail page and leave comments.
6. **Edit / Delete**: As the post author, click the edit or delete options on your posts to verify owner permissions.
7. **Search & Filter**: Test category tabs, sort by *Newest* vs *Most Voted*, and use the search bar.
8. **Log Out**: Click your profile icon/logout button in the navigation bar.

---

### 5. Local Database Management

- The project uses **SQLite** powered by `better-sqlite3`.
- The database file is automatically created at `data/campusconnect.db` upon first launch.
- Database tables and schema migrations run automatically.
- **To reset your local database to a clean state**:
  ```bash
  # Stop the dev server (Ctrl + C), then remove the data folder:
  # On Windows (PowerShell):
  Remove-Item -Recurse -Force data/*.db*
  # On macOS/Linux:
  rm -f data/*.db*
  ```
  Restarting `npm run dev` will recreate fresh database tables.

---

### 6. Troubleshooting Localhost

- **Port 3000 already in use?**  
  Run on an alternative port (e.g. 3001):
  ```bash
  npm run dev -- -p 3001
  ```
  Then open [http://localhost:3001](http://localhost:3001).

- **Native module compilation (`better-sqlite3`)**:  
  Ensure you have a standard C++ build toolchain installed if prompted:
  - **Windows**: `npm install --global --production windows-build-tools` or install Visual Studio Build Tools with C++ workload.
  - **macOS**: `xcode-select --install`
  - **Linux (Ubuntu/Debian)**: `sudo apt-get install build-essential python3`

---

### 7. Production Build on Localhost

To test the optimized production build locally:

```bash
# Build the application
npm run build

# Start the production server
npm run start
```
Open [http://localhost:3000](http://localhost:3000) to view the production build.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Styling**: Vanilla CSS Modules (custom theme with responsive layouts)
- **Database**: [SQLite](https://www.sqlite.org/) via `better-sqlite3` (WAL mode enabled)
- **Authentication**: Custom HTTP-only session cookies with PBKDF2 hashing (`crypto`)
- **Type Safety**: TypeScript 5

---

## 📁 Project Structure

```
├── app/
│   ├── page.tsx                     # Landing page
│   ├── layout.tsx                   # Root HTML layout and fonts
│   ├── globals.css                  # Global styles & design tokens
│   ├── login/                       # User authentication login
│   ├── signup/                      # User registration
│   ├── board/
│   │   ├── page.tsx                 # Feed page with search & filters
│   │   ├── layout.tsx               # Board layout with persistent nav
│   │   ├── components/              # PostCard, CreatePostModal, SearchFilter, etc.
│   │   └── post/[id]/               # Post detail view & comment thread
│   └── api/
│       ├── auth/                    # login, signup, logout, session check (me)
│       └── posts/                   # CRUD operations, voting, comments
├── data/                            # Local SQLite database (git-ignored)
├── lib/
│   ├── db.ts                        # SQLite connection, schemas, queries
│   └── auth.ts                      # PBKDF2 password hashing & session helpers
├── package.json
└── README.md
```

---

## 📄 License

Built for GCSRM Recruitment 2026 — Technical Track (Web Development).
