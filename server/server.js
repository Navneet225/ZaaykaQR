const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET','POST','PATCH'] } });

app.use(cors());
app.use(express.json());

// ─── DEMO STORE ───────────────────────────────────────────────────────────────
const MENU = [
  { _id:'1',  name:'Paneer Butter Masala', price:220, category:'North Indian', description:'Rich & creamy paneer curry',   prepTime:25, isAvailable:true },
  { _id:'2',  name:'Dal Makhani',          price:180, category:'North Indian', description:'Slow-cooked black lentils',    prepTime:20, isAvailable:true },
  { _id:'3',  name:'Butter Naan',          price:40,  category:'North Indian', description:'Soft leavened bread',          prepTime:12, isAvailable:true },
  { _id:'4',  name:'Masala Dosa',          price:90,  category:'South Indian', description:'Crispy dosa with filling',     prepTime:15, isAvailable:true },
  { _id:'5',  name:'Idli Sambar',          price:60,  category:'South Indian', description:'Steamed rice cakes',           prepTime:12, isAvailable:true },
  { _id:'6',  name:'Vada',                 price:50,  category:'South Indian', description:'Crispy lentil fritters',       prepTime:12, isAvailable:true },
  { _id:'7',  name:'Noodles',              price:120, category:'Chinese',      description:'Stir-fried Hakka noodles',     prepTime:20, isAvailable:true },
  { _id:'8',  name:'Fried Rice',           price:130, category:'Chinese',      description:'Wok-tossed veggie rice',       prepTime:20, isAvailable:true },
  { _id:'9',  name:'Manchurian',           price:140, category:'Chinese',      description:'Spicy gravy balls',            prepTime:20, isAvailable:true },
  { _id:'10', name:'Tea',                  price:20,  category:'Beverages',    description:'Hot masala chai',              prepTime:5,  isAvailable:true },
  { _id:'11', name:'Coffee',               price:40,  category:'Beverages',    description:'Filter coffee',                prepTime:5,  isAvailable:true },
  { _id:'12', name:'Cold Drink',           price:50,  category:'Beverages',    description:'Chilled soda',                 prepTime:3,  isAvailable:true },
];

let demoOrders = [];
let demoUsers  = [];
let isDemoMode = false;

const fs = require('fs');
const USERS_FILE = './demo_users.json';
const loadDemoUsers = () => {
  try { if (fs.existsSync(USERS_FILE)) demoUsers = JSON.parse(fs.readFileSync(USERS_FILE)); } catch (e) {}
};
const saveDemoUsers = () => {
  try { fs.writeFileSync(USERS_FILE, JSON.stringify(demoUsers, null, 2)); } catch (e) {}
};
loadDemoUsers();

// ─── DB ───────────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || '')
  .then(async () => {
    console.log('✅ MongoDB connected');
    
    // Auto-seed if database is empty
    try {
      const MenuItem = require('./models/MenuItem');
      const count = await MenuItem.countDocuments();
      if (count === 0) {
        console.log('🌱 Database is empty. Seeding default menu...');
        const seedItems = [
          { name: 'Paneer Butter Masala', price: 220, category: 'North Indian', description: 'Rich and creamy paneer curry', prepTime: 25 },
          { name: 'Butter Naan', price: 40, category: 'North Indian', description: 'Soft leavened bread with butter', prepTime: 12 },
          { name: 'Masala Dosa', price: 90, category: 'South Indian', description: 'Crispy crepe with potato filling', prepTime: 15 },
          { name: 'Veg Hakka Noodles', price: 120, category: 'Chinese', description: 'Stir fried noodles with veggies', prepTime: 20 },
          { name: 'Tea', price: 20, category: 'Beverages', description: 'Hot masala chai', prepTime: 5 }
        ];
        await MenuItem.insertMany(seedItems);
        console.log('✅ Auto-seed successful!');
      }
    } catch (err) {
      console.error('❌ Auto-seed failed:', err);
    }
  })
  .catch(() => { console.log('⚠️  Demo Mode (no MongoDB)'); isDemoMode = true; });

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const calcETA = (items) => {
  const maxPrep   = Math.max(...items.map(i => i.prepTime || 15));
  const totalQty  = items.reduce((s, i) => s + i.quantity, 0);
  
  let buffer = 15;
  if (maxPrep < 10) buffer = 5;
  else if (maxPrep <= 15) buffer = 10;
  
  return buffer + maxPrep + (totalQty > 1 ? (totalQty - 1) * 2 : 0);
};
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ','');
    if (!token) throw new Error();
    jwt.verify(token, process.env.JWT_SECRET || 'zaayka_secret');
    next();
  } catch { res.status(401).json({ message: 'Unauthorised' }); }
};

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// GET /api/config  (frontend fetches vendor UPI)
app.get('/api/config', (req, res) => {
  res.json({
    vendorUpi:  process.env.VENDOR_UPI_ID  || 'vendor@upi',
    vendorName: process.env.VENDOR_NAME    || 'ZaaykaQR',
  });
});

