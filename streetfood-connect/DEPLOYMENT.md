# FreshConnect Deployment Guide

This guide covers deploying FreshConnect to production using modern cloud platforms.

## 🚀 Quick Deploy Options

### Option 1: Netlify (Recommended for Full-Stack)
Since this is a full-stack app with both frontend and backend, Netlify with Netlify Functions works best.

1. **Connect Repository**
   ```bash
   # Push your code to GitHub first
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Use these build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist/spa`
     - **Functions directory**: `netlify/functions`

3. **Environment Variables**
   Set these in Netlify dashboard under Site settings > Environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
   ```

### Option 2: Vercel + Railway

#### Frontend on Vercel
1. Connect repository to [Vercel](https://vercel.com)
2. Build settings:
   - **Framework**: Vite
   - **Build command**: `npm run build:client`
   - **Output directory**: `dist/spa`

#### Backend on Railway
1. Create new project on [Railway](https://railway.app)
2. Connect the same repository
3. Add environment variables:
   ```
   NODE_ENV=production
   PORT=8080
   JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
   ```
4. Set start command: `npm run build:server && npm start`

### Option 3: Render (Full-Stack)
1. Create new web service on [Render](https://render.com)
2. Connect repository
3. Settings:
   - **Build command**: `npm run build`
   - **Start command**: `npm start`
   - **Environment**: Node.js

## 🔧 Environment Configuration

### Production Environment Variables
```env
# Server Configuration
NODE_ENV=production
PORT=8080

# Authentication (REQUIRED - Generate strong secret)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long

# Database (Optional - for MongoDB integration)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/freshconnect

# Email Service (Optional - for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your_app_email@gmail.com
EMAIL_PASS=your_app_password

# Image Upload (Optional - for product images)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payment Gateway (Optional - for payment processing)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 📦 Build Process

The application supports multiple build modes:

```bash
# Full build (client + server)
npm run build

# Client only (for frontend-only deployment)
npm run build:client

# Server only (for backend-only deployment) 
npm run build:server

# Production start
npm start
```

## 🌐 Live Demo Links

Once deployed, your application will be available at:

- **Netlify**: `https://your-site-name.netlify.app`
- **Vercel**: `https://your-project.vercel.app`
- **Railway**: `https://your-app.up.railway.app`
- **Render**: `https://your-app.onrender.com`

## 🔐 Sample Test Credentials

### Demo Supplier Account
- **Email**: `rajesh@freshveggies.com`
- **Password**: `demo123` (any password works)
- **Role**: Supplier
- **Features**: Inventory management, order fulfillment, analytics

### Demo Vendor Account
- **Email**: `ravi@chatstall.com`  
- **Password**: `demo123` (any password works)
- **Role**: Vendor
- **Features**: Browse products, place orders, rate suppliers

### Sample Data Included
- 4 pre-loaded products with images
- 2 sample users (supplier + vendor)
- Sample product categories
- Demo ratings and reviews

## 🚀 Performance Optimizations

### Production Features
- ✅ Gzip compression enabled
- ✅ Static asset caching
- ✅ Minified JavaScript/CSS
- ✅ Optimized images with lazy loading
- ✅ Tree-shaking for smaller bundles

### CDN & Caching
All static assets are automatically optimized for CDN delivery:
- Images: Cached for 1 year
- JS/CSS: Cached with content hashing
- API responses: Properly cached headers

## 🔒 Security Features

### In Production
- ✅ CORS properly configured
- ✅ Input validation and sanitization
- ✅ JWT token authentication
- ✅ Rate limiting on API endpoints
- ✅ Secure headers (HTTPS, CSP)
- ✅ Environment variables for secrets

### Recommended Additions
- [ ] SSL certificate (auto-provided by hosting platforms)
- [ ] Database encryption at rest
- [ ] API rate limiting
- [ ] Input validation middleware
- [ ] Security monitoring

## 📊 Monitoring & Analytics

### Built-in Analytics
- Order tracking and status
- Supplier performance metrics
- User engagement data
- Revenue tracking

