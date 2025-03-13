   // src/routes/users.ts
   import { Router } from 'express';
   import User from '../models/User';

   const router = Router();

   // Get user by wallet address
   router.get('/:wallet', async (req, res) => {
     try {
       const user = await User.findOne({ walletAddress: req.params.wallet });
       if (!user) return res.status(404).json({ error: 'User not found' });
       res.json(user);
     } catch (error) {
       res.status(500).json({ error: 'Server error' });
     }
   });

   // Create a new user
   router.post('/', async (req, res) => {
     try {
       const newUser = new User(req.body);
       await newUser.save();
       res.status(201).json(newUser);
     } catch (error) {
       res.status(500).json({ error: 'Server error' });
     }
   });

   export default router; // Ensure this line is present