// GET /api/menu
app.get('/api/menu', async (req, res) => {
  try {
    if (isDemoMode) return res.json(MENU);
    const menu = await require('./models/MenuItem').find({ isAvailable: true });
    res.json(menu);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/orders
app.post('/api/orders', async (req, res) => {
  try {
    const { table, items, total, phone, paymentMethod = 'cash' } = req.body;
    if (!table || !items?.length || !total)
      return res.status(400).json({ message: 'table, items and total are required' });

    const eta          = calcETA(items);
    const pointsEarned = Math.floor(total / 10);

    // Loyalty
    let totalPoints = 0;
    if (phone) {
      if (isDemoMode) {
        let u = demoUsers.find(u => u.phone === phone);
        if (!u) { u = { phone, points: 0 }; demoUsers.push(u); }
        u.points += pointsEarned;
        saveDemoUsers();
        totalPoints = u.points;
      } else {
        const UserModel = require('./models/User');
        const u = await UserModel.findOneAndUpdate(
          { phone }, { $inc: { points: pointsEarned } }, { upsert: true, new: true }
        );
        totalPoints = u.points;
      }
    }

    const orderData = {
      table, items, total, eta,
      phone: phone || '',
      pointsEarned,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'Received',
      createdAt: new Date()
    };

    let order;
    if (isDemoMode) {
      order = { ...orderData, _id: genId() };
      demoOrders.unshift(order);
    } else {
      order = await new (require('./models/Order'))(orderData).save();
    }

    io.emit('newOrder', order);
    res.status(201).json({ order, pointsEarned, totalPoints });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/orders/:id
app.get('/api/orders/:id', async (req, res) => {
  try {
    if (isDemoMode) {
      const o = demoOrders.find(o => o._id === req.params.id);
      return o ? res.json(o) : res.status(404).json({ message: 'Not found' });
    }
    const o = await require('./models/Order').findById(req.params.id);
    o ? res.json(o) : res.status(404).json({ message: 'Not found' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/users/:phone
app.get('/api/users/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    let points = 0;
    if (isDemoMode) {
      const u = demoUsers.find(u => u.phone === phone);
      points = u ? u.points : 0;
    } else {
      const UserModel = require('./models/User');
      const u = await UserModel.findOne({ phone });
      points = u ? u.points : 0;
    }
    res.json({ points });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PATCH /api/orders/:id  (update status OR paymentStatus)
app.patch('/api/orders/:id', auth, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const validStatuses = ['Received','Preparing','Ready','Delivered'];
    if (status && !validStatuses.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const update = {};
    if (status)        update.status        = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    let order;
    if (isDemoMode) {
      const idx = demoOrders.findIndex(o => o._id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: 'Not found' });
      Object.assign(demoOrders[idx], update);
      order = demoOrders[idx];
    } else {
      order = await require('./models/Order').findByIdAndUpdate(req.params.id, update, { new: true });
    }

    io.emit('orderUpdate', order);
    res.json(order);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/admin/orders
app.get('/api/admin/orders', auth, async (req, res) => {
  try {
    if (isDemoMode) return res.json(demoOrders);
    const orders = await require('./models/Order').find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/admin/analytics
app.get('/api/admin/analytics', auth, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    let orders;
    if (isDemoMode) orders = demoOrders.filter(o => new Date(o.createdAt) >= today);
    else orders = await require('./models/Order').find({ createdAt: { $gte: today } });

    const totalRevenue    = orders.reduce((s,o) => s + o.total, 0);
    const upiRevenue      = orders.filter(o => o.paymentMethod === 'upi'  && o.paymentStatus === 'paid').reduce((s,o) => s + o.total, 0);
    const cashRevenue     = orders.filter(o => o.paymentMethod === 'cash' && o.paymentStatus === 'paid').reduce((s,o) => s + o.total, 0);
    const pendingRevenue  = orders.filter(o => o.paymentStatus === 'pending').reduce((s,o) => s + o.total, 0);

    res.json({ totalOrders: orders.length, totalRevenue, upiRevenue, cashRevenue, pendingRevenue });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'zaayka_secret', { expiresIn: '24h' });
      res.json({ token });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ─── SOCKET ───────────────────────────────────────────────────────────────────
io.on('connection', socket => {
  console.log('🔌 Client:', socket.id);
  socket.on('disconnect', () => console.log('🔌 Disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
