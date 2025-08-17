# Disney Wait Times App

A React Native Expo application for tracking real-time wait times at Disney theme parks.

## 📱 Features

- Real-time wait time updates for Disney attractions
- Search functionality to quickly find specific rides
- Filter attractions by park location
- Set custom wait time alerts for favorite attractions
- Clean, intuitive user interface with card-based design
- Debug logging for development troubleshooting

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cruz-andr/DIsneyApp.git
cd DisneyWaitTimes
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Scan the QR code with Expo Go (Android) or Camera app (iOS)

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Start on Android emulator/device
- `npm run ios` - Start on iOS simulator/device
- `npm run web` - Start web version
- `node show-qr.js` - Display QR code in terminal (debug utility)

## 🛠️ Debug Features

This development version includes several debug features:

- **Console Logging**: All API calls and state changes are logged to console
- **Metro Config Logging**: Custom metro configuration with detailed bundler logs
- **QR Code Terminal Display**: Utility script to display connection QR code
- **Network Request Monitoring**: Track all API calls to Disney endpoints

These features are intentionally retained for ongoing development and troubleshooting.

## 📡 API Endpoints

The app connects to Disney's wait time APIs:
- Base URL: Configured in `services/waitTimesService.ts`
- Endpoints:
  - `/attractions` - Get all attractions with current wait times
  - `/parks` - Get park information and operating hours
  - `/alerts` - Manage wait time notifications

## 🏗️ Project Structure

```
DisneyWaitTimes/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── WaitTimeCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterSheet.tsx
│   │   └── WaitTimeAlertModal.tsx
│   ├── screens/          # Main app screens
│   │   └── WaitTimesScreen.tsx
│   ├── services/         # API and notification services
│   │   ├── waitTimesService.ts
│   │   └── notificationService.ts
│   ├── constants/        # App constants and configuration
│   │   └── parks.ts
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── assets/              # Images and icons
├── App.tsx              # Main app component
├── app.json            # Expo configuration
└── package.json        # Dependencies and scripts
```

## 🔮 Future Scalability Plans

### Planned Features
- **Multi-park Support**: Expand beyond current parks to include all Disney locations worldwide
- **Historical Data**: Track and display wait time trends over time
- **Crowd Calendar**: Predict busy times based on historical patterns
- **FastPass Integration**: Show FastPass availability and booking options
- **Social Features**: Share wait times and tips with other users
- **Offline Mode**: Cache data for viewing when internet connection is unavailable

### Technical Improvements
- **State Management**: Implement Redux or Zustand for complex state
- **API Caching**: Add sophisticated caching strategies to reduce API calls
- **Performance Optimization**: Implement lazy loading and virtualized lists
- **Testing Suite**: Add comprehensive unit and integration tests
- **CI/CD Pipeline**: Automate builds and deployments
- **Analytics**: Track user behavior to improve app experience

## 🤝 Contributing

This project is in active development. Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is for educational and personal use only. Disney and all related properties are trademarks of The Walt Disney Company.

## 👤 Author

**Andrés Cruz**
- GitHub: [@cruz-andr](https://github.com/cruz-andr)

## 🙏 Acknowledgments

- Disney for providing the magical experiences
- Expo team for the excellent React Native framework
- All contributors and testers