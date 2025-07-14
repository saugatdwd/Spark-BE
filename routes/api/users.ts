import type { Request, Response } from "express";
const router = require("express").Router();
import User from "../../models/user";
import auth from "../../config/auth";
import { calculateAge } from "../../utils/date.utils";
import { HydratedDocument } from "mongoose";
import { UserType } from "../../types/user";
import bcrypt from "bcryptjs";


/**
 * @route   POST /users
 * @desc    Register new user
 * @access  Public
 */

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const user = new User({
      ...req.body,
      password: req.body.password,
    });

    await user.save();


    const Profile = require('../../models/profiles').default;
    await Profile.create({ user: user._id });


    const token = await user.generateAuthToken(); 
    res.status(201).send({ user, token });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

/**
 * @route   GET /users
 * @desc    Get all users
 * @access  Private
 */
/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200: 
 *         description: Successful response
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 age:
 *                   type: number
 *       400:
 *         description: Bad request
 */
router.get("/", auth, async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    const age = calculateAge(req.user.dob);
    res.send({
      users,
      age,
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

/**
 * @route   GET /users/me
 * @desc    Get logged in user details
 * @access  Private
 */
router.get("/me", auth, async (req: Request, res: Response) => {
  try {
    const userDoc = req.user as HydratedDocument<UserType>;

    const {
      _id,
      name,
      email,
      gender,
      dob,
      role,
      createdAt,
      updatedAt,
      location,
      preference,
    } = userDoc.toObject();
    const age = calculateAge(dob);

    res.send({
      user: {
        _id,
        name,
        email,
        gender,
        dob,
        role,
        createdAt,
        updatedAt,
        age,
        location,
        preference,
      },
    });
  } catch (e) {
    console.error("Error in /me route", e);
    res.status(400).send({ error: "Failed to retrieve user" });
  }
});

/**
 * @route   GET /users/:id
 * @desc    Get user by id
 * @access  Private
 */
router.get("/:id", auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    return !user ? res.sendStatus(404) : res.send(user);
  } catch (e) {
    return res.sendStatus(400);
  }
});

/**
 * @route   PATCH /users/me
 * @desc    Update logged in user
 * @access  Private
 */
router.patch("/me", auth, async (req: Request, res: Response) => {
  const validationErrors: string[] = [];
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "role"];
  const isValidOperation = updates.every((update) => {
    const isValid = allowedUpdates.includes(update);
    if (!isValid) validationErrors.push(update);
    return isValid;
  });

  if (!isValidOperation)
    return res
      .status(400)
      .send({ error: `Invalid updates: ${validationErrors.join(",")}` });

  try {
    const { user } = req;
    updates.forEach((update) => {
      user[update] = req.body[update];
    });

    await user.save();
    return res.send(user);
  } catch (e) {
    return res.status(400).send(e);
  }
});

/**
 * @route   PATCH /users/:id
 * @desc    Update user by id
 * @access  Private
 */
router.patch("/:id", auth, async (req: Request, res: Response) => {
  const validationErrors: string[] = [];
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "role"];
  const isValidOperation = updates.every((update) => {
    const isValid = allowedUpdates.includes(update);
    if (!isValid) validationErrors.push(update);
    return isValid;
  });

  if (!isValidOperation)
    return res
      .status(400)
      .send({ error: `Invalid updates: ${validationErrors.join(",")}` });

  try {
    const _id = req.params.id;
    const user = await User.findById(_id);
    if (!user) return res.sendStatus(404);
    updates.forEach((update) => {
      (user as any)[update] = req.body[update];
    });

    await user.save();

    return res.send(user);
  } catch (e) {
    return res.status(400).send(e);
  }
});

/**
 * @route   DELETE /users/me
 * @desc    Delete logged in user
 * @access  Private
 */
router.delete("/me", auth, async (req: Request, res: Response) => {
  try {
    await req.user.remove();
    res.send({ message: "User Deleted" });
  } catch (e) {
    res.sendStatus(400);
  }
});

/**
 * @route   DELETE /users/:id
 * @desc    Delete user by id
 * @access  Private
 */
router.delete("/:id", auth, async (req: Request, res: Response) => {
  const _id = req.params.id;
  try {
    const user = await User.findByIdAndDelete(_id);
    if (!user) return res.sendStatus(404);

    return res.send({ message: "User Deleted" });
  } catch (e) {
    return res.sendStatus(400);
  }
});

export { router as userRoutes };
