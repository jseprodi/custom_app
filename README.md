# Kontent.ai Dashboard Custom App

A comprehensive custom app for Kontent.ai that provides a management dashboard for bulk content assignment, user management, and analytics. This app integrates with Kontent.ai's Management API and Subscription API to offer enhanced content management capabilities.

## 🚀 Features

### Content Assignment
- **Bulk Assignment**: Assign multiple content items to users at once
- **Individual Assignment**: Assign specific content items to contributors
- **Assignment Management**: View, modify, and remove existing assignments
- **Due Date Tracking**: Set and track assignment deadlines
- **Assignment Notes**: Add context and instructions for assignments

### Content Overview
- **Content Grid**: Visual grid layout of all content items
- **Advanced Filtering**: Filter by status, type, priority, and more
- **Search Functionality**: Search content by name, type, or other attributes
- **Status Tracking**: Real-time status updates and workflow management
- **Priority Management**: Visual priority indicators and sorting

### User Management
- **User Directory**: View all users and their roles
- **Assignment History**: Track user assignment history and workload
- **Performance Metrics**: View completion rates and productivity stats
- **Role Management**: Manage user roles and permissions

### Analytics Dashboard
- **Content Statistics**: Overview of content items, assignments, and completion rates
- **User Performance**: Individual and team performance metrics
- **Trend Analysis**: Track content creation and completion trends
- **Real-time Updates**: Live data updates and notifications

## 📋 Prerequisites

- Kontent.ai project with Management & Subscription API access
- Node.js 16+ and npm
- Modern web browser
- Vercel account (for deployment)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/kontent-dashboard-app.git
cd kontent-dashboard-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
KONTENT_MANAGEMENT_API_KEY=your_management_api_key
KONTENT_PROJECT_ID=your_project_id
KONTENT_ENVIRONMENT_ID=your_environment_id
```

### 4. Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:8080`


### Custom App Setup in Kontent.ai
1. Go to your Kontent.ai project settings
2. Navigate to "Custom apps"
3. Add a new custom app
4. Set the app URL to your deployed application
5. Configure permissions for Management and Subscription API access

## 📖 Usage

### Content Assignment
1. Navigate to the "Content Assignment" tab
2. Select content items using checkboxes
3. Choose a user from the dropdown
4. Set optional due date and notes
5. Click "Assign Selected" to create assignments

### Content Overview
1. Use the "Content Overview" tab to browse content
2. Apply filters to narrow down results
3. Use search to find specific content
4. Click on content items for detailed information

### User Management
1. Access the "User Management" tab
2. View user profiles and assignment history
3. Monitor performance metrics
4. Contact users or view their work

### Analytics
1. Check the "Analytics" tab for insights
2. View content statistics and trends
3. Monitor team performance
4. Track completion rates

## 🏗️ Architecture

### Frontend
- **React 18**: Modern React with hooks
- **Webpack 5**: Module bundling and development server
- **CSS Modules**: Scoped styling
- **Lucide React**: Icon library

### Backend Integration
- **Kontent.ai Management SDK**: Content management operations
- **Language Variants**: Multi-language content support
- **Contributor System**: User assignment management
- **Workflow Integration**: Status and approval workflows

### File Structure
```
src/
├── components/          # React components
│   ├── Dashboard.js     # Main dashboard
│   ├── ContentAssignment.js
│   ├── ContentOverview.js
│   ├── UserManagement.js
│   └── Analytics.js
├── services/            # API services
│   ├── kontentService.js
│   └── sdkWrapper.js
├── styles/              # Global styles
│   └── global.css
└── index.js            # App entry point
```

## 🔒 Security

- User permissions are respected through Kontent.ai's role system
- HTTPS is enforced in production

## 🐛 Troubleshooting

### Common Issues

**App not loading**
- Verify API key has proper permissions
- Check browser console for errors

**Assignments not saving**
- Ensure user has contributor permissions
- Check language variant exists
- Verify Management & Subscription API access

**Content not displaying**
- Check environment ID and subscription ID
- Verify content items exist
- Check API rate limits

### Debug Tools
The app includes built-in debug tools:
- Language detection testing
- API response structure validation
- Assignment data structure testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section above
- Review Kontent.ai documentation
- Open an issue in this repository
- Contact the development team

## 🔄 Version History

### v1.0.0
- Initial release
- Content assignment functionality
- User management features
- Analytics dashboard
- Multi-language support

---

**Built with ❤️ for Kontent.ai**
