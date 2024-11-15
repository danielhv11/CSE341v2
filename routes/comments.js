const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const { getDB } = require('../mongodb/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - taskId
 *         - content
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the comment
 *         taskId:
 *           type: string
 *           description: The ID of the task associated with this comment
 *         content:
 *           type: string
 *           description: The content of the comment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the comment was created
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Retrieve a list of comments
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []  # Specify that this endpoint requires a bearer token
 *     responses:
 *       200:
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const comments = await db.collection('Comments').find().toArray();
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Failed to retrieve comments', error: error.message });
    }
});

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []  # Specify that this endpoint requires a bearer token
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment found by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *       400:
 *         description: Invalid comment ID format
 */
router.get('/:id', async (req, res) => {
    const commentId = req.params.id;

    if (!ObjectId.isValid(commentId)) {
        return res.status(400).json({ message: 'Invalid comment ID format' });
    }

    try {
        const db = getDB();
        const comment = await db.collection('Comments').findOne({ _id: new ObjectId(commentId) });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        res.status(200).json(comment);
    } catch (error) {
        console.error('Error fetching comment by ID:', error);
        res.status(500).json({ message: 'Failed to retrieve comment', error: error.message });
    }
});

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []  # Specify that this endpoint requires a bearer token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: All fields are required
 */
router.post('/', async (req, res) => {
    const { taskId, content } = req.body;

    if (!taskId || !content) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const db = getDB();
        const newComment = {
            taskId,
            content,
            createdAt: new Date()
        };
        const result = await db.collection('Comments').insertOne(newComment);
        res.status(201).json({ message: 'Comment created successfully', commentId: result.insertedId });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Failed to create comment', error: error.message });
    }
});

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update an existing comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []  # Specify that this endpoint requires a bearer token
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       404:
 *         description: Comment not found
 *       400:
 *         description: All fields are required
 */
router.put('/:id', async (req, res) => {
    const commentId = req.params.id;

    if (!ObjectId.isValid(commentId)) {
        return res.status(400).json({ message: 'Invalid comment ID format' });
    }

    const { taskId, content } = req.body;
    
    if (!taskId || !content) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const db = getDB();
        const updatedComment = {
            $set: {
                taskId,
                content,
            }
        };

        const result = await db.collection('Comments').updateOne({ _id: new ObjectId(commentId) }, updatedComment);
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.status(200).json({ message: 'Comment updated successfully' });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Failed to update comment', error: error.message });
    }
});

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []  # Specify that this endpoint requires a bearer token
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */
router.delete('/:id', async (req, res) => {
    const commentId = req.params.id;

    if (!ObjectId.isValid(commentId)) {
        return res.status(400).json({ message: 'Invalid comment ID format' });
    }

    try {
        const db = getDB();
        const result = await db.collection('Comments').deleteOne({ _id: new ObjectId(commentId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Failed to delete comment', error: error.message });
    }
});

module.exports = router;