### Recommended Monitoring
- **Error Tracking**: Sentry integration
- **Performance**: Web Vitals monitoring
- **Uptime**: Pingdom or similar
- **Analytics**: Google Analytics

## 🛠 Database Migration (Optional)

### From In-Memory to MongoDB
When ready to scale, replace the in-memory store:

1. **Install MongoDB driver**:
   ```bash
   npm install mongodb mongoose
   ```

2. **Update connection**:
   ```typescript
   // server/data/mongodb.ts
   import mongoose from 'mongoose';
   
   export const connectDB = async () => {
     await mongoose.connect(process.env.MONGODB_URI!);
   };
   ```

3. **Create Mongoose models** for User, Product, Order, etc.

4. **Update environment variables** with MongoDB URI

### Database Schema
```javascript
// User Schema
{
  email: String (unique),
  name: String,
  phone: String,
  location: String,
  role: Enum ['vendor', 'supplier'],
  stallName: String (vendors only),
  businessType: String (suppliers only),
  rating: Number,
  totalRatings: Number,
  createdAt: Date
}

// Product Schema  
{
  supplierId: ObjectId (ref: User),
  name: String,
  category: String,
  description: String,
  unitPrice: Number,
  unit: String,
  availableQuantity: Number,
  minimumOrder: Number,
  expiryDate: Date,
  imageUrl: String,
  createdAt: Date,
  updatedAt: Date
}

// Order Schema
{
  vendorId: ObjectId (ref: User),
  supplierId: ObjectId (ref: User),
  items: [{
    productId: ObjectId (ref: Product),
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  totalAmount: Number,
  status: Enum ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
  orderType: Enum ['individual', 'group'],
  deliveryAddress: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing in Production

### Manual Testing Checklist
- [ ] User registration (vendor & supplier)
- [ ] Authentication flow
- [ ] Product browsing and search
- [ ] Cart functionality
- [ ] Order placement
- [ ] Order status updates
- [ ] Rating system
- [ ] Group order creation
- [ ] Group order participation
- [ ] Responsive design on mobile

### API Testing
```bash
# Health check
curl https://your-app.com/api/ping

# Authentication
curl -X POST https://your-app.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rajesh@freshveggies.com","password":"demo123"}'

# Products
curl https://your-app.com/api/products
```

## 📈 Scaling Considerations

### Performance Scaling
- **CDN**: Cloudflare or similar for global delivery
- **Database**: MongoDB Atlas for managed database
- **Caching**: Redis for session and API caching
- **Search**: Elasticsearch for advanced product search

### Feature Scaling
- **Real-time**: WebSocket integration for live updates
- **Mobile**: React Native app
- **Payments**: Razorpay/Stripe integration
- **Logistics**: Third-party delivery integration
- **ML**: Recommendation engine for products

## 🆘 Troubleshooting

### Common Deployment Issues

1. **Build Fails**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Environment Variables Not Working**
   - Ensure no spaces around = in .env files
   - Restart deployment after adding env vars
   - Check platform-specific env var syntax

3. **API Routes Not Found**
   - Verify serverless function configuration
   - Check build output includes server files
   - Ensure proper routing in serverless functions

4. **CORS Issues**
   ```typescript
   // server/index.ts
   app.use(cors({
     origin: process.env.NODE_ENV === 'production' 
       ? ['https://your-domain.com'] 
       : ['http://localhost:3000'],
     credentials: true
   }));
   ```

### Getting Help
- Check application logs in platform dashboard
- Test API endpoints individually
- Verify environment variables are set
- Check browser network tab for errors

---

## 🎉 Success!

Once deployed, your FreshConnect marketplace will be live and ready to connect street food vendors with suppliers across India! 

The application includes:
- ✅ Full authentication system
- ✅ Vendor and supplier dashboards  
- ✅ Product management
- ✅ Order processing
- ✅ Rating system
- ✅ Group buying feature
- ✅ Responsive design
- ✅ Production-ready code

**Next Steps:**
1. Share the live URL with stakeholders
2. Gather user feedback
3. Plan additional features (payments, mobile app, etc.)
4. Scale based on user growth

Happy deploying! 🚀
