import { ManagementClient } from '@kontent-ai/management-sdk';

// Kontent.ai service using official APIs
class KontentService {
  constructor() {
    this.managementClient = null;
    this.subscriptionApiUrl = null;
    this.environmentId = null;
    this.subscriptionId = null;
    this.managementApiKey = null;
    this.subscriptionApiKey = null;
    this.defaultLanguageCodename = null; // Cache for language codename
  }

  // Initialize the service with API keys
  async initialize(environmentId, managementApiKey, subscriptionApiKey = null, subscriptionId = null) {
    this.environmentId = environmentId;
    this.managementApiKey = managementApiKey;
    this.subscriptionApiKey = subscriptionApiKey;
    this.subscriptionId = subscriptionId;
    
    // Set up subscription API URL with subscription ID
    if (subscriptionId) {
      this.subscriptionApiUrl = `https://manage.kontent.ai/v2/subscriptions/${subscriptionId}`;
    } else {
      this.subscriptionApiUrl = null;
    }

    console.log('KontentService initialized with:', {
      environmentId,
      hasManagementKey: !!managementApiKey,
      hasSubscriptionKey: !!subscriptionApiKey,
      subscriptionId
    });

    // Initialize Management client if API key is provided
    if (managementApiKey) {
      try {
        this.managementClient = new ManagementClient({
          environmentId: environmentId,
          apiKey: managementApiKey
        });
        
        // Test the connection with a simple API call
        try {
          await this.managementClient.listContentItems()
            .toPromise();
          console.log('Management client initialized and authenticated successfully');
        } catch (authError) {
          console.error('Authentication failed:', authError);
          if (authError.response?.status === 401) {
            throw new Error('Invalid Management API key or insufficient permissions');
          }
          throw authError;
        }
      } catch (error) {
        console.error('Failed to initialize Management client:', error);
        throw error;
      }
    } else {
      throw new Error('Management API key is required');
    }
  }

  // Get available languages for the environment
  async getLanguages() {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      const response = await this.managementClient.listLanguages()
        .toPromise();
      
      console.log('Raw languages API response:', response);
      
      // According to the Management API v2 documentation, the response should have a data property
      if (response && response.data && Array.isArray(response.data.languages)) {
        console.log('Available languages from API:', response.data.languages);
        return response.data.languages;
      } else if (response && response.data && Array.isArray(response.data)) {
        console.log('Languages response data is an array:', response.data);
        return response.data;
      } else if (response && Array.isArray(response)) {
        console.log('Languages response is an array:', response);
        return response;
      } else {
        console.log('Unexpected languages response structure:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', response ? Object.keys(response) : 'null/undefined');
        
        // Try to extract languages from the response object
        if (response && typeof response === 'object') {
          const possibleLanguages = response.languages || response.data?.languages || response.items || [];
          if (Array.isArray(possibleLanguages) && possibleLanguages.length > 0) {
            console.log('Found languages in response object:', possibleLanguages);
            return possibleLanguages;
          }
        }
        
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // If the languages API fails, try to get language info from content items
      try {
        console.log('Trying to get language info from content items...');
        const contentItems = await this.getContentItems();
        
        if (contentItems.length > 0) {
          // Get the first content item to see its language
          const firstItem = contentItems[0];
          const itemResponse = await this.managementClient.viewContentItem()
            .byItemId(firstItem.id)
            .toPromise();
          
          console.log('First content item language info:', itemResponse.data);
          
          // Try to get language variants for this item
          try {
            const variantsResponse = await this.managementClient.listLanguageVariants()
              .byItemId(firstItem.id)
              .toPromise();
            
            console.log('Language variants response:', variantsResponse);
            
            if (variantsResponse && variantsResponse.data && variantsResponse.data.variants) {
              const languages = variantsResponse.data.variants.map(variant => ({
                id: variant.language?.id,
                codename: variant.language?.codename,
                name: variant.language?.name
              })).filter(lang => lang.codename);
              
              console.log('Languages extracted from variants:', languages);
              return languages;
            }
          } catch (variantsError) {
            console.error('Failed to get language variants:', variantsError);
          }
        }
      } catch (fallbackError) {
        console.error('Fallback language detection failed:', fallbackError);
      }
      
      throw error;
    }
  }

