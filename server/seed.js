const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MenuItem = require('./models/MenuItem');
const Admin = require('./models/Admin');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const menuItems = [
  { name: 'Paneer Butter Masala', price: 220, category: 'North Indian', description: 'Rich and creamy paneer curry', prepTime: 25 },
  { name: 'Butter Naan', price: 40, category: 'North Indian', description: 'Soft leavened bread with butter', prepTime: 12 },
  { name: 'Dal Makhani', price: 180, category: 'North Indian', description: 'Slow cooked black lentils', prepTime: 20 },
  { name: 'Veg Biryani', price: 160, category: 'North Indian', description: 'Fragrant rice with vegetables', prepTime: 25 },
  
  { name: 'Masala Dosa', price: 90, category: 'South Indian', description: 'Crispy crepe with potato filling', prepTime: 15 },
  { name: 'Idli Sambar', price: 60, category: 'South Indian', description: 'Steamed rice cakes with lentil soup', prepTime: 12 },
  { name: 'Vada', price: 50, category: 'South Indian', description: 'Deep fried lentil donuts', prepTime: 12 },
  { name: 'Uttapam', price: 80, category: 'South Indian', description: 'Savory rice pancake with toppings', prepTime: 15 },
  
  { name: 'Veg Hakka Noodles', price: 120, category: 'Chinese', description: 'Stir fried noodles with veggies', prepTime: 20 },
  { name: 'Fried Rice', price: 130, category: 'Chinese', description: 'Wok tossed rice with veggies', prepTime: 20 },
  { name: 'Manchurian', price: 140, category: 'Chinese', description: 'Veggie balls in spicy gravy', prepTime: 20 },
  { name: 'Spring Rolls', price: 110, category: 'Chinese', description: 'Crispy rolls with veg filling', prepTime: 15 },
  
  { name:'Tea',                  price:20,  category:'Beverages',    description:'Hot masala chai',              prepTime:5,  isAvailable:true },
  { name:'Coffee',               price:40,  category:'Beverages',    description:'Filter coffee',                prepTime:5,  isAvailable:true },
  { name:'Cold Drink',           price:50,  category:'Beverages',    description:'Chilled soda',                 prepTime:3,  isAvailable:true },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Seed Menu
    await MenuItem.deleteMany({});
    const seeded = await MenuItem.insertMany(menuItems);
    console.log(`Menu seeded successfully! Inserted ${seeded.length} items.`);

    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

seedDB();
