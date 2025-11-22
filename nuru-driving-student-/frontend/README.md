# Frontend - Standalone HTML Application

This is a standalone frontend application that can be opened directly in your browser.

## How to Use

1. **Start the Backend Server First**
   - Navigate to the `backend` folder
   - Run `npm start` or double-click `START_SERVER.bat` (in the root folder)
   - The backend should be running on `http://localhost:4000`

2. **Open the Frontend**
   - Simply double-click `index.html` in this folder
   - Or right-click and select "Open with" your preferred browser
   - The frontend will automatically connect to the backend API at `http://localhost:4000`

## Features

- **No build process required** - Just open the HTML file
- **Works offline** (once loaded) - All CSS and JavaScript are loaded from CDN
- **Communicates with backend** - All API calls go to `http://localhost:4000`

## Demo Accounts

- **Student**: `student@drivepro.com` / `password123`
- **Instructor**: `instructor@drivepro.com` / `password123`
- **Admin**: `admin@drivepro.com` / `password123`

## Notes

- Make sure the backend is running before opening the frontend
- If you change the backend port, update `API_BASE` in `index.html` (line 715)
- The frontend uses `localStorage` to persist login sessions

