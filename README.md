# Kontent.ai Content Management Dashboard

A comprehensive custom app for Kontent.ai that provides a management dashboard for content assignment, user management, and analytics. This dashboard allows editors to assign pieces of content to content creators in bulk and provides useful features for content management.

## Features

### 🎯 Core Features

- **Bulk Content Assignment**: Select multiple content items and assign them to creators in bulk
- **User Management**: Manage content creators, their roles, and performance tracking
- **Content Overview**: Comprehensive view of all content with filtering and sorting
- **Analytics Dashboard**: Performance metrics, trends, and insights
- **Real-time Updates**: Live data synchronization with Kontent.ai

### 📊 Dashboard Sections

1. **Dashboard**: Overview with key metrics and recent activity
2. **Content Assignment**: Bulk assignment interface with filtering and search
3. **Content Overview**: Detailed content management with status tracking
4. **User Management**: Creator profiles, performance metrics, and role management
5. **Analytics**: Performance insights, trends, and reporting

### 🎨 User Interface

- Modern, responsive design that matches Kontent.ai's design system
- Intuitive navigation with tab-based interface
- Real-time search and filtering capabilities
- Modal dialogs for detailed operations
- Status badges and priority indicators
- Performance charts and visualizations

## Technology Stack

- **Frontend**: React 18 with modern hooks
- **Styling**: CSS with CSS variables for theming
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Webpack with Babel for transpilation
- **SDK**: Kontent.ai Custom App SDK for integration
- **APIs**: Kontent.ai Management SDK and Subscription API

## API Integration

This dashboard integrates with multiple Kontent.ai APIs:

### Management SDK
- **Content Management**: Create, read, update, and delete content items
- **User Management**: Manage users, roles, and permissions
- **Workflow Management**: Change content item workflow states
- **Collections**: Organize content by collections
- **Content Types**: Manage content type definitions

### Subscription API
- **Project Information**: Get project details and settings
- **Usage Limits**: Monitor API usage and limits
- **Plan Features**: Access subscription plan features
- **Billing Information**: View billing and plan details