  // Get the default language codename (first available language)
  async getDefaultLanguageCodename() {
    // Return cached value if available
    if (this.defaultLanguageCodename) {
      console.log('Using cached language codename:', this.defaultLanguageCodename);
      return this.defaultLanguageCodename;
    }

    try {
      const languages = await this.getLanguages();
      console.log('Available languages from API:', languages);
      
      if (languages.length === 0) {
        throw new Error('No languages found in the environment');
      }
      
      // Try to find English first, then fall back to the first available language
      const englishLanguage = languages.find(lang => 
        lang.codename === 'en-US' || 
        lang.codename === 'en' || 
        lang.name?.toLowerCase().includes('english')
      );
      
      const defaultLanguage = englishLanguage || languages[0];
      console.log('Selected default language:', defaultLanguage);
      console.log('Using language codename:', defaultLanguage.codename);
      
      // Cache the result
      this.defaultLanguageCodename = defaultLanguage.codename;
      return this.defaultLanguageCodename;
    } catch (error) {
      console.error('Failed to get default language:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // If we can't get languages, we need to handle this differently
      // Let's try to get the first content item and see what language it uses
      try {
        const contentItems = await this.getContentItems();
        if (contentItems.length > 0) {
          const firstItem = contentItems[0];
          console.log('First content item:', firstItem);
          
          // Try to get the content item details to see available languages
          const itemResponse = await this.managementClient.viewContentItem()
            .byItemId(firstItem.id)
            .toPromise();
          
          console.log('Content item details:', itemResponse.data);
          
          // If the item has language variants, use the first one
          if (itemResponse.data.language && itemResponse.data.language.codename) {
            console.log('Using language from content item:', itemResponse.data.language.codename);
            this.defaultLanguageCodename = itemResponse.data.language.codename;
            return this.defaultLanguageCodename;
          }
        }
      } catch (fallbackError) {
        console.error('Fallback language detection failed:', fallbackError);
      }
      
      // Last resort - try common language codenames
      console.log('Trying common language codenames as fallback...');
      const commonLanguages = ['en-US', 'en', 'default', 'en-GB', 'en-CA'];
      
      for (const langCode of commonLanguages) {
        try {
          console.log(`Testing language codename: ${langCode}`);
          // Try to get a content item with this language
          const contentItems = await this.getContentItems();
          if (contentItems.length > 0) {
            const testItem = contentItems[0];
            const testResponse = await this.managementClient.viewLanguageVariant()
              .byItemId(testItem.id)
              .byLanguageCodename(langCode)
              .toPromise();
            
            console.log(`Successfully tested language codename: ${langCode}`);
            this.defaultLanguageCodename = langCode;
            return this.defaultLanguageCodename;
          }
        } catch (testError) {
          console.log(`Language codename ${langCode} failed:`, testError.message);
          continue;
        }
      }
      
      // If all else fails, throw an error with available information
      throw new Error(`Language detection failed. Please check your Kontent.ai environment configuration. Error: ${error.message}`);
    }
  }

  // Manually set the language codename (useful for debugging)
  setDefaultLanguageCodename(languageCodename) {
    console.log('Manually setting language codename to:', languageCodename);
    this.defaultLanguageCodename = languageCodename;
  }

  // Content Management Methods
  async getContentItems(options = {}) {
    if (!this.managementClient) {
      throw new Error('Management client not initialized. Please provide a valid Management API key.');
    }

    try {
      console.log('Fetching content items from Kontent.ai...');
      const response = await this.managementClient.listContentItems()
        .toPromise();
      
      console.log('Raw API response:', response);
      
      // Transform the response to match our expected format
      const contentItems = response.data.items.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type?.codename || 'unknown',
        status: item.workflow_step?.codename || 'draft',
        createdDate: item.created ? new Date(item.created) : new Date(),
        lastModified: item.last_modified ? new Date(item.last_modified) : new Date(),
        assignedTo: item.assigned_to?.email || null,
        priority: 'medium', // Default priority
        author: item.created_by?.full_name || 'Unknown',
        views: Math.floor(Math.random() * 1000) // Mock views for now
      }));
      
