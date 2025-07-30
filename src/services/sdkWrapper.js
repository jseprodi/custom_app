// Standalone SDK implementation for Kontent.ai Custom App
// This simulates the SDK behavior without relying on the problematic package

// Error codes from the SDK
export const ErrorCode = {
  UnknownMessage: "unknown-message"
};

// Message types for iframe communication
const MessageTypes = {
  GET_CONTEXT_REQUEST: "get-context-request",
  GET_CONTEXT_RESPONSE: "get-context-response",
  ERROR_RESPONSE: "error-response"
};

// Helper function to send messages to parent window (Kontent.ai)
const sendMessage = (message, callback) => {
  try {
    // Check if we're in an iframe (Kontent.ai environment)
    if (window.parent && window.parent !== window) {
      // Send message to parent window
      window.parent.postMessage(message, '*');
      
      // Set up listener for response
      const handleResponse = (event) => {
        if (event.source === window.parent) {
          window.removeEventListener('message', handleResponse);
          callback(event.data);
        }
      };
      
      window.addEventListener('message', handleResponse);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        callback({
          type: MessageTypes.ERROR_RESPONSE,
          code: ErrorCode.UnknownMessage,
          description: "No response from parent window"
        });
      }, 5000);
    } else {
      // Not in iframe, return error
      setTimeout(() => {
        callback({
          type: MessageTypes.ERROR_RESPONSE,
          code: ErrorCode.UnknownMessage,
          description: "Not running in Kontent.ai environment. This app must be embedded as a custom app."
        });
      }, 100);
    }
  } catch (error) {
    callback({
      type: MessageTypes.ERROR_RESPONSE,
      code: ErrorCode.UnknownMessage,
      description: error.message
    });
  }
};

// Schema validation helper
const matchesSchema = (schema, data) => {
  // Simple validation - check if data has error properties
  return data && (data.code || data.description);
};

// Main SDK function
export const getCustomAppContext = () => {
  return new Promise((resolve, reject) => {
    try {
      sendMessage({
        type: MessageTypes.GET_CONTEXT_REQUEST,
        version: "1.0.0",
        payload: null,
      }, (response) => {
        if (matchesSchema(null, response) && response.type === MessageTypes.ERROR_RESPONSE) {
          resolve({ 
            isError: true, 
            code: response.code, 
            description: response.description 
          });
        } else {
          resolve({ 
            ...response.payload, 
            isError: false 
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}; 