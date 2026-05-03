# 🍽️ ZaaykaQR —  Digital Menu Ordering System

**ZaaykaQR** is a high-performance, mobile-first digital ordering solution built specifically for Indian street food vendors, cafes, and restaurants. It bridges the gap between traditional dining and modern technology by providing a seamless, QR-based interface that requires **no app downloads** and **no logins** for the customer.

## 🌟 Why ZaaykaQR?
- **Zero Friction**: Customers scan and order in seconds. No complex registration.
- **Customer Retention**: Built-in loyalty system encourages repeat visits by tracking rewards automatically via phone numbers.
- **Operational Efficiency**: Real-time kitchen dashboard reduces order errors and wait times.
- **Smart Logistics**: Industry-first dynamic ETA logic that understands the difference between a quick "Chai" and a heavy "Paneer Curry."

---

## 🚀 Core Features

### 🛒 Customer Experience
- **QR-Based Entry**: Instant access to the menu by scanning a table-specific QR code.
- **Intelligent Loyalty System**: Life-time points tracking via mobile number. See past points, current rewards, and total balance in real-time.
- **Live Order Tracking**: Dynamic ETA calculation and status updates (Received ➔ Preparing ➔ Ready ➔ Delivered).
- **Responsive Design**: Fully optimized for smartphones with a premium "App-like" feel.

### 👨‍🍳 Admin & Kitchen Management
- **Live Orders Dashboard**: Real-time order management with Socket.io integration.
- **Revenue Analytics**: Daily summaries of total sales, UPI vs. Cash collections, and pending payments.
- **Table QR Generator**: Instant generation and download of table-specific QR codes with branding.
- **Inventory Control**: One-click toggling of item availability.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, Socket.io.
- **Database**: MongoDB Atlas (Cloud), Mongoose ODM.
- **Design**: Vanilla CSS with a focus on modern aesthetics (Glassmorphism, Vibrant Palettes).

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js installed
- MongoDB Atlas account (or local MongoDB)

### 2. Installation
Clone the repository:
```bash
git clone https://github.com/Navneet225/ZaaykaQR.git
```

### 3. Setup Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
VENDOR_UPI_ID=yourname@upi
VENDOR_NAME=ZaaykaQR
```

### 4. Running the App
**Start Backend:**
```bash
cd server
npm install
npm start
```

**Start Frontend:**
```bash
cd client
npm install
npm run dev
```

---

## 📸 Preview & Verification
- **Mobile Menu**: [View Screenshot](client/src/assets/react.svg) *(Replace with actual screenshot paths if desired)*
- **Admin Dashboard**: [View Screenshot](client/src/assets/react.svg)

---

## 📄 License
MIT License - Created with ❤️ by Navneet.
