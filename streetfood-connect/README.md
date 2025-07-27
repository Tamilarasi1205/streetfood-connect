# StreetFood Connect - Street Food Vendor Marketplace

A full-stack web application connecting street food vendors with trusted suppliers in India. Built with React, Express.js, TypeScript, and modern web technologies.

## 🚀 Features

### For Vendors (Food Stall Owners)
- **Browse Suppliers**: Find nearby suppliers with fresh ingredients
- **Smart Ordering**: Place individual orders or join group purchases for bulk discounts
- **Real-time Tracking**: Track orders from supplier to your stall
- **Supplier Ratings**: Rate suppliers and view community feedback
- **Cost Savings**: Save up to 30% on ingredient costs through wholesale pricing

### For Suppliers (Wholesalers, Farms, Kirana Shops)
- **Inventory Management**: Add and manage daily inventory with pricing and expiry dates
- **Order Management**: View, confirm, and fulfill vendor orders
- **Analytics Dashboard**: Track sales, revenue, and customer ratings
- **Multi-vendor Orders**: Handle bulk orders from multiple vendors

### Common Features
- **Secure Authentication**: JWT-based user authentication with role-based access
- **Responsive Design**: Mobile-first design that works on all devices
- **Location-based**: Find suppliers and vendors in your area
- **Group Buying**: Multiple vendors can join orders for better pricing
- **Quality Assurance**: Rating system ensures quality and trust

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router 6** for SPA routing
- **TailwindCSS 3** for modern styling
- **Radix UI** for accessible component primitives
- **Vite** for fast development and building
- **Tanstack Query** for data fetching and caching

### Backend
- **Express.js** with TypeScript
- **In-memory data store** (replace with MongoDB in production)
- **JWT-style authentication** (simplified for demo)
- **RESTful API** design
- **CORS** enabled for cross-origin requests

### Development Tools
- **TypeScript** for type safety
- **Vitest** for testing
- **Prettier** for code formatting
- **Path aliases** for clean imports

## 📂 Project Structure

```
├── client/                 # React frontend
│   ├── pages/             # Route components
│   │   ├── Index.tsx      # Homepage
│   │   ├── Login.tsx      # Login page
│   │   ├── Register.tsx   # Registration page
│   │   └── ...           # Dashboard pages
│   ├── components/ui/     # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   └── App.tsx           # Main app with routing
├── server/                # Express backend
│   ├── routes/           # API route handlers
│   │   ├── auth.ts       # Authentication routes
│   │   ├── products.ts   # Product management
│   │   └── orders.ts     # Order management
│   ├── data/             # Data layer
│   │   └── store.ts      # In-memory data store
��   └── index.ts          # Server setup
├── shared/               # Shared types and utilities
│   └── api.ts           # TypeScript interfaces
└── netlify/             # Netlify deployment config
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd freshconnect
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Edit `.env` with your configuration (see Environment Variables section below).

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Build for Production
```bash
npm run build
npm start
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Authentication (in production, use strong secrets)
JWT_SECRET=your_jwt_secret_key_here

# Database Configuration (when implementing MongoDB)
MONGODB_URI=mongodb://localhost:27017/freshconnect

# Email Configuration (for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Image Upload (Cloudinary or similar)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional: Custom ping message for health checks
PING_MESSAGE=FreshConnect API is running
```

## 📊 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "vendor@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+91 98765 43210",
  "location": "Delhi",
  "role": "vendor",
  "stallName": "John's Chat Corner" // for vendors
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "vendor@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?category=vegetables&supplierId=123
```

#### Create Product (Suppliers only)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Fresh Tomatoes",
  "category": "Vegetables",
  "description": "Farm fresh red tomatoes",
  "unitPrice": 25,
  "unit": "kg",
  "availableQuantity": 500,
  "minimumOrder": 10,
  "expiryDate": "2024-12-31T00:00:00.000Z"
}
```

### Order Endpoints

#### Create Order (Vendors only)
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "supplierId": "supplier123",
  "items": [
    {
      "productId": "product123",
      "quantity": 20,
      "unitPrice": 25
    }
  ],
  "deliveryAddress": "123 Market Street, Delhi",
  "orderType": "individual"
}
```

#### Get Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

#### Update Order Status (Suppliers only)
```http
PUT /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

## 🎯 User Roles & Permissions

### Vendor (Food Stall Owner)
- Browse and search suppliers and products
- Place individual and group orders
- Track order status
- Rate suppliers after delivery
- View order history

### Supplier (Wholesaler/Farm/Kirana Shop)
- Add and manage inventory
- View and manage incoming orders
- Update order status
- View analytics and ratings
- Manage product catalog

## 🔐 Authentication Flow

1. User registers with email, password, and role (vendor/supplier)
2. Server creates user account and returns JWT token
3. Client stores token and includes in API requests
4. Server validates token on protected routes
5. Role-based access control restricts certain endpoints

## 📱 Mobile Responsiveness

The application is built mobile-first and responsive across all devices:
- **Mobile**: Optimized touch interfaces and navigation
- **Tablet**: Adaptive layouts with side navigation
- **Desktop**: Full-featured interface with advanced filtering

## 🚀 Deployment

### Netlify (Recommended)
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist/spa`
4. Configure environment variables in Netlify dashboard
5. Deploy!

### Traditional Hosting
```bash
npm run build
npm start
```

The app runs on a single port with both frontend and backend.

## 🔮 Future Enhancements

### Planned Features
- [ ] **MongoDB Integration**: Replace in-memory store with MongoDB
- [ ] **Real-time Notifications**: WebSocket-based order updates
- [ ] **Payment Integration**: Razorpay or UPI payment gateway
- [ ] **GPS Tracking**: Real-time delivery tracking
- [ ] **Advanced Analytics**: Revenue insights and demand forecasting
- [ ] **Mobile App**: React Native mobile application
- [ ] **Multi-language Support**: Hindi and regional language support

### Technical Improvements
- [ ] **Comprehensive Testing**: Unit and integration tests
- [ ] **API Rate Limiting**: Protect against abuse
- [ ] **Image Upload**: Cloudinary integration for product images
- [ ] **Email Notifications**: Order confirmations and updates
- [ ] **Advanced Search**: Elasticsearch for better product discovery
- [ ] **Caching**: Redis for improved performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Email: support@freshconnect.in
- Documentation: [Project Wiki](link-to-wiki)

## 🙏 Acknowledgments

- Design inspiration from modern marketplace applications
- Icons from [Lucide React](https://lucide.dev/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styling with [TailwindCSS](https://tailwindcss.com/)

---

**FreshConnect** - Transforming India's street food ecosystem, one order at a time. 🌶️🥘
