# bookenzy-ui

Front end for Bookenzy, a reading tracker. React + TypeScript + Tailwind CSS.

**Live demo:** https://anusha267.github.io/bookenzy-ui

## What exists today

A reading shelf with three columns: Want to read, Reading, Finished.

- Add a book (title and author)
- Move a book between shelves
- Rate a book 1 to 5 stars
- Remove a book
- Search millions of books as you type (title) using the free [Open Library](https://openlibrary.org) API, with covers, page counts and year
- Reading stats: books, finished, pages read, average rating
- Filter the shelf by title or author
- Export your shelf as JSON

**Two modes**

- **Demo mode** (default, no account): the shelf is saved in your browser's local storage.
- **Signed in**: register or sign in and your shelf is stored on the [bookenzy-backend](https://github.com/anusha267/bookenzy-backend) API (https://bookenzy-backend.onrender.com), so it follows you across devices. Sessions last one hour; after that you are asked to sign in again.

The API runs on a free tier that sleeps when idle, so the first sign-in or load after a quiet spell can take up to a minute.

## Run it locally

```bash
git clone https://github.com/anusha267/bookenzy-ui.git
cd bookenzy-ui
npm install
npm start      # http://localhost:3000
npm test       # unit tests (React Testing Library)
npm run build  # production build in build/
```

Point the UI at another API with `REACT_APP_API_URL` (default: the hosted backend above).

## Deployment

Pushes to `main` build the app and publish it to GitHub Pages through the workflow in `.github/workflows`. `npm run deploy` (gh-pages) also works. The Pages source must be set to "GitHub Actions" in the repository settings.

## Roadmap

- Reading goals and progress tracking
- Recommendations

## Tech

React 18, TypeScript, Tailwind CSS, Create React App.
