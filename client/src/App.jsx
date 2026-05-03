import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OrderProvider, useOrder } from './context/OrderContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartModal from './components/CartModal';
import Home from './pages/Home';
import OrderTracking from './pages/OrderTracking';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import './index.css';

function AppContent() {
  const { showCart } = useOrder();
  return (
    <Router>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/"               element={<Home />} />
            <Route path="/menu"           element={<Home />} />
            <Route path="/track/:id"      element={<OrderTracking />} />
            <Route path="/admin/login"    element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
        {showCart && <CartModal />}
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <OrderProvider>
      <AppContent />
    </OrderProvider>
  );
}
