# Kontent.ai Custom App Dashboard

A React-based dashboard application designed to work as a custom app within the Kontent.ai platform. This app provides content management, user management, and analytics features using the official Kontent.ai APIs.

## Features

- **Content Management** - View and manage content items using the Management API
- **User Management** - Manage users using the Subscription API
- **Analytics** - View content analytics and performance metrics
- **API Key Management** - Secure input of API keys through modal interface
- **Real-time Integration** - Works with live Kontent.ai data

## Architecture

### SDK Implementation
The app uses a custom SDK implementation that:
- Communicates with the parent Kontent.ai window when embedded as an iframe
- Requires proper Kontent.ai environment for full functionality
- Handles iframe messaging for context and configuration retrieval

### API Integration
- **Management API** - For all content-related operations
- **Subscription API** - For user management operations
- **Custom App SDK** - For context and configuration

## Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation
```bash
npm install
```

### Running the App
```bash
npm start
```

The app will run at `http://localhost:3000`

### API Keys
When running the app, you'll need to provide:
1. **Management API Key** - For content operations
2. **Subscription API Key** - For user management
3. **Subscription ID** - For user management
4. **Environment ID** - Your Kontent.ai environment ID

Click the "API Keys" button in the header to configure these.

**Note:** This app is designed to run within Kontent.ai as a custom app. For development, you can configure API keys manually, but full functionality requires the Kontent.ai environment.

## Production Deployment

### As a Kontent.ai Custom App
1. Build the app: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure the custom app in Kontent.ai with the deployed URL
4. The app will automatically detect the Kontent.ai environment and use the real SDK

### Standalone Deployment
1. Build the app: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure API keys through the modal interface

## SDK Behavior

### In Kontent.ai Environment
- Detects iframe environment
- Communicates with parent window
- Retrieves real context and configuration
- Uses official APIs with provided credentials

### In Development Environment
- Returns error indicating app must be embedded in Kontent.ai
- Requires manual API key configuration for testing
- Limited functionality without proper Kontent.ai context

## API Usage

### Management API
- Content item retrieval and management
- Workflow operations
- Content type and collection management

### Subscription API
- User management
- User creation and updates
- Role management

## Security

- API keys are stored in memory only
- No persistent storage of sensitive data
- Secure iframe communication with parent window
- HTTPS required for production deployment

## Troubleshooting

### Common Issues
1. **API Key Errors** - Ensure valid Management and Subscription API keys
2. **CORS Issues** - Ensure proper CORS configuration for iframe embedding
3. **SDK Communication** - Check iframe messaging in browser console

### Development Tips
- Use browser dev tools to monitor iframe communication
- Check network tab for API call failures
- Verify API key permissions in Kontent.ai

## License

MIT License 