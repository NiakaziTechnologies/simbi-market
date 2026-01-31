# Simbi Market - System Overview

## 🎯 Project Overview

**Simbi Market** is a premium automotive parts marketplace built with Next.js 16, React 19, and TypeScript. It's a full-stack e-commerce platform that connects buyers, sellers, and administrators in the automotive parts industry.

### Key Characteristics
- **Marketplace Model**: Multi-seller platform where sellers can list inventory
- **Multi-Role System**: Supports Buyers, Sellers, Staff, and Admins
- **Modern Stack**: Next.js 16 (App Router), React 19, Redux Toolkit, TypeScript
- **UI Framework**: Tailwind CSS with Radix UI components
- **Backend**: RESTful API (separate backend service)

---

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js 16.0.10 (App Router)
- **React**: 19.2.0
- **State Management**: Redux Toolkit with React Redux
- **Styling**: Tailwind CSS 4.1.9 with custom animations
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend Integration
- **API Base URL**: Configurable via `lib/config.ts`
  - Development: `http://localhost:3006`
  - Production: `https://simbi-three.vercel.app`
- **API Client**: Centralized client in `lib/api/api-client.ts`
- **Authentication**: JWT token-based (Bearer tokens)

---

## 👥 User Roles & Permissions

### 1. **Buyer**
- Browse and search parts catalog
- Add items to cart
- Place orders
- Manage profile and addresses
- View order history
- Submit returns
- Write reviews

### 2. **Seller**
- Manage inventory/products
- View and process orders
- Manage staff accounts
- View financial reports
- Handle returns
- Create coupons
- Manage payouts
- View notifications

### 3. **Staff** (Seller Sub-role)
- Access seller dashboard with role-based permissions:
  - `STOCK_MANAGER`: Inventory management
  - `DISPATCHER`: Order processing
  - `FINANCE_VIEW`: Financial read-only access
  - `FULL_ACCESS`: Complete seller access

### 4. **Admin**
- Manage all users (buyers, sellers, staff)
- Manage all products across marketplace
- Process returns
- Manage payouts
- View analytics and reports
- Review management
- Dispatch management
- System-wide notifications

---

## 📁 Project Structure

```
simbi-market/
├── app/                          # Next.js App Router pages
│   ├── about/                   # About page
│   ├── auth/                    # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── blog/                    # Blog page
│   ├── catalog/                 # Product catalog
│   ├── checkout/                # Checkout flow
│   ├── contact/                 # Contact page
│   ├── dashboard/               # Role-based dashboards
│   │   ├── buyer/               # Buyer dashboard
│   │   ├── seller/              # Seller dashboard
│   │   └── admin/               # Admin dashboard
│   ├── parts/[id]/              # Product detail pages
│   └── reset-password/          # Password reset
│
├── components/                  # React components
│   ├── auth/                    # Auth-related components
│   ├── dashboard/               # Dashboard components
│   │   ├── admin/               # Admin-specific
│   │   ├── admin-sidebar.tsx
│   │   ├── seller-sidebar.tsx
│   │   └── dashboard-sidebar.tsx
│   └── ui/                      # Reusable UI components (Radix-based)
│
├── lib/                         # Core application logic
│   ├── api/                     # API service layer (35 files)
│   │   ├── api-client.ts        # Centralized HTTP client
│   │   ├── auth.ts              # Authentication API
│   │   ├── products.ts          # Product/marketplace API
│   │   ├── cart.ts              # Shopping cart API
│   │   ├── orders.ts            # Order management API
│   │   ├── addresses.ts         # Address management
│   │   ├── admin-*.ts           # Admin APIs
│   │   ├── seller-*.ts          # Seller APIs
│   │   └── buyer-*.ts           # Buyer APIs
│   ├── auth/                    # Authentication logic
│   │   ├── auth-context.tsx     # Auth React context
│   │   ├── auth-utils.ts        # Token management
│   │   └── seller-auth-context.tsx
│   ├── features/                # Redux slices
│   │   ├── cart-slice.ts        # Cart state management
│   │   └── parts-slice.ts       # Parts/products state
│   ├── hooks/                   # Custom React hooks
│   │   └── use-cart.ts          # Cart operations hook
│   ├── store.ts                 # Redux store configuration
│   └── config.ts                # App configuration (API URLs)
│
└── public/                      # Static assets
```

---

## 🔐 Authentication System

### Flow
1. **Login**: User submits credentials → API returns JWT token + user data
2. **Token Storage**: Stored in `localStorage` with expiry tracking
3. **Token Usage**: Automatically attached to API requests via `Authorization: Bearer <token>`
4. **Token Refresh**: Supports refresh token mechanism
5. **Auto-Logout**: Token expiry checked on each request

### Key Files
- `lib/auth/auth-context.tsx`: React context for auth state
- `lib/auth/auth-utils.ts`: Token storage/retrieval utilities
- `lib/api/auth.ts`: Login/logout/refresh API calls

