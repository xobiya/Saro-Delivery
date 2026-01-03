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
        await User.deleteMany();

        // Create users one by one to trigger 'save' middleware for password hashing
        const createdUsers = [];
        for (const user of users) {
            const createdUser = await User.create(user);
            createdUsers.push(createdUser);
        }

        // Find specific users for order assignment
        const adminUser = createdUsers[0]._id;
        const customerUser = createdUsers[1]._id;
        const vendorUser = createdUsers[2]._id; // Saro Vendor
        const driverUser = createdUsers[3]._id;

        // Create Vendors
        const vendorData = {
            owner: vendorUser,
            businessName: "Saro's Kitchen",
            description: "Authentic Ethiopian Cuisine in Arba Minch",
            categories: ["Ethiopian", "Traditional"],
            logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80",
            bannerUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
            location: {
                type: "Point",
                coordinates: [37.5641, 6.0206], // Example coords
                address: "Sikela, Arba Minch"
            },
            isOpen: true
        };

        const createdVendor = await Vendor.create(vendorData);

        // Create Products
        const products = [
            {
                vendor: createdVendor._id,
                name: "Special Kitfo",
                description: "Minced raw beef, marinated in mitmita and niter kibbeh",
                price: 450,
                category: "Main Dish",
                imageUrl: "https://images.unsplash.com/photo-1599587428800-4b28178d2127?auto=format&fit=crop&w=500&q=80"
            },
            {
                vendor: createdVendor._id,
                name: "Doro Wat",
                description: "Spicy chicken stew with hard-boiled eggs",
                price: 400,
                category: "Main Dish",
                imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=500&q=80"
            },
            {
                vendor: createdVendor._id,
                name: "Spris Juice",
                description: "Mixed fruit juice (Avocado, Mango, Papaya)",
                price: 80,
                category: "Drinks",
                imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=500&q=80"
            }
        ];

        await Product.insertMany(products);

        const sampleOrders = [
            {
                user: customerUser,
                vendor: createdVendor._id,
                type: 'food_delivery',
                pickupLocation: {
                    address: 'Saro\'s Kitchen, Sikela',
                    coordinates: { lat: 6.0206, lng: 37.5641 }
                },
                dropoffLocation: {
                    address: 'Arba Minch University, Main Campus',
                    coordinates: { lat: 6.0333, lng: 37.5500 }
                },
                items: [
                    { name: 'Special Tibs', price: 350, quantity: 1 },
                    { name: 'Injera', price: 20, quantity: 3 }
                ],
                totalAmount: 410,
                status: 'pending'
            },
            {
                user: customerUser,
                driver: driverUser,
                type: 'package_delivery',
                pickupLocation: {
                    address: 'Sikela Market, Arba Minch',
                    coordinates: { lat: 6.0000, lng: 37.5500 }
                },
                dropoffLocation: {
                    address: 'Bekele Molla Hotel',
                    coordinates: { lat: 6.0400, lng: 37.5600 }
                },
                items: [
                    { name: 'Care Package', price: 150, quantity: 1 }
                ],
                totalAmount: 200,
                status: 'in_transit'
            }
        ];

        await Order.insertMany(sampleOrders);

        console.log('Data Imported!');
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
