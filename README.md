# Kontent.ai Dashboard App

A comprehensive custom app for Kontent.ai that provides a management dashboard for content assignment, user management, and analytics.

## 🚀 Deployment

This app is deployed on Vercel. If you're experiencing blank pages, try these troubleshooting steps:

### 1. Check Vercel Project Settings
- Go to your Vercel dashboard
- Navigate to Project Settings → General
- Ensure the following settings:
  - **Framework Preset**: Other
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
  - **Install Command**: `npm install`

### 2. Test Static Files
Try accessing these test pages:
- `https://your-url.vercel.app/minimal.html` - Minimal test
- `https://your-url.vercel.app/test.html` - Simple test
- `https://your-url.vercel.app/static-test.html` - Comprehensive test

### 3. Check Build Logs
- Go to Vercel dashboard → Deployments
- Click on the latest deployment
- Check the build logs for any errors

### 4. Environment Variables
If using API keys, ensure they're set in Vercel:
- Go to Project Settings → Environment Variables
- Add any required environment variables

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
├── public/          # Static files
├── src/             # Source code
│   ├── components/  # React components
│   ├── services/    # API services
│   └── styles/      # CSS styles
├── dist/            # Build output
└── vercel.json      # Vercel configuration
```

## 🔧 Troubleshooting

If pages are blank:

1. **Check browser console** for JavaScript errors
2. **Test static files** using the test pages above
3. **Verify Vercel settings** match the configuration
4. **Check build logs** for any deployment errors
5. **Try accessing files directly** to see if they exist

## 📝 Notes

- The app uses webpack for bundling
- Static files are copied to the dist directory during build
- The app supports both standalone and Kontent.ai embedded modes 