### Auth State Management
- **Context**: `AuthContext` provides `user`, `isAuthenticated`, `role`, `login()`, `logout()`
- **Storage**: `localStorage` for tokens and user data
- **Role Detection**: Automatically determines role from user data

---

## 🛒 Shopping Cart System

### Architecture
- **Hybrid Approach**: Redux for UI state + API for persistence
- **Sync Strategy**: Cart synced with backend on every operation
- **Authentication Required**: All cart operations require login

### Cart Operations
1. **Add to Cart**: Requires `inventoryId` from product
2. **Update Quantity**: Updates via API, syncs Redux
3. **Remove Item**: Removes via API, syncs Redux
4. **Clear Cart**: Clears both API and Redux state

### Key Files
- `lib/features/cart-slice.ts`: Redux cart state
- `lib/hooks/use-cart.ts`: Cart operations hook
- `lib/api/cart.ts`: Cart API endpoints

### Cart Data Structure
```typescript
interface CartItem {
  id: string              // Product ID
  name: string
  price: number
  quantity: number
  cartItemId: string      // Cart item ID from API
  inventoryId: string     // Seller inventory ID (required)
  // ... other product fields
}
```

---

## 📦 Product Catalog System

### Features
- **Search**: Full-text search by name, description, category
- **Filtering**: By category, make, model, year, price range
- **Pagination**: Server-side pagination support
- **Real-time**: Fetches from API on filter/search changes
- **View Modes**: Grid and list views

### Product Data Flow
1. User applies filters/search
2. `fetchProducts()` called with filters
3. API returns paginated results
4. Products mapped to `Part` interface
5. Displayed in catalog with add-to-cart functionality

### Key Files
- `components/catalog-content.tsx`: Main catalog component
- `lib/api/products.ts`: Product API service
- `lib/features/parts-slice.ts`: Product state (legacy, mostly for filtering)

### Product Structure
```typescript
interface Part {
  id: string
  name: string
  category: string
  price: number
  image: string
  description: string
  inStock: boolean
  inventoryId?: string    // Required for cart operations
  sellerId?: string
  sellerName?: string
  averageRating?: number
  reviewCount?: number
  // ... compatibility, specs, etc.
}
```

---

## 🛍️ Order Management

### Checkout Flow
1. **Cart Review**: User reviews items in cart
2. **Address Selection**: Choose saved address or add new
3. **Order Details**: PO number, cost center, notes, coupon
4. **Payment Method**: PayNow, PayPal, or Cash on Delivery
5. **Order Placement**: Creates order via API
6. **Confirmation**: Order confirmation page

### Order Features
- Multiple shipping addresses
- Order notes and PO numbers
- Coupon code support
- Multiple payment methods
- Order history tracking

### Key Files
- `app/checkout/page.tsx`: Checkout page
- `lib/api/orders.ts`: Order API
- `lib/api/addresses.ts`: Address management

---

## 🎛️ Dashboard Features

### Buyer Dashboard
- **Overview**: Order statistics, recent orders
- **Orders**: Order history with status tracking
- **Returns**: Return requests and status
- **Settings**: Profile management
- **Notifications**: Buyer-specific notifications

### Seller Dashboard
- **Overview**: Sales metrics, revenue, order stats
- **Inventory**: Product management (CRUD operations)
- **Orders**: Order processing and fulfillment
- **Returns**: Return requests handling
- **Coupons**: Discount code management
- **Staff**: Staff account management
- **Reports**: Sales and financial reports
- **Finance**: Payouts and accounting
- **Payments**: Payment processing
- **Profile**: Business profile management
- **Settings**: Account settings
- **Notifications**: Seller-specific notifications

### Admin Dashboard
- **Overview**: Platform-wide statistics
- **Users**: Manage all users (buyers, sellers, staff)
- **Products**: Manage all marketplace products
- **Orders**: View all orders across platform
- **Returns**: Process all return requests
- **Payouts**: Manage seller payouts
- **Reviews**: Review moderation
- **Dispatch**: Order dispatch management
- **Reports**: Platform analytics
- **Notifications**: System-wide notifications

---

## 🔌 API Integration

### API Client Architecture
- **Centralized Client**: `lib/api/api-client.ts`
- **Auto-Auth**: Automatically adds Bearer token to requests
- **Error Handling**: Smart 401 handling (distinguishes token errors from permission errors)
- **Response Parsing**: Standardized response format

### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
```

### API Endpoints Structure
```
/api/auth/*              # Authentication
/api/buyer/*            # Buyer operations
/api/seller/*           # Seller operations
/api/admin/*            # Admin operations
```

### Key API Services
- **Authentication**: Login, logout, refresh, current user
- **Products**: Marketplace search, product details
- **Cart**: Add, update, remove, get cart
- **Orders**: Create, list, get order details
- **Addresses**: CRUD operations
- **Admin**: User management, product management, etc.
- **Seller**: Inventory, orders, reports, etc.

---

## 🎨 UI/UX Features

### Design System
- **Theme**: Dark mode with glassmorphism effects
- **Colors**: Accent color system with customizable themes
- **Typography**: Inter font with light/semibold weights
- **Components**: Radix UI primitives with custom styling

### Key UI Components
- **Navigation**: Responsive nav with mega menu
- **Search**: Live search with filters
- **Product Cards**: Grid/list views with hover effects
- **Cart**: Slide-out cart drawer
- **Forms**: React Hook Form with validation
- **Modals**: Dialog system for confirmations
- **Toasts**: Sonner for notifications

### Animations
- **Framer Motion**: Page transitions, list animations
- **Hover Effects**: Scale transforms, color transitions
- **Loading States**: Skeleton loaders, spinners

---

## 🔄 State Management

### Redux Store Structure
```typescript
{
  parts: {
    items: Part[]
    filteredItems: Part[]
    selectedCategory: string | null
    filters: { year, make, model, category }
  },
  cart: {
    items: CartItem[]
    total: number
    isLoading: boolean
    lastSyncAt: string | null
  }
}
```

### State Sync Strategy
- **Cart**: Always synced with API (no local-only state)
- **Products**: Fetched from API, stored in component state
- **Auth**: Context + localStorage (no Redux)

---

## 🚀 Key Features

### Search & Discovery
- Full-text product search
- Advanced filtering (category, make, model, year)
- VIN-based search support
- Real-time search results
- Category browsing

### Shopping Experience
- Add to cart (requires authentication)
- Cart persistence (synced with backend)
- Multiple payment methods
- Address management
- Order tracking

### Seller Tools
- Inventory management
- Order processing
- Staff management
- Financial reporting
- Coupon creation

### Admin Tools
- User management
- Product moderation
- Platform analytics
- Return processing
- Payout management

---

## 🔧 Configuration

### Environment Variables
- `NEXT_PUBLIC_API_URL`: Override API base URL
- `NODE_ENV`: Development/production mode

### Config File
- `lib/config.ts`: Centralized configuration
- Auto-detects environment
- Supports localhost and production URLs

---

## 📝 Development Notes

### Authentication Flow
1. User logs in → Token stored in localStorage
2. Token attached to all API requests
3. Token expiry checked on each request
4. Auto-redirect to login on 401 (token errors only)

### Cart Sync
- Cart always synced with backend
- No offline cart support
- Requires authentication for all operations

### Error Handling
- Network errors handled gracefully
- Token errors trigger logout
- Permission errors don't clear auth
- User-friendly error messages

### Performance
- Image optimization via Next.js Image
- Code splitting via Next.js App Router
- Lazy loading for components
- Debounced search inputs

---

## 🗂️ File Organization Patterns

### API Services
- One file per domain (auth, products, cart, etc.)
- All use centralized `apiClient`
- Standardized error handling
- TypeScript interfaces for all responses

### Components
- Feature-based organization
- Reusable UI components in `components/ui/`
- Dashboard components in `components/dashboard/`
- Page-specific components co-located

### State Management
- Redux for global state (cart, parts)
- Context for auth state
- Component state for UI-only state
- API state managed via hooks

---

## 🔍 Key Dependencies

### Core
- `next`: 16.0.10
- `react`: 19.2.0
- `typescript`: ^5

### State & Data
- `@reduxjs/toolkit`: 2.11.2
- `react-redux`: 9.2.0

### UI
- `tailwindcss`: ^4.1.9
- `@radix-ui/*`: Various UI primitives
- `framer-motion`: 12.23.26
- `lucide-react`: ^0.454.0

### Forms
- `react-hook-form`: ^7.60.0
- `zod`: 3.25.76
- `@hookform/resolvers`: ^3.10.0

---

## 🎯 Current Status

### Completed Features
- ✅ Multi-role authentication system
- ✅ Product catalog with search/filtering
- ✅ Shopping cart with API sync
- ✅ Checkout flow
- ✅ Order management
- ✅ Buyer dashboard
- ✅ Seller dashboard (inventory, orders, reports)
- ✅ Admin dashboard
- ✅ Address management
- ✅ Return requests
- ✅ Review system
- ✅ Notification system

### Architecture Highlights
- Modern Next.js App Router
- Type-safe API layer
- Centralized state management
- Responsive design
- Dark mode support
- Glassmorphism UI

---

## 📚 Additional Resources

- **Parts Detail Features**: See `PARTS_DETAIL_PAGE_FEATURES.md`
- **TODO Items**: See `TODO.md`
- **Component Library**: All UI components in `components/ui/`
- **API Documentation**: API services in `lib/api/`

---

## 🔐 Security Considerations

- JWT tokens stored in localStorage
- Token expiry checking
- Automatic logout on token errors
- Protected routes via auth guards
- Role-based access control
- API request authentication

---

This system overview provides a comprehensive understanding of the Simbi Market platform architecture, features, and implementation details.
