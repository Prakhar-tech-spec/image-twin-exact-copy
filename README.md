# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/6575b3e0-ea97-4058-9c19-0152291f81de

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6575b3e0-ea97-4058-9c19-0152291f81de) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6575b3e0-ea97-4058-9c19-0152291f81de) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# DueDate EMI Manager (Web)

## Features
- Fully offline-capable, browser-based React app
- Persistent data storage using IndexedDB (per user/device)
- Real-time notifications and sound (in-browser)
- All features: dashboard, EMI management, notifications, etc.
- Deployable to Netlify or any static host

## Development

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Run in development mode:**
   ```sh
   npm run dev
   ```
   - The app will open in your browser at `http://localhost:5173` (or similar).

## Build for Production

1. **Build the app:**
   ```sh
   npm run build
   ```
   - The production-ready files will be in the `dist/` folder.

## Deploy to Netlify

1. **Push your code to GitHub/GitLab/Bitbucket.**
2. **Go to [Netlify](https://netlify.com/)** and create a new site from your repo.
3. **Set the build command:**
   ```sh
   npm run build
   ```
4. **Set the publish directory:**
   ```
   dist
   ```
5. **Deploy!**

## Data Storage
- All customer and EMI data is stored in the browser using IndexedDB.
- Data is persistent per user/device, but not shared between devices.

## Notifications
- In-browser notifications and sound are supported for EMI reminders and alerts.

## Security
- All data stays in the user's browser. No server or cloud storage is used.

## Notes
- The app is now frontend-only. All backend and Electron code has been removed.
- Works on any modern browser, on any device.
