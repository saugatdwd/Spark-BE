import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import auth from '../../config/auth';
import Message from '../../models/message';
import Profile from '../../models/profiles';

const router = require("express").Router();

router.post('/send', auth, async (req:Request, res:Response) => {
  try {
    const senderId = req.user._id;
    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ error: 'receiverId and content are required.' });
    }
    const senderProfile = await Profile.findOne({ user: senderId });
    if (!senderProfile || !senderProfile.matches.includes(receiverId)) {
      return res.status(403).json({ error: 'You can only message matched users.' });
    }
    const message = new Message({ sender: senderId, receiver: receiverId, content });
    await message.save();
    res.json({ success: true, message });
  } catch (e) {
    res.status(500).json({ error: 'Server error.' });
  }
});


router.get('/history/:userId', auth, async (req:Request, res:Response) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.userId;
    const otherUserObjectId = new mongoose.Types.ObjectId(otherUserId);

    const userProfile = await Profile.findOne({ user: userId });
    if (!userProfile || !userProfile.matches.includes(otherUserObjectId)) {
      return res.status(403).json({ error: 'You can only view messages with matched users.' });
    }
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ timestamp: 1 });
    res.json({ messages });
  } catch (e) {
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
