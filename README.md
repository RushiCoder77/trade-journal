# Trade Journal

A clean, minimal web app for logging and reviewing stock market trade setups based on chart patterns.

## Features

### Dashboard
- Total trades logged
- Winning trades count
- Losing trades count
- Win rate percentage
- Average Risk:Reward ratio

### Trade Entry Form
Complete trade logging with:
- Stock Name
- Date
- Pattern Type (VCP, Cup & Handle, Breakout, Pullback, Flag, Other)
- Setup Quality (A+, A, B, C)
- Entry Price, Stop Loss, Target Price
- Risk Percentage
- Trade Status (Planned, Executed, Closed)
- Result (Win, Loss, Breakeven)
- Notes
- Chart Screenshot Upload

### Trades List
- View all trades in a table
- Filter by pattern type, result, and date range
- Sort by date, result, and other fields
- Edit and delete trades

### Trade Detail
- Comprehensive view of all trade information
- Calculated Risk:Reward metrics
- Display uploaded chart images

## Tech Stack

### Frontend
- React 18
- React Router for navigation
- Vite for fast development
- Pure CSS (no frameworks)

### Backend
- Node.js with Express
- SQLite database (file-based, no server needed)
- RESTful API

## Getting Started

### 1. Install Dependencies

```bash
cd /Users/rushikeshkadam/Projects/Trading
npm install
```

### 2. Run the Application

The app runs both frontend and backend simultaneously:

```bash
npm run dev
```

This will start:
- **Backend server** on `http://localhost:5000`
- **Frontend app** on `http://localhost:3000` (opens automatically)

### Alternative: Run Separately

Backend only:
```bash
npm run server
```

Frontend only:
```bash
npm run client
```

### 3. Build for Production

```bash
npm run build
```

## Database

The app uses **SQLite** - a lightweight, file-based database:
- Database file: `server/trades.db`
- No separate database server needed
- All data persists between sessions
- Backup is as simple as copying the `.db` file

## API Endpoints

- `GET /api/trades` - Get all trades
- `GET /api/trades/:id` - Get single trade
- `POST /api/trades` - Create new trade
- `PUT /api/trades/:id` - Update trade
- `DELETE /api/trades/:id` - Delete trade
- `GET /api/health` - Server health check

## UI Features

- **Dark Theme**: TradingView-inspired aesthetics
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Fast & Clean**: Minimal dependencies, optimized performance
- **Modern Design**: Smooth animations, hover effects, and professional look
- **Loading States**: Proper feedback for all async operations

## Project Structure

```
/server
  - index.js          # Express server
  - database.js       # SQLite database layer
  - trades.db         # SQLite database file (auto-created)
/src
  /components
    - Dashboard.jsx / .css
    - TradeForm.jsx / .css
    - TradesList.jsx / .css
    - TradeDetail.jsx / .css
  /context
    - TradesContext.jsx
  /services
    - api.js          # API service layer
  - App.jsx / .css
  - index.css
  - main.jsx
```

## Data Backup

To backup your trades:
1. Copy the `server/trades.db` file
2. Store it safely

To restore:
1. Replace `server/trades.db` with your backup
2. Restart the server

## License

MIT
