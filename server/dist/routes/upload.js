"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/upload.ts
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Agent_1 = __importDefault(require("../models/Agent"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'agents');
        console.log('Upload directory:', uploadDir);
        // Ensure the upload directory exists
        if (!fs_1.default.existsSync(uploadDir)) {
            console.log('Creating upload directory...');
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.floor(100000000 + Math.random() * 900000000);
        const filename = `${uniqueSuffix}${file.originalname}`;
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        // Only allow .cpp files
        if (!file.originalname.endsWith('.py')) {
            console.error('Invalid file type:', file.originalname);
            cb(null, false);
            return;
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});
// POST endpoint to handle file uploads
router.post("/agent", upload.single("file"), async (req, res) => {
    console.log('Upload request received:', {
        file: req.file,
        body: req.body,
        headers: req.headers
    });
    if (!req.file) {
        console.log('No file in request');
        return res.status(400).json({ error: "No file uploaded" });
    }
    if (!req.body.wallet) {
        console.log('No wallet address provided');
        return res.status(400).json({ error: "Wallet address is required" });
    }
    try {
        // Verify file exists after upload
        if (!fs_1.default.existsSync(req.file.path)) {
            throw new Error(`File not found at path: ${req.file.path}`);
        }
        console.log('File saved successfully at:', req.file.path);
        // Get the file ID from the filename (without extension)
        // const fileId = path.basename(req.file.filename, '.cpp');
        // console.log('Generated fileId:', fileId);
        // Clean up the local file
        // try {
        //   fs.unlinkSync(req.file.path);
        //   console.log('Local file cleaned up');
        // } catch (cleanupError) {
        //   console.error('Failed to clean up local file:', cleanupError);
        //   // Continue even if cleanup fails
        // }
        const walletAddress = req.body.wallet;
        const rank = await Agent_1.default.countDocuments({ status: 'active', competition: req.body.competition });
        const agent = await Agent_1.default.insertOne({
            walletAddress: walletAddress,
            status: 'active',
            createdAt: new Date(),
            name: req.file.filename.slice(23, -3),
            filename: req.file.filename,
            lastUpdatedAt: new Date(),
            rank: rank,
            rating: 1200
        });
        const user = await User_1.default.findOneAndUpdate({ walletAddress }, {
            $push: {
                agents: agent._id
            }
        });
        for (const id of user?.agents ?? []) {
            const doc = await Agent_1.default.findOne({ _id: id });
            if (doc && doc.status === "active" && doc.competition == req.body.competition) {
                await Agent_1.default.updateOne({ _id: id }, { $set: { status: "inactive" } });
                console.log(`Updated: ${id}`);
            }
            else {
                console.log(`Skipped: ${id}`);
            }
        }
        // Return the file information
        res.json({
            success: true,
            fileId: req.file.filename,
            message: 'File uploaded successfully',
            name: req.file.originalname
        });
    }
    catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({
            error: 'Failed to process upload',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
