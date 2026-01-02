import express from 'express';
import {authUser, registerUser, logoutUser} from '../controllers/userController.js';
import {protect} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, (req, res) => res.json(req.user));

export default router;