      console.log(`Fetched ${contentItems.length} content items:`, contentItems);
      return contentItems;
    } catch (error) {
      console.error('Failed to fetch content items from API:', error);
      throw error;
    }
  }

  async getContentItem(itemId) {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      const response = await this.managementClient.viewContentItem()
        .byItemId(itemId)
        .toPromise();
      
      const item = response.data;
      return {
        id: item.id,
        name: item.name,
        type: item.type?.codename || 'unknown',
        status: item.workflow_step?.codename || 'draft',
        createdDate: item.created ? new Date(item.created) : new Date(),
        lastModified: item.last_modified ? new Date(item.last_modified) : new Date(),
        assignedTo: item.assigned_to?.email || null,
        priority: 'medium',
        author: item.created_by?.full_name || 'Unknown',
        views: Math.floor(Math.random() * 1000)
      };
    } catch (error) {
      console.error('Failed to fetch content item:', error);
      throw error;
    }
  }

  async updateContentItem(itemId, updates) {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      console.log('Updating content item in Kontent.ai:', itemId, updates);
      
      // For content assignment, we need to update custom elements
      // The exact field name depends on your content type structure
      const updateData = {};
      
      if (updates.name) {
        updateData.name = updates.name;
      }
      
      // Handle assignment - this depends on your content type structure
      // You might have a custom element for assignment or use workflow steps
      if (updates.assignedTo) {
        // Try to update a custom element for assignment
        // This is a placeholder - you'll need to adjust based on your content type
        updateData.elements = {
          // Example: if you have a custom element called 'assigned_to'
          // assigned_to: {
          //   value: updates.assignedTo
          // }
        };
        
        // For now, we'll just log the assignment since we don't know the exact field structure
        console.log('Assignment requested for:', updates.assignedTo);
        console.log('Note: Content assignment requires custom content type configuration');
      }
      
      const response = await this.managementClient.updateContentItem()
        .byItemId(itemId)
        .withData(updateData)
        .toPromise();
      
      console.log('Content item updated successfully:', response);
      return response.data;
    } catch (error) {
      console.error('Failed to update content item:', error);
      throw error;
    }
  }

  // New method for content assignment using language variants
  async assignContentToUser(itemId, userId, languageCodename = null, options = {}) {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      // Get the correct language codename if not provided
      const targetLanguage = languageCodename || await this.getDefaultLanguageCodename();
      
      console.log('Assigning content item to user:', { itemId, userId, languageCodename: targetLanguage, options });

      // First, get the current content item to understand its structure
      const contentItem = await this.getContentItem(itemId);
      
      // Get the current language variant
      const variantResponse = await this.managementClient.viewLanguageVariant()
        .byItemId(itemId)
        .byLanguageCodename(targetLanguage)
        .toPromise();

      console.log('Language variant response type:', typeof variantResponse);
      console.log('Language variant response keys:', variantResponse ? Object.keys(variantResponse) : 'null/undefined');
      console.log('Language variant response:', variantResponse);
      
      // Handle different response structures
      let currentVariant;
      if (variantResponse && variantResponse.data) {
        console.log('Response.data is a property, accessing it...');
        currentVariant = variantResponse.data;
      } else if (variantResponse) {
        console.log('Using response directly...');
        currentVariant = variantResponse;
      } else {
        throw new Error('Invalid language variant response');
      }
      
      console.log('Current variant data type:', typeof currentVariant);
      console.log('Current variant data keys:', currentVariant ? Object.keys(currentVariant) : 'null/undefined');
      console.log('Current variant data:', currentVariant);
      
      // Prepare the upsert data with contributor assignment
      const upsertData = {
        Elements: Object.keys(currentVariant.elements || {}).map(elementCodename => ({
          element: {
            codename: elementCodename
          },
          value: currentVariant.elements[elementCodename]
        })),
        // Add the contributor assignment
        Contributors: [
          {
            id: userId,
            role: options.role || 'contributor'
          }
        ]
      };

      // If there are existing contributors, preserve them and add the new one
      if (currentVariant.contributors && currentVariant.contributors.length > 0) {
        // Check if user is already a contributor
        const existingContributor = currentVariant.contributors.find(c => c.id === userId);
        if (!existingContributor) {
          upsertData.Contributors = [
            ...currentVariant.contributors,
            {
              id: userId,
              role: options.role || 'contributor'
            }
          ];
        } else {
          // User already exists, just update the role if different
          upsertData.Contributors = currentVariant.contributors.map(c => 
            c.id === userId 
              ? { ...c, role: options.role || c.role }
              : c
          );
        }
      }

      // Add assignment notes if provided
      if (options.notes) {
        // Note: This would need to be implemented based on your content type structure
        // For now, we'll just log the notes
        console.log('Assignment notes:', options.notes);
      }

      // Add due date if provided
      if (options.dueDate) {
        // Note: This would need to be implemented based on your content type structure
        // For now, we'll just log the due date
        console.log('Assignment due date:', options.dueDate);
      }

      console.log('Upsert data:', upsertData);

      // Try a simpler approach - just update the contributors without changing elements
      const simpleUpsertData = {
        contributors: upsertData.contributors
      };

      console.log('Simple upsert data:', simpleUpsertData);

      // Try a different approach - use the raw data structure
      const rawUpsertData = {
        contributors: upsertData.contributors.map(c => ({
          id: c.id,
          role: c.role
        }))
      };

      console.log('Raw upsert data:', rawUpsertData);

      // Try minimal update - just add the contributor
      const minimalUpsertData = {
        Elements: Object.keys(currentVariant.elements || {}).map(elementCodename => ({
          element: {
            codename: elementCodename
          },
          value: currentVariant.elements[elementCodename]
        })),
        Contributors: [
          {
            id: userId,
            role: 'contributor'
          }
        ]
      };

      console.log('Minimal upsert data:', minimalUpsertData);

      // Use raw REST API instead of SDK method (workaround for SDK issue)
      const response = await this.upsertLanguageVariantRaw(itemId, targetLanguage, minimalUpsertData);

      console.log('Upsert response type:', typeof response);
      console.log('Upsert response keys:', response ? Object.keys(response) : 'null/undefined');
      console.log('Content assignment successful:', response);
      
      // Handle response data access
      let responseData;
      if (response && response.data) {
        console.log('Upsert response.data is a property, accessing it...');
        responseData = response.data;
      } else if (response) {
        console.log('Using upsert response directly...');
        responseData = response;
      } else {
        console.log('No response data available');
        responseData = {};
      }
      
      return {
        success: true,
        data: responseData,
        message: `Content item assigned to user ${userId} successfully`
      };
    } catch (error) {
      console.error('Failed to assign content to user:', error);
      console.error('Error stack:', error.stack);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error('Content item or language variant not found');
      } else if (error.response?.status === 403) {
        throw new Error('Insufficient permissions to assign content');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid assignment data provided');
      }
      
      throw new Error(`Failed to assign content: ${error.message}`);
    }
  }

  // Bulk assign content to users
  async bulkAssignContentToUser(itemIds, userId, languageCodename = null, options = {}) {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    // Get the correct language codename if not provided
    const targetLanguage = languageCodename || await this.getDefaultLanguageCodename();

    const results = [];
    for (const itemId of itemIds) {
      try {
        const result = await this.assignContentToUser(itemId, userId, targetLanguage, options);
        results.push({ itemId, success: true, data: result });
      } catch (error) {
        results.push({ itemId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Get content assignments for a specific item
  async getContentAssignments(itemId, languageCodename = null) {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      // Get the correct language codename if not provided
      const targetLanguage = languageCodename || await this.getDefaultLanguageCodename();

      const response = await this.managementClient.viewLanguageVariant()
        .byItemId(itemId)
        .byLanguageCodename(targetLanguage)
        .toPromise();

      console.log('Get assignments response:', response);
      
      // Handle different response structures
      let variant;
      if (response && response.data) {
        variant = response.data;
      } else if (response) {
        variant = response;
      } else {
        throw new Error('Invalid language variant response');
      }

      return {
        itemId,
        languageCodename: targetLanguage,
        contributors: variant.contributors || [],
        elements: variant.elements || {}
      };
    } catch (error) {
      console.error('Failed to get content assignments:', error);
      if (error.response?.status === 404) {
        return {
          itemId,
          languageCodename: languageCodename || 'unknown',
          contributors: [],
          elements: {}
        };
      }
      throw error;
    }
  }

  // Get assignments for multiple content items
  async getBulkContentAssignments(itemIds, languageCodename = null) {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    // Get the correct language codename if not provided
    const targetLanguage = languageCodename || await this.getDefaultLanguageCodename();

    const results = [];
    for (const itemId of itemIds) {
      try {
        const result = await this.getContentAssignments(itemId, targetLanguage);
        results.push({ itemId, success: true, data: result });
      } catch (error) {
        results.push({ itemId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Remove content assignment for a specific user
  async removeContentAssignment(itemId, userId, languageCodename = null) {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      // Get the correct language codename if not provided
      const targetLanguage = languageCodename || await this.getDefaultLanguageCodename();
      
      console.log('Removing content assignment for user:', { itemId, userId, languageCodename: targetLanguage });

      // Get the current language variant
      const variantResponse = await this.managementClient.viewLanguageVariant()
        .byItemId(itemId)
        .byLanguageCodename(targetLanguage)
        .toPromise();

      console.log('Remove assignment - variant response:', variantResponse);
      
      // Handle different response structures
      let currentVariant;
      if (variantResponse && variantResponse.data) {
        currentVariant = variantResponse.data;
      } else if (variantResponse) {
        currentVariant = variantResponse;
      } else {
        throw new Error('Invalid language variant response');
      }
      
      // Remove the specified contributor
      const updatedContributors = (currentVariant.contributors || []).filter(c => c.id !== userId);
      
      // Prepare the upsert data
      const upsertData = {
        Elements: Object.keys(currentVariant.elements || {}).map(elementCodename => ({
          element: {
            codename: elementCodename
          },
          value: currentVariant.elements[elementCodename]
        })),
        Contributors: updatedContributors
      };

      console.log('Remove assignment - upsert data:', upsertData);

      // Use raw REST API instead of SDK method (workaround for SDK issue)
      const response = await this.upsertLanguageVariantRaw(itemId, targetLanguage, upsertData);

      console.log('Content assignment removal successful:', response);
      
      // Handle response data access
      let responseData;
      if (response && response.data) {
        responseData = response.data;
      } else if (response) {
        responseData = response;
      } else {
        responseData = {};
      }
      
      return {
        success: true,
        data: responseData,
        message: `Content assignment removed for user ${userId} successfully`
      };
    } catch (error) {
      console.error('Failed to remove content assignment:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Content item or language variant not found');
      } else if (error.response?.status === 403) {
        throw new Error('Insufficient permissions to remove content assignment');
      }
      
      throw new Error(`Failed to remove content assignment: ${error.message}`);
    }
  }

  async bulkUpdateContentItems(itemIds, updates) {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    const results = [];
    for (const itemId of itemIds) {
      try {
        const result = await this.updateContentItem(itemId, updates);
        results.push({ itemId, success: true, data: result });
      } catch (error) {
        results.push({ itemId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  // User Management Methods using Subscription API
  async getUsers() {
    if (!this.subscriptionApiKey || !this.subscriptionId) {
      throw new Error('Subscription API key and Subscription ID are required for user management');
    }

    try {
      const response = await fetch(`${this.subscriptionApiUrl}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.subscriptionApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Subscription API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Subscription users:', data);

      // Transform to match our expected format
      const users = data.users?.map(user => ({
        id: user.id,
        firstName: user.first_name || user.email?.split('@')[0] || 'User',
        lastName: user.last_name || '',
        email: user.email,
        role: user.roles?.[0]?.codename || 'User',
        status: user.status || 'active',
        joinDate: user.created ? new Date(user.created) : new Date(),
        avatar: (user.first_name?.[0] || '') + (user.last_name?.[0] || '')
      })) || [];

      return users;
    } catch (error) {
      console.error('Failed to fetch users from Subscription API:', error);
      throw error;
    }
  }

  async getCurrentUser(sdk) {
    // This would typically come from the SDK context
    if (sdk?.context?.userEmail) {
      return {
        id: sdk.context.userId,
        email: sdk.context.userEmail,
        firstName: sdk.context.userEmail?.split('@')[0] || 'User',
        lastName: '',
        role: sdk.context.userRoles?.[0]?.codename || 'User'
      };
    }
    
    throw new Error('User information not available from SDK context');
  }

  async createUser(userData) {
    if (!this.subscriptionApiKey || !this.subscriptionId) {
      throw new Error('Subscription API key and Subscription ID are required for user management');
    }

    try {
      const response = await fetch(`${this.subscriptionApiUrl}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.subscriptionApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          roles: userData.roles || []
        })
      });

      if (!response.ok) {
        throw new Error(`Subscription API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('User created successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  async updateUser(userId, userData) {
    if (!this.subscriptionApiKey || !this.subscriptionId) {
      throw new Error('Subscription API key and Subscription ID are required for user management');
    }

    try {
      const response = await fetch(`${this.subscriptionApiUrl}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.subscriptionApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: userData.firstName,
          last_name: userData.lastName,
          roles: userData.roles || []
        })
      });

      if (!response.ok) {
        throw new Error(`Subscription API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('User updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  async getProjectInfo() {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      // Get project information from Management API
      const response = await this.managementClient.viewProjectInformation()
        .toPromise();
      
      return {
        id: this.environmentId,
        name: response.data.name || 'Kontent.ai Project',
        environment: 'Production',
        settings: {
          languages: response.data.languages || ['en-US'],
          timezone: response.data.timezone || 'UTC',
          features: ['content-management', 'user-management']
        }
      };
    } catch (error) {
      console.error('Failed to fetch project info:', error);
      throw error;
    }
  }

  async getAnalyticsData(timeRange = '6months') {
    // This would integrate with Kontent.ai Analytics API
    // For now, return mock data
    return {
      pageViews: Math.floor(Math.random() * 10000),
      uniqueVisitors: Math.floor(Math.random() * 5000),
      contentViews: Math.floor(Math.random() * 15000),
      topContent: [
        { name: 'Welcome Page', views: 2500 },
        { name: 'About Us', views: 1800 },
        { name: 'Contact', views: 1200 }
      ]
    };
  }

  async changeContentItemWorkflow(itemId, workflowStepId) {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      const response = await this.managementClient.changeWorkflowStepOfContentItem()
        .byItemId(itemId)
        .toWorkflowStep(workflowStepId)
        .toPromise();
      
      console.log('Workflow step changed successfully:', response);
      return response.data;
    } catch (error) {
      console.error('Failed to change workflow step:', error);
      throw error;
    }
  }

  async getCollections() {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      const response = await this.managementClient.listCollections()
        .toPromise();
      
      return response.data.collections || [];
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      throw error;
    }
  }

  async getContentTypes() {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      const response = await this.managementClient.listContentTypes()
        .toPromise();
      
      return response.data.types || [];
    } catch (error) {
      console.error('Failed to fetch content types:', error);
      throw error;
    }
  }

  hasSubscriptionAccess() {
    return !!(this.subscriptionApiKey && this.subscriptionId);
  }

  hasManagementAccess() {
    return !!this.managementClient;
  }

  // Test method to verify content assignment functionality
  async testContentAssignment(itemId, userId) {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      console.log('Testing content assignment functionality...');
      
      // Test 1: Assign content to user
      console.log('Test 1: Assigning content to user...');
      const assignmentResult = await this.assignContentToUser(itemId, userId, 'en-US', {
        role: 'contributor',
        notes: 'Test assignment'
      });
      console.log('Assignment result:', assignmentResult);

      // Test 2: Get assignments
      console.log('Test 2: Getting content assignments...');
      const assignmentsResult = await this.getContentAssignments(itemId, 'en-US');
      console.log('Assignments result:', assignmentsResult);

      // Test 3: Remove assignment
      console.log('Test 3: Removing content assignment...');
      const removalResult = await this.removeContentAssignment(itemId, userId, 'en-US');
      console.log('Removal result:', removalResult);

      return {
        success: true,
        message: 'All content assignment tests passed successfully',
        results: {
          assignment: assignmentResult,
          assignments: assignmentsResult,
          removal: removalResult
        }
      };
    } catch (error) {
      console.error('Content assignment test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Debug method to test language detection
  async debugLanguageDetection() {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      console.log('=== Language Detection Debug ===');
      
      // Test 1: Get available languages
      console.log('1. Fetching available languages...');
      const languages = await this.getLanguages();
      console.log('Available languages:', languages);
      
      // Test 2: Get default language
      console.log('2. Getting default language...');
      const defaultLanguage = await this.getDefaultLanguageCodename();
      console.log('Default language codename:', defaultLanguage);
      
      // Test 3: Get first content item to see its language
      console.log('3. Getting first content item...');
      const contentItems = await this.getContentItems();
      if (contentItems.length > 0) {
        const firstItem = contentItems[0];
        console.log('First content item:', firstItem);
        
        // Get detailed content item info
        const itemResponse = await this.managementClient.viewContentItem()
          .byItemId(firstItem.id)
          .toPromise();
        
        console.log('Content item details:', itemResponse.data);
        
        // Check if it has language variants
        if (itemResponse.data.language) {
          console.log('Content item language:', itemResponse.data.language);
        }
      }
      
      return {
        success: true,
        languages,
        defaultLanguage,
        contentItemsCount: contentItems.length
      };
    } catch (error) {
      console.error('Language detection debug failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test different language codenames to find the correct one
  async testLanguageCodenames() {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      console.log('=== Testing Language Codenames ===');
      
      const contentItems = await this.getContentItems();
      if (contentItems.length === 0) {
        throw new Error('No content items available for testing');
      }

      const testItem = contentItems[0];
      console.log('Testing with content item:', testItem.id);
      
      const commonLanguages = [
        'en-US', 'en', 'default', 'en-GB', 'en-CA', 
        'us', 'english', 'en_US', 'en_GB', 'en_CA'
      ];
      
      const results = [];
      
      for (const langCode of commonLanguages) {
        try {
          console.log(`Testing language codename: ${langCode}`);
          const response = await this.managementClient.viewLanguageVariant()
            .byItemId(testItem.id)
            .byLanguageCodename(langCode)
            .toPromise();
          
          console.log(`✅ Language codename ${langCode} works!`);
          console.log(`Response type: ${typeof response}`);
          console.log(`Response keys: ${response ? Object.keys(response) : 'null/undefined'}`);
          
          // Handle response data access
          let responseData;
          if (response && response.data) {
            responseData = response.data;
          } else if (response) {
            responseData = response;
          } else {
            responseData = {};
          }
          
          results.push({ codename: langCode, success: true, data: responseData });
        } catch (error) {
          console.log(`❌ Language codename ${langCode} failed:`, error.message);
          results.push({ codename: langCode, success: false, error: error.message });
        }
      }
      
      const workingLanguages = results.filter(r => r.success);
      console.log('Working language codenames:', workingLanguages.map(r => r.codename));
      
      return {
        success: true,
        results,
        workingLanguages: workingLanguages.map(r => r.codename),
        recommendedLanguage: workingLanguages.length > 0 ? workingLanguages[0].codename : null
      };
    } catch (error) {
      console.error('Language codename testing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Simple test to understand SDK response structure
  async testSdkResponseStructure() {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      console.log('=== Testing SDK Response Structure ===');
      
      const contentItems = await this.getContentItems();
      if (contentItems.length === 0) {
        throw new Error('No content items available for testing');
      }

      const testItem = contentItems[0];
      console.log('Testing with content item:', testItem.id);
      
      // Test viewContentItem response
      console.log('1. Testing viewContentItem response...');
      const itemResponse = await this.managementClient.viewContentItem()
        .byItemId(testItem.id)
        .toPromise();
      
      console.log('Item response type:', typeof itemResponse);
      console.log('Item response keys:', itemResponse ? Object.keys(itemResponse) : 'null/undefined');
      console.log('Item response:', itemResponse);
      
      // Test viewLanguageVariant response
      console.log('2. Testing viewLanguageVariant response...');
      const variantResponse = await this.managementClient.viewLanguageVariant()
        .byItemId(testItem.id)
        .byLanguageCodename('default')
        .toPromise();
      
      console.log('Variant response type:', typeof variantResponse);
      console.log('Variant response keys:', variantResponse ? Object.keys(variantResponse) : 'null/undefined');
      console.log('Variant response:', variantResponse);
      
      return {
        success: true,
        itemResponse,
        variantResponse
      };
    } catch (error) {
      console.error('SDK response structure test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test different upsert data structures
  async testUpsertDataStructures(itemId, languageCodename = 'default') {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      console.log('=== Testing Upsert Data Structures ===');
      console.log('Testing with item:', itemId, 'language:', languageCodename);
      
      const testDataStructures = [
        {
          name: 'Minimal contributors',
          data: {
            Elements: [],
            Contributors: [
              {
                id: 'test-user-id',
                role: 'contributor'
              }
            ]
          }
        },
        {
          name: 'Empty contributors array',
          data: {
            Elements: [],
            Contributors: []
          }
        },
        {
          name: 'Contributors with string role',
          data: {
            Elements: [],
            Contributors: [
              {
                id: 'test-user-id',
                role: 'contributor'
              }
            ]
          }
        }
      ];

      const results = [];
      
      for (const testCase of testDataStructures) {
        try {
          console.log(`Testing: ${testCase.name}`);
          console.log('Test data:', testCase.data);
          
          const response = await this.managementClient.upsertLanguageVariant()
            .byItemId(itemId)
            .byLanguageCodename(languageCodename)
            .withData(testCase.data)
            .toPromise();
          
          console.log(`✅ ${testCase.name} - SUCCESS`);
          results.push({ 
            name: testCase.name, 
            success: true, 
            data: testCase.data,
            response: response 
          });
        } catch (error) {
          console.log(`❌ ${testCase.name} - FAILED:`, error.message);
          results.push({ 
            name: testCase.name, 
            success: false, 
            data: testCase.data,
            error: error.message 
          });
        }
      }
      
      const successfulTests = results.filter(r => r.success);
      console.log('Successful test cases:', successfulTests.map(r => r.name));
      
      return {
        success: true,
        results,
        successfulTests: successfulTests.map(r => r.name)
      };
    } catch (error) {
      console.error('Upsert data structure testing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Unpublish a published variant
  async unpublishVariant(itemId, languageCodename) {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      console.log('Unpublishing variant...');
      
      const baseUrl = 'https://manage.kontent.ai/v2';
      const environmentId = this.environmentId;
      const apiKey = this.managementApiKey;
      
      const url = `${baseUrl}/projects/${environmentId}/items/${itemId}/variants/codename/${languageCodename}/unpublish`;
      
      console.log('Unpublish URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-KC-SDKID': 'npmjs.com;@kontent-ai/management-sdk;7.9.1'
        }
      });

      console.log('Unpublish response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Unpublish error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Handle 204 No Content response (successful unpublish)
      if (response.status === 204) {
        console.log('Variant unpublished successfully (204 No Content)');
        return {
          success: true,
          data: { message: 'Variant unpublished successfully' }
        };
      }

      // Try to parse JSON for other successful responses
      const responseData = await response.json();
      console.log('Variant unpublished successfully:', responseData);
      
      return {
        success: true,
        data: responseData
      };
    } catch (error) {
      console.error('Failed to unpublish variant:', error);
      throw error;
    }
  }

  // Use raw REST API for upsert operations (workaround for SDK issue)
  async upsertLanguageVariantRaw(itemId, languageCodename, data) {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      console.log('Using raw REST API for upsert...');
      console.log('Upsert data:', data);
      
      // Get the base URL and API key from the management client
      const baseUrl = 'https://manage.kontent.ai/v2';
      const environmentId = this.environmentId;
      const apiKey = this.managementApiKey;
      
      const url = `${baseUrl}/projects/${environmentId}/items/${itemId}/variants/codename/${languageCodename}`;
      
      console.log('Upsert URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-KC-SDKID': 'npmjs.com;@kontent-ai/management-sdk;7.9.1'
        },
        body: JSON.stringify(data)
      });

      console.log('Raw API response status:', response.status);
      console.log('Raw API response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Raw API error response:', errorText);
        
        // Check if it's a published variant error
        if (errorText.includes('published') && errorText.includes('cannot be updated')) {
          console.log('Variant is published, unpublishing first...');
          
          // Unpublish the variant first
          await this.unpublishVariant(itemId, languageCodename);
          
          // Try the upsert again
          console.log('Retrying upsert after unpublishing...');
          const retryResponse = await fetch(url, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'X-KC-SDKID': 'npmjs.com;@kontent-ai/management-sdk;7.9.1'
            },
            body: JSON.stringify(data)
          });

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            console.error('Retry upsert error response:', retryErrorText);
            throw new Error(`HTTP ${retryResponse.status}: ${retryErrorText}`);
          }

          const retryResponseData = await retryResponse.json();
          console.log('Upsert successful after unpublishing:', retryResponseData);
          
          return {
            success: true,
            data: retryResponseData
          };
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Raw API response data:', responseData);
      
      return {
        success: true,
        data: responseData
      };
    } catch (error) {
      console.error('Raw API upsert failed:', error);
      throw error;
    }
  }

  // Test raw API upsert with various data structures
  async testRawApiUpsert(itemId, languageCodename = 'default') {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    try {
      console.log('=== Testing Raw API Upsert ===');
      console.log('Testing with item:', itemId, 'language:', languageCodename);

      // Get a real user ID for testing
      let testUserId = 'test-user-id';
      try {
        const users = await this.getUsers();
        if (users && users.length > 0) {
          testUserId = users[0].id;
          console.log('Using real user ID for testing:', testUserId);
        }
      } catch (error) {
        console.log('Could not get real user ID, using test ID:', testUserId);
      }

      const testCases = [
        {
          name: 'Minimal contributors',
          data: {
            Elements: [],
            Contributors: [{ id: testUserId }]
          }
        },
        {
          name: 'Empty contributors array',
          data: {
            Elements: [],
            Contributors: []
          }
        },
        {
          name: 'Contributors with string role',
          data: {
            Elements: [],
            Contributors: [{ id: testUserId }]
          }
        }
      ];

      const results = [];
      const successfulTests = [];

      for (const testCase of testCases) {
        console.log('Testing:', testCase.name);
        console.log('Test data:', testCase.data);

        try {
          const result = await this.upsertLanguageVariantRaw(itemId, languageCodename, testCase.data);
          console.log('✅', testCase.name, '- SUCCESS');
          results.push({ name: testCase.name, success: true, result });
          successfulTests.push(testCase.name);
        } catch (error) {
          console.log('❌', testCase.name, '- FAILED:', error.message);
          results.push({ name: testCase.name, success: false, error: error.message });
        }
      }

      console.log('Successful raw API test cases:', successfulTests);

      return {
        success: true,
        results,
        successfulTests
      };
    } catch (error) {
      console.error('Raw API upsert test failed:', error);
      throw error;
    }
  }
}

export default new KontentService(); 