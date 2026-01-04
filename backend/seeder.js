const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users');
const User = require('./models/User');
const Order = require('./models/Order');
const Vendor = require('./models/Vendor');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Order.deleteMany();
        await Vendor.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        const createdUsers = [];
        for (const user of users) {
            const createdUser = await User.create(user);
            createdUsers.push(createdUser);
        }

        const customerUser = createdUsers[1]._id;
        const driverUser = createdUsers[3]._id;

        const vendorConfigs = [
            {
                owner: createdUsers[2]._id,
                businessName: "Saro's Kitchen",
                description: "Authentic Ethiopian Cuisine in Arba Minch",
                categories: ["Ethiopian", "Restaurant"],
                bannerUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200",
                location: { coordinates: [37.5641, 6.0206], address: "Sikela, Arba Minch" }
            },
            {
                owner: createdUsers[4]._id,
                businessName: "Paradiso Hotel",
                description: "Luxury stay and dining with a view of the lakes.",
                categories: ["Hotel", "International", "Restaurant"],
                bannerUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
                location: { coordinates: [37.5600, 6.0100], address: "Abaya Lake View, Arba Minch" }
            },
            {
                owner: createdUsers[5]._id,
                businessName: "Haile Resort Arba Minch",
                description: "Premium resort experience with traditional and modern dishes.",
                categories: ["Resort", "Hotel", "Ethiopian", "Restaurant"],
                bannerUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?w=1200",
                location: { coordinates: [37.5500, 6.0300], address: "Chamo Side, Arba Minch" }
            }
        ];

        const productData = {
            "Saro's Kitchen": [
                { name: "Special Kitfo", price: 450, category: "Traditional", img: "https://images.unsplash.com/photo-1599587428800-4b28178d2127" },
                { name: "Doro Wat", price: 400, category: "Traditional", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5" },
                { name: "Shekla Tibs", price: 380, category: "Grilled", img: "https://images.unsplash.com/photo-1544025162-d76694265947" },
                { name: "Beyaynetu", price: 250, category: "Vegetarian", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" },
                { name: "Gomen Be Siga", price: 320, category: "Main Dish", img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d" },
                { name: "Firfir", price: 200, category: "Breakfast", img: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0" },
                { name: "Injera Extra", price: 20, category: "Sides", img: "https://images.unsplash.com/photo-1589135339644-88f58b99037c" },
                { name: "Spris Juice", price: 80, category: "Drinks", img: "https://images.unsplash.com/photo-1613478223719-2ab802602423" },
                { name: "Tej (Honey Wine)", price: 150, category: "Drinks", img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3" },
                { name: "Coffee Ceremony Set", price: 120, category: "Drinks", img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085" }
            ],
            "Paradiso Hotel": [
                { name: "Tilapia Fish Cutlet", price: 350, category: "Seafood", img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2" },
                { name: "Grilled Nile Perch", price: 420, category: "Seafood", img: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369" },
                { name: "Chechebsa", price: 220, category: "Breakfast", img: "https://images.unsplash.com/photo-1506084868730-342011fca31b" },
                { name: "Ful Medames", price: 180, category: "Breakfast", img: "https://images.unsplash.com/photo-1590595906931-81f04f0ccebb" },
                { name: "Beef Burger", price: 300, category: "Western", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd" },
                { name: "Club Sandwich", price: 280, category: "Western", img: "https://images.unsplash.com/photo-1528605248644-14dd04cb113d" },
                { name: "Spaghetti Aglio e Olio", price: 250, category: "Pasta", img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141" },
                { name: "Mixed Salad", price: 150, category: "Healthy", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" },
                { name: "Fruit Salad", price: 120, category: "Healthy", img: "https://images.unsplash.com/photo-1544145945-f904253db0ad" },
                { name: "Avocado Smoothie", price: 100, category: "Drinks", img: "https://images.unsplash.com/photo-1525385133333-256720f78d65" }
            ],
            "Haile Resort Arba Minch": [
                { name: "Special Agelgil", price: 800, category: "Platter", img: "https://images.unsplash.com/photo-1599587428800-4b28178d2127" },
                { name: "Beyaynetu (Fasting)", price: 280, category: "Traditional", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" },
                { name: "Tibs Firfir", price: 340, category: "Traditional", img: "https://images.unsplash.com/photo-1544025162-d76694265947" },
                { name: "Kitfo (Special)", price: 500, category: "Traditional", img: "https://images.unsplash.com/photo-1599587428800-4b28178d2127" },
                { name: "Chicken Wings", price: 320, category: "Starters", img: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f" },
                { name: "Margherita Pizza", price: 350, category: "Pizza", img: "https://images.unsplash.com/photo-1574129624517-61c0dc5cd5c3" },
                { name: "Steak Mushroom Sauce", price: 650, category: "Premium", img: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092" },
                { name: "Vegetable Soup", price: 150, category: "Starters", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd" },
                { name: "Brownie Ice Cream", price: 200, category: "Dessert", img: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e" },
                { name: "Ethiopian Macchiato", price: 60, category: "Coffee", img: "https://images.unsplash.com/photo-1541167760496-162955ed8a9f" }
            ]
        };

        for (const config of vendorConfigs) {
            const vendor = await Vendor.create(config);
            const products = productData[config.businessName].map(p => ({
                vendor: vendor._id,
                name: p.name,
                description: `Freshly prepared ${p.name} from ${config.businessName}.`,
                price: p.price,
                category: p.category,
                imageUrl: `${p.img}?auto=format&fit=crop&w=500&q=80`
            }));
            await Product.insertMany(products);
        }

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Order.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
