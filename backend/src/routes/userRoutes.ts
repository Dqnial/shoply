import express from 'express';
import {authUser, registerUser, logoutUser} from '../controllers/userController.js';
import {protect, AuthRequest} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/register', registerUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, (req: AuthRequest, res) => {
    res.json(req.user);
});

export default router;