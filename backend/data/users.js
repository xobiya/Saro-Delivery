const bcrypt = require('bcryptjs');

const users = [
    {
        name: 'Admin User',
        email: 'admin@saro.com',
        password: 'password123',
        role: 'admin',
        phone: '0911000000',
        addresses: [{ street: 'Admin HQ', city: 'Arba Minch' }]
    },
    {
        name: 'Almaz Customer',
        email: 'almaz@gmail.com',
        password: 'password123',
        role: 'customer',
        phone: '0912345678',
        addresses: [{ street: 'Secha, Arba Minch', city: 'Arba Minch' }]
    },
    {
        name: 'Saro Vendor',
        email: 'vendor@saro.com',
        password: 'password123',
        role: 'vendor',
        phone: '0913456789',
        addresses: [{ street: 'Sikela, Arba Minch', city: 'Arba Minch' }]
    },
    {
        name: 'Kebede Driver',
        email: 'kebede@saro.com',
        password: 'password123',
        role: 'driver',
        phone: '0914567890',
        addresses: [{ street: 'Nech Sar, Arba Minch', city: 'Arba Minch' }]
    },
    {
        name: 'Paradiso Owner',
        email: 'paradiso@hotel.com',
        password: 'password123',
        role: 'vendor',
        phone: '0915678901',
    },
    {
        name: 'Haile Owner',
        email: 'haile@resort.com',
        password: 'password123',
        role: 'vendor',
        phone: '0916789012',
    },
];

module.exports = users;
