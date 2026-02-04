const express = require('express');
const path = require('path');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
    getProfile,
    updateProfile,
    updateAvatar,
    addAddress,
    updateAddress,
    deleteAddress,
    startPhoneChange,
    verifyPhoneChange,
    startReauthOtp,
    verifyReauthOtp,
    logoutAllDevices,
    deleteAccount,
} = require('../controllers/profileController');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
        cb(null, `${req.user._id}-${Date.now()}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const ok = /^(image\/jpeg|image\/png|image\/webp)$/i.test(file.mimetype);
    cb(ok ? null : new Error('Only JPG/PNG/WebP images are allowed'), ok);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/avatar', upload.single('avatar'), updateAvatar);

router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

router.post('/phone/start', startPhoneChange);
router.post('/phone/verify', verifyPhoneChange);

router.post('/security/reauth/start', startReauthOtp);
router.post('/security/reauth/verify', verifyReauthOtp);
router.post('/security/logout-all', logoutAllDevices);
router.post('/security/delete', deleteAccount);

module.exports = router;
