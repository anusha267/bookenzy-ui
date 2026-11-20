# bookenzy-ui

Front end for Bookenzy, a reading tracker. React + TypeScript + Tailwind CSS.

**Live demo:** https://anusha267.github.io/bookenzy-ui

## What exists today

A reading shelf with three columns: Want to read, Reading, Finished.

- Add a book (title and author)
- Move a book between shelves
- Rate a book 1 to 5 stars
- Remove a book

**Demo mode:** the shelf is saved in your browser's local storage. It is not connected to the [bookenzy-backend](https://github.com/anusha267/bookenzy-backend) API yet, so there are no accounts and nothing syncs between devices. The backend currently supports registration and login only.

## Run it locally

```bash
git clone https://github.com/anusha267/bookenzy-ui.git
cd bookenzy-ui
npm install
npm start      # http://localhost:3000
npm test       # unit tests (React Testing Library)
npm run build  # production build in build/
```

## Deployment

Pushes to `main` build the app and publish it to GitHub Pages through the workflow in `.github/workflows`. `npm run deploy` (gh-pages) also works. The Pages source must be set to "GitHub Actions" in the repository settings.

## Roadmap

- Sign in and register against the backend
- Load and save the shelf through the API
- Book search and cover images

## Tech

React 18, TypeScript, Tailwind CSS, Create React App.
