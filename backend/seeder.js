const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load models
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const Order = require('./models/Order');
const Review = require('./models/Review');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        // Clear existing data
        await Review.deleteMany();
        await Order.deleteMany();
        await Coupon.deleteMany();
        await Product.deleteMany();
        await Vendor.deleteMany();
        await User.deleteMany();

        console.log('Data Cleared...');

        // 1. Create Users
        const users = [
            {
                name: 'Admin User',
                email: 'admin@saro.com',
                password: 'password123',
                role: 'admin',
                phone: '+251911111111'
            },
            {
                name: 'Haile Restaurant Owner',
                email: 'haile@saro.com',
                password: 'password123',
                role: 'vendor',
                phone: '+251922222222'
            },
            {
                name: 'Paradise Lodge Owner',
                email: 'paradise@saro.com',
                password: 'password123',
                role: 'vendor',
                phone: '+251933333333'
            },
            {
                name: 'Abyssinia Burger Owner',
                email: 'abyssinia@saro.com',
                password: 'password123',
                role: 'vendor',
                phone: '+251944444444'
            },
            {
                name: 'Abebe Driver',
                email: 'driver@saro.com',
                password: 'password123',
                role: 'driver',
                phone: '+251955555555'
            },
            {
                name: 'Customer Joe',
                email: 'joe@gmail.com',
                password: 'password123',
                role: 'customer',
                phone: '+251966666666'
            }
        ];

        // const createdUsers = await User.insertMany(users);
        const createdUsers = [];
        for (const user of users) {
            const u = await User.create(user);
            createdUsers.push(u);
        }
        const adminUser = createdUsers[0]._id;
        const vendor1User = createdUsers[1]._id;
        const vendor2User = createdUsers[2]._id;
        const vendor3User = createdUsers[3]._id;

        console.log('Users Created...');

        // 2. Create Vendors
        const vendors = [
            {
                owner: vendor1User,
                businessName: 'Haile Resort Arba Minch',
                description: 'Luxury dining with lake view and traditional Ethiopian dishes.',
                categories: ['Restaurant', 'Luxury', 'Ethiopian'],
                rating: 4.8,
                numReviews: 12,
                location: {
                    address: 'Near 40 Springs, Arba Minch',
                    coordinates: [37.55, 6.02]
                },
                bannerUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200',
                logoUrl: 'https://logo.com/image.png'
            },
            {
                owner: vendor2User,
                businessName: 'Paradise Lodge',
                description: 'Unique bamboo huts and spectacular terrace views.',
                categories: ['Hotel', 'Cafe', 'Traditional'],
                rating: 4.6,
                numReviews: 8,
                location: {
                    address: 'Hillside, Arba Minch',
                    coordinates: [37.54, 6.03]
                },
                bannerUrl: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=1200'
            },
            {
                owner: vendor3User,
                businessName: 'Abyssinia Burger & Pizza',
                description: 'Fast food favorites with a local twist. Best pizza in town!',
                categories: ['Fast Food', 'Pizza', 'Burger'],
                rating: 4.2,
                numReviews: 25,
                location: {
                    address: 'Sikela Area, Arba Minch',
                    coordinates: [37.56, 6.01]
                },
                bannerUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1200'
            }
        ];

        const createdVendors = await Vendor.insertMany(vendors);
        const v1 = createdVendors[0]._id;
        const v2 = createdVendors[1]._id;
        const v3 = createdVendors[2]._id;

        console.log('Vendors Created...');

        // 3. Create Products
        const products = [
            // Haile Products
            {
                vendor: v1,
                name: 'Special Kitfo',
                description: 'Finely chopped lean beef, seasoned with mitmita and niter kibbeh.',
                price: 450,
                category: 'Main Course',
                imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=500'
            },
            {
                vendor: v1,
                name: 'Shiro Tegabino',
                description: 'Spiced chickpea stew served in a clay pot.',
                price: 280,
                category: 'Vegetarian',
                imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500'
            },
            // Paradise Products
            {
                vendor: v2,
                name: 'Grilled Tilapia',
                description: 'Fresh fish from Lake Chamo, grilled with local herbs.',
                price: 380,
                category: 'Seafood',
                imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=500'
            },
            {
                vendor: v2,
                name: 'Buna (Traditional Coffee)',
                description: 'Freshly roasted Ethiopian coffee ceremony.',
                price: 50,
                category: 'Beverage'
            },
            // Abyssinia Products
            {
                vendor: v3,
                name: 'Spicy Abyssinia Burger',
                description: 'Double beef patty with special spicy sauce and cheese.',
                price: 220,
                category: 'Burger',
                imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500'
            },
            {
                vendor: v3,
                name: 'Margarita Pizza',
                description: 'Classic pizza with fresh mozzarella and tomato sauce.',
                price: 320,
                category: 'Pizza'
            }
        ];

        await Product.insertMany(products);
        console.log('Products Created...');

        // 4. Create Coupons
        const coupons = [
            {
                code: 'SARO50',
                discountType: 'fixed',
                discountValue: 50,
                minOrderAmount: 300,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                isActive: true
            },
            {
                code: 'WELCOME10',
                discountType: 'percentage',
                discountValue: 10,
                minOrderAmount: 0,
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                isActive: true
            }
        ];

        await Coupon.insertMany(coupons);
        console.log('Coupons Created...');

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Review.deleteMany();
        await Order.deleteMany();
        await Coupon.deleteMany();
        await Product.deleteMany();
        await Vendor.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB().then(() => {
    if (process.argv[2] === '-d') {
        destroyData();
    } else {
        importData();
    }
});
