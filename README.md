# ContestOrganizer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern web application to organize and enjoy your sport contests. Built with Stencil.js, this tool helps you manage tournaments, matches, teams, and rankings with an intuitive interface.

## ✨ Features

- 🏆 **Tournament Management**: Create and manage various sport tournaments (Football, Basketball, Rugby, NFL, etc.)
- 👥 **Team Handling**: Add teams with real data from APIs (FutDB, API-Sports)
- 📊 **Live Scoring**: Real-time match updates and scoring
- 🏅 **Ranking System**: Automatic ranking with premium 3D badges
- 🎯 **Match Organization**: Schedule and track match progress
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- npm >= 8.x

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/contest-organizer.git
   cd contest-organizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:3333`

## 📖 Usage

1. **Create a Tournament**: Go to the tournament selection page and create a new contest.
2. **Add Teams**: Select teams from available sports APIs or add custom ones.
3. **Schedule Matches**: Organize matches between teams.
4. **Live Scoring**: Update scores in real-time during matches.
5. **View Rankings**: See live rankings with beautiful 3D badges.

## 🛠️ Build & Deploy

### Development
```bash
npm start  # Dev server with hot reload
```

### Production Build
```bash
npm run build
```

### Testing
```bash
npm test              # Run tests
npm run test.watch    # Watch mode
```

### Deployment
```bash
npm run deploy:prod   # Deploy to production
npm run deploy:preprod  # Deploy to pre-production
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Stencil.js](https://stenciljs.com/)
- UI components from [Shoelace](https://shoelace.style/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Data from [FutDB](https://futdb.app/) and [API-Sports](https://api-sports.io/)