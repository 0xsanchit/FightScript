"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodb_1 = __importDefault(require("../lib/mongodb"));
const User_1 = __importDefault(require("../models/User"));
const Agent_1 = __importDefault(require("../models/Agent"));
const router = express_1.default.Router();
// GET /api/users?wallet=:wallet
router.get('/', async (req, res) => {
    try {
        const { wallet } = req.query;
        console.log('Received wallet query:', wallet); // Debug log
        if (!wallet) {
            return res.status(400).json({ error: 'No wallet address provided' });
        }
        console.log('Connecting to database...'); // Debug log
        await (0, mongodb_1.default)();
        console.log('Database connected, searching for user...'); // Debug log
        const user = await User_1.default.findOne({ walletAddress: wallet }).lean();
        console.log('User found:', user ? 'Yes' : 'No'); // Debug log
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json(user);
    }
    catch (error) {
        console.error('Failed to fetch user:', error);
        return res.status(500).json({
            error: 'Failed to fetch user data',
            details: error?.message || 'Unknown error'
        });
    }
});
// GET /api/users/:id - Get user by wallet address
router.get('/:id', async (req, res) => {
    console.log("Getting user");
    try {
        const walletAddress = req.params.id;
        console.log('Received wallet address:', walletAddress); // Debug log
        if (!walletAddress) {
            return res.status(400).json({ error: 'No wallet address provided' });
        }
        console.log('Connecting to database...'); // Debug log
        await (0, mongodb_1.default)();
        console.log('Database connected, searching for user...'); // Debug log
        const user = await User_1.default.findOne({ walletAddress }).lean();
        console.log('User found:', user ? 'Yes' : 'No'); // Debug log
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Find the agent for this user
        const agent = await Agent_1.default.findOne({ walletAddress }).lean();
        console.log('Agent found:', agent ? 'Yes' : 'No'); // Debug log
        // Calculate rank if agent exists
        let rank = 0;
        if (agent) {
            // Count agents with more points than this one
            const higherRankedAgents = await Agent_1.default.countDocuments({ points: { $gt: agent.points } });
            rank = higherRankedAgents + 1; // Rank is 1-based
        }
        // Return user with agent data
        return res.json({
            ...user,
            agent: agent ? {
                ...agent,
                rank
            } : {
                name: 'Anonymous',
                wins: 0,
                losses: 0,
                draws: 0,
                points: 0,
                rank: 0
            }
        });
    }
    catch (error) {
        console.error('Failed to fetch user:', error);
        return res.status(500).json({
            error: 'Failed to fetch user data',
            details: error?.message || 'Unknown error'
        });
    }
});
// POST /api/users
router.post('/', async (req, res) => {
    try {
        const { walletAddress, stats, totalEarnings, ...userData } = req.body;
        console.log('Received user data:', { walletAddress, ...userData }); // Debug log
        console.log('Connecting to database...'); // Debug log
        await (0, mongodb_1.default)();
        console.log('Database connected'); // Debug log
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ walletAddress });
        console.log('Existing user found:', existingUser ? 'Yes' : 'No'); // Debug log
        if (existingUser) {
            return res.json(existingUser);
        }
        // Create new user with stats
        console.log('Creating new user...'); // Debug log
        const user = await User_1.default.create({
            walletAddress,
            ...userData,
            stats,
            totalEarnings,
            role: 'user',
            createdAt: new Date()
        });
        console.log('User created successfully'); // Debug log
        return res.json(user);
    }
    catch (error) {
        console.error('Failed to create user:', error);
        return res.status(500).json({
            error: 'Failed to create user',
            details: error?.message || 'Unknown error'
        });
    }
});
router.get('/stats', async (req, res) => {
    const { wallet } = req.query;
    if (!wallet) {
        return res.status(400).json({ error: 'Wallet address is required' });
    }
    try {
        const user = await User_1.default.findOne({ walletAddress: wallet });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const agents = await Agent_1.default.find({ walletAddress: wallet });
        const totalGames = agents.reduce((sum, agent) => sum + agent.wins + agent.losses, 0);
        res.json({
            username: user.username,
            walletAddress: user.walletAddress,
            totalGames,
            agents: agents.map(agent => ({
                _id: agent._id,
                name: agent.name,
                wins: agent.wins,
                losses: agent.losses,
                status: agent.status,
                createdAt: agent.createdAt
            }))
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
});
// Add this route to create a test user
router.post('/create-test', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address is required' });
        }
        await (0, mongodb_1.default)();
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ walletAddress });
        if (existingUser) {
            return res.json(existingUser);
        }
        // Create new test user
        const user = await User_1.default.create({
            walletAddress,
            username: `User${walletAddress.slice(0, 4)}`,
            profileImage: '',
            bio: 'Test user',
            stats: {
                totalAgents: 0,
                competitionsWon: 0,
                tokensEarned: 0,
                winRate: 0
            },
            totalEarnings: 0
        });
        return res.json(user);
    }
    catch (error) {
        console.error('Failed to create test user:', error);
        return res.status(500).json({
            error: 'Failed to create test user',
            details: error.message
        });
    }
});
exports.default = router;
