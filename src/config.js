// Configuration for the Kontent.ai dashboard app
// In a real custom app, these values would come from the Kontent.ai SDK

export const config = {
  // API Keys - replace with your actual keys for real API access
  KONTENT_API_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNWVjYjcxMDY5ODA0ZjhiOWZjNjA5Y2Y2Mjg0ZWZmNCIsImlhdCI6MTc0NDk5ODQzNywibmJmIjoxNzQ0OTk4NDM3LCJleHAiOjE3NjA4MDk1NjAsInZlciI6IjMuMC4wIiwidWlkIjoidmlydHVhbF81ZGU5YjcxNy0zODFjLTQ5NzctYWE1My1mNGIyNzZkYzJhZGIiLCJzY29wZV9pZCI6IjBmOTQ1NjM2NzAwNTQ2M2Y4YzMzYjhkMzI4NzRhMWE0IiwicHJvamVjdF9jb250YWluZXJfaWQiOiIyNWEyNzAwNmRhOWUwMGJkY2VjZDEyMmFkMDkwNmI5YiIsImF1ZCI6Im1hbmFnZS5rZW50aWNvY2xvdWQuY29tIn0.yUZt9VtwP_ZTz2PfYro4vJN32f3hTyXNhzhG707wwlg',
  KONTENT_SUBSCRIPTION_API_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMTVmMGViMDQ4YTk0MWMxYjQ5OTc1ZWM5YmQ5ODNiYiIsImlhdCI6MTc0OTU4MTk3OCwibmJmIjoxNzQ5NTgxOTc4LCJleHAiOjE3NjUzOTY3NDAsInZlciI6IjMuMC4wIiwidWlkIjoidXJoNHQwd3BEWFllOUpkUnd0YTMxVXFPMDJCZWlfV2hPR1habEd5VVJ4MCIsInN1YnNjcmlwdGlvbl9pZCI6IjU0M2I2ZDhhNzBjZjRhOWQ5OWU1OTIzNjc5M2Q0Y2NjIiwiYXVkIjoibWFuYWdlLmtlbnRpY29jbG91ZC5jb20ifQ.xR7K2Y6A_qgpUnlP0iNXID7H6XQj25sIOc2pVx4zIzE',
  KONTENT_SUBSCRIPTION_ID: '543b6d8a-70cf-4a9d-99e5-9236793d4ccc',

  // Project settings
  KONTENT_PROJECT_ID: 'c1ad4901-f748-000b-2b83-2c4fa51e2983',
  KONTENT_ENVIRONMENT_ID: 'c1ad4901-f748-000b-2b83-2c4fa51e2983',
  
  // Demo mode settings
  DEMO_MODE: false,
  
  // Mock data settings
  MOCK_DATA: {
    contentItems: [
      {
        id: 'item-1',
        name: 'Welcome to Kontent.ai',
        type: 'article',
        status: 'draft',
        createdDate: new Date('2024-01-15'),
        lastModified: new Date('2024-01-20'),
        assignedTo: 'john.doe@example.com',
        priority: 'high',
        author: 'Content Team',
        views: 1250
      },
      {
        id: 'item-2',
        name: 'Getting Started Guide',
        type: 'article',
        status: 'published',
        createdDate: new Date('2024-01-10'),
        lastModified: new Date('2024-01-18'),
        assignedTo: 'jane.smith@example.com',
        priority: 'medium',
        author: 'Documentation Team',
        views: 3420
      },
      {
        id: 'item-3',
        name: 'Product Overview',
        type: 'product',
        status: 'draft',
        createdDate: new Date('2024-01-12'),
        lastModified: new Date('2024-01-19'),
        assignedTo: null,
        priority: 'low',
        author: 'Marketing Team',
        views: 890
      }
    ],
    users: [
      {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'Content Creator',
        status: 'active',
        joinDate: new Date('2023-06-15'),
        avatar: 'JD'
      },
      {
        id: 'user-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        role: 'Content Manager',
        status: 'active',
        joinDate: new Date('2023-05-20'),
        avatar: 'JS'
      },
      {
        id: 'user-3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        role: 'Content Creator',
        status: 'active',
        joinDate: new Date('2023-07-10'),
        avatar: 'MJ'
      }
    ]
  }
};

export default config; 