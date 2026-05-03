import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const OrderContext = createContext();

const API = 'http://localhost:5000';

export const OrderProvider = ({ children }) => {
  const [cart, setCart]               = useState(() => {
    const saved = localStorage.getItem('zaayka_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [tableNumber, setTableNumber] = useState(localStorage.getItem('zaayka_table') || '');
  const [showCart, setShowCart]       = useState(false);
  const [activeOrder, setActiveOrder] = useState(() => {
    const saved = localStorage.getItem('zaayka_active_order');
    return saved ? JSON.parse(saved) : null;
  });
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const socketRef = useRef(null);

  // Persist tableNumber
  useEffect(() => {
    if (tableNumber) localStorage.setItem('zaayka_table', tableNumber);
    else localStorage.removeItem('zaayka_table');
  }, [tableNumber]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('zaayka_cart', JSON.stringify(cart));
  }, [cart]);

  // Persist activeOrder
  useEffect(() => {
    if (activeOrder) localStorage.setItem('zaayka_active_order', JSON.stringify(activeOrder));
    else localStorage.removeItem('zaayka_active_order');
  }, [activeOrder]);

  // Socket.io — reconnect whenever activeOrder changes
  useEffect(() => {
    const socket = io(API, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('orderUpdate', (updated) => {
      setActiveOrder(prev => {
        const isCurrent = prev?._id === updated._id;
        if (isCurrent) return updated;
        return prev;
      });
    });

    return () => socket.disconnect();
  }, []);

  const addToCart = (item) => {
    setCart(prev => {
      const found = prev.find(i => i._id === item._id);
      if (found) return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const found = prev.find(i => i._id === id);
      if (found?.quantity > 1) return prev.map(i => i._id === id ? { ...i, quantity: i.quantity - 1 } : i);
      return prev.filter(i => i._id !== id);
    });
  };

  const clearCart = () => setCart([]);

  const totalAmount = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <OrderContext.Provider value={{
      cart, addToCart, removeFromCart, clearCart,
      tableNumber, setTableNumber,
      showCart, setShowCart,
      activeOrder, setActiveOrder,
      loyaltyPoints, setLoyaltyPoints,
      totalAmount,
      API,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);