### Delivery SDK
- **Content Retrieval**: Fetch published content for analytics
- **Content Preview**: Access preview content for management
- **Localization**: Handle multi-language content

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Kontent.ai account with custom apps enabled
- Management API access (API key required)
- Subscription API access (optional, for enhanced features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kontent-dashboard-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API access**
   
   Create a `.env` file in the root directory:
   ```env
   # Required - Management API key for core functionality
   REACT_APP_KONTENT_MANAGEMENT_API_KEY=your-management-api-key
   
   # Optional - Subscription API key for enhanced features
   REACT_APP_KONTENT_SUBSCRIPTION_API_KEY=your-subscription-api-key
   
   # Optional - Subscription ID for subscription API calls
   REACT_APP_KONTENT_SUBSCRIPTION_ID=your-subscription-id
   
   # Optional - Project and environment IDs
   REACT_APP_KONTENT_PROJECT_ID=your-project-id
   REACT_APP_KONTENT_ENVIRONMENT_ID=your-environment-id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Development

The development server will start on `http://localhost:3000` with hot reloading enabled.

### Building for Kontent.ai

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your web hosting service

3. **Configure in Kontent.ai**:
   - Go to your Kontent.ai project settings
   - Navigate to Custom Apps
   - Add a new custom app
   - Set the URL to your deployed application
   - Configure permissions as needed
   - Add your API keys and subscription ID to the custom app configuration

## Project Structure

```
dashboard-app/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/         # React components
│   │   ├── Dashboard.js
│   │   ├── ContentAssignment.js
│   │   ├── ContentOverview.js
│   │   ├── UserManagement.js
│   │   └── Analytics.js
│   ├── services/
│   │   └── kontentService.js  # API integration layer
│   ├── styles/
│   │   └── global.css      # Global styles
│   ├── App.js              # Main app component
│   └── index.js            # Entry point
├── package.json            # Dependencies and scripts
├── webpack.config.js       # Build configuration
└── README.md              # This file
```

## Key Components

### Content Assignment
- **Bulk Selection**: Checkbox-based selection of multiple content items
- **Advanced Filtering**: Filter by status, type, and search terms
- **Assignment Modal**: Set due dates, notes, and assignee information
- **Real-time Updates**: Immediate feedback on assignment status
- **API Integration**: Uses Management SDK for content updates

### User Management
- **Creator Profiles**: Detailed user information and performance metrics
- **Role Management**: Assign and manage user roles and permissions
- **Performance Tracking**: Completion rates and assignment statistics
- **Contact Integration**: Direct communication with creators
- **API Integration**: Uses Management SDK for user operations

### Analytics Dashboard
- **Performance Metrics**: Key performance indicators and trends
- **Visual Charts**: Monthly trends and content type distribution
- **Top Performers**: Leaderboard of most productive creators
- **Insights**: Automated insights and recommendations
- **API Integration**: Combines Management and Delivery SDKs

## API Configuration

### Required Permissions

Your Management API key needs the following permissions:
- **Content Management**: Read and write access to content items
- **User Management**: Read access to users and roles
- **Project Management**: Read access to project information
- **Workflow Management**: Read and write access to workflow states

Your Subscription API key needs the following permissions:
- **Subscription Management**: Read access to subscription information
- **Billing Information**: Read access to billing details
- **Usage Monitoring**: Read access to usage statistics

### Environment Variables

```env
# Required - Management API key for core functionality
REACT_APP_KONTENT_MANAGEMENT_API_KEY=your-management-api-key

# Optional - Subscription API key for enhanced features
REACT_APP_KONTENT_SUBSCRIPTION_API_KEY=your-subscription-api-key

# Optional - Subscription ID for subscription API calls
REACT_APP_KONTENT_SUBSCRIPTION_ID=your-subscription-id

# Optional - Project and environment IDs
REACT_APP_KONTENT_PROJECT_ID=your-project-id
REACT_APP_KONTENT_ENVIRONMENT_ID=your-environment-id
```

### Custom App Configuration

In your Kontent.ai custom app settings, add the following JSON configuration:

```json
{
  "managementApiKey": "your-management-api-key",
  "subscriptionApiKey": "your-subscription-api-key",
  "subscriptionId": "your-subscription-id",
  "projectId": "your-project-id",
  "environmentId": "your-environment-id"
}
```

## Integration with Kontent.ai

### SDK Integration
The app uses multiple Kontent.ai SDKs:
- **Custom App SDK**: For authentication and context
- **Management SDK**: For content and user management
- **Delivery SDK**: For content retrieval and analytics

### API Endpoints
The service layer integrates with:
- **Content Management API**: For content operations
- **Management API**: For user and project management
- **Delivery API**: For content retrieval
- **Subscription API**: For project and billing information

### Customization
The app is designed to be easily customizable:
- Modify the color scheme in `src/styles/global.css`
- Add new dashboard sections in `src/App.js`
- Extend functionality in individual components
- Add new API integrations in `src/services/kontentService.js`

## Configuration

### Environment Variables
Create a `.env` file for environment-specific configuration:
```
# Required - Management API key for core functionality
REACT_APP_KONTENT_MANAGEMENT_API_KEY=your-management-api-key

# Optional - Subscription API key for enhanced features
REACT_APP_KONTENT_SUBSCRIPTION_API_KEY=your-subscription-api-key

# Optional - Subscription ID for subscription API calls
REACT_APP_KONTENT_SUBSCRIPTION_ID=your-subscription-id

# Optional - Project and environment IDs
REACT_APP_KONTENT_PROJECT_ID=your-project-id
REACT_APP_KONTENT_ENVIRONMENT_ID=your-environment-id
```

### Customization Options
- **Branding**: Update colors and logos in the CSS variables
- **Permissions**: Configure user roles and access levels
- **Workflows**: Customize content assignment workflows
- **Notifications**: Add email or in-app notifications
- **API Integration**: Extend the service layer for additional APIs

## Deployment

### Static Hosting
The built application can be deployed to any static hosting service:
- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your repository for automatic deployments
- **AWS S3**: Upload the `dist` folder to an S3 bucket
- **GitHub Pages**: Deploy directly from the repository

### Custom Domain
Configure your custom domain in your hosting provider and update the URL in Kontent.ai.

### Security Considerations
- Store API keys securely in environment variables
- Use HTTPS for all deployments
- Configure CORS properly for API access
- Implement proper error handling for API failures
- Keep API keys separate and secure

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the [Kontent.ai documentation](https://kontent.ai/learn/docs/custom-apps)
- Review the [Management SDK documentation](https://github.com/kontent-ai/management-sdk-js)
- Review the [Custom App SDK documentation](https://github.com/kontent-ai/custom-app-sdk-js)
- Open an issue in this repository

## Roadmap

- [ ] Real-time collaboration features
- [ ] Advanced reporting and exports
- [ ] Mobile-responsive improvements
- [ ] Integration with external tools
- [ ] Advanced workflow automation
- [ ] Multi-language support
- [ ] Enhanced analytics with Delivery API
- [ ] Subscription usage monitoring
- [ ] Automated content workflows 