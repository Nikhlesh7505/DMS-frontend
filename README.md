# Disaster Management System - Frontend

A React-based frontend for the Disaster Management System with role-based dashboards, real-time alerts, and emergency request management.

## Features

- **Role-Based Dashboards**: Separate views for Admin, NGO/Rescue Teams, and Citizens
- **Real-time Alerts**: View and manage disaster alerts
- **Emergency Requests**: Submit and track emergency requests
- **Weather Monitoring**: View current weather and forecasts
- **Resource Management**: Track and allocate resources
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Charts**: Recharts
- **HTTP Client**: Axios

## Project Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts
│   ├── layouts/        # Page layouts
│   ├── pages/          # Page components
│   │   ├── dashboard/  # Dashboard pages
│   │   ├── disasters/  # Disaster pages
│   │   ├── alerts/     # Alert pages
│   │   └── ...
│   ├── services/       # API services
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Disaster Management System
VITE_APP_VERSION=1.0.0
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## User Roles

### Admin
- Full system access
- Manage users and approvals
- Create disasters and alerts
- View analytics
- Allocate resources

### NGO/Rescue Team
- View assigned tasks
- Update task status
- Manage resources
- Respond to emergency requests
- View alerts and disasters

### Citizen
- Submit emergency requests
- View alerts for their area
- Track request status
- View weather information
- Access emergency contacts

## API Integration

The frontend communicates with the backend API using Axios. All API calls are centralized in `src/services/api.js`.

## License

MIT
