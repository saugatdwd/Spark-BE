import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import auth from '../../config/auth';
import Profile from '../../models/profiles';


const router = require("express").Router();
// Like a user
router.post('/like/:userId', auth, async (req: Request, res: Response) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.user._id);
    const likedUserId = req.params.userId;
    const likedUserObjectId = new mongoose.Types.ObjectId(likedUserId);
    if (currentUserId.equals(likedUserObjectId)) {
      return res.status(400).json({ error: 'You cannot like yourself.' });
    }
    const currentProfile = await Profile.findOne({ user: currentUserId });
    const likedProfile = await Profile.findOne({ user: likedUserObjectId });
    if (!currentProfile || !likedProfile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    if (currentProfile.likes.includes(likedUserObjectId)) {
      return res.status(400).json({ error: 'Already liked this user.' });
    }
    currentProfile.likes.push(likedUserObjectId);
    // Check for mutual like
    if (likedProfile.likes.includes(currentUserId)) {
      currentProfile.matches.push(likedUserObjectId);
      likedProfile.matches.push(currentUserId);
      await likedProfile.save();
    }
    await currentProfile.save();
    res.json({ success: true, message: 'User liked successfully.' });
  } catch (e) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Dislike a user
router.post('/dislike/:userId', auth, async (req:Request, res:Response) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.user._id);
    const dislikedUserId = req.params.userId;
    const dislikedUserObjectId = new mongoose.Types.ObjectId(dislikedUserId);
    if (currentUserId.equals(dislikedUserObjectId)) {
      return res.status(400).json({ error: 'You cannot dislike yourself.' });
    }
    const currentProfile = await Profile.findOne({ user: currentUserId });
    if (!currentProfile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    if (currentProfile.dislikes.includes(dislikedUserObjectId)) {
      return res.status(400).json({ error: 'Already disliked this user.' });
    }
    currentProfile.dislikes.push(dislikedUserObjectId);
    await currentProfile.save();
    res.json({ success: true , message: 'User disliked successfully.' });
  } catch (e) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get matches
router.get('/matches', auth, async (req:Request, res: Response) => {
  try {
    const currentUserId = req.user._id;
    const currentProfile = await Profile.findOne({ user: currentUserId }).populate({
        path: 'matches',
        select: 'username name email photos'});
    if (!currentProfile) {
        return res.status(404).json({ error: 'Profile not found.' });
    }
    res.json({ matches: currentProfile.matches });
  } catch (e) {
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
