const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const { getDB } = require('../mongodb/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - status
 *         - assignedTo
 *         - dueDate
 *         - priority
 *         - createdBy
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the task
 *         title:
 *           type: string
 *           description: Title of the task
 *         description:
 *           type: string
 *           description: Description of the task
 *         status:
 *           type: string
 *           enum: [pending, completed]
 *           description: Status of the task
 *         assignedTo:
 *           type: string
 *           description: The person assigned to the task
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Due date of the task
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Priority of the task
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags associated with the task
 *         comments:
 *           type: array
 *           items:
 *             type: string
 *           description: Comments related to the task
 *         createdBy:
 *           type: string
 *           description: The creator of the task
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the task was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the task was last updated
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Retrieve a list of tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const tasks = await db.collection('Tasks').find().toArray();
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Failed to retrieve tasks', error: error.message });
    }
});

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task found by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *       400:
 *         description: Invalid task ID format
 */
router.get('/:id', async (req, res) => {
    const taskId = req.params.id;

    if (!ObjectId.isValid(taskId)) {
        return res.status(400).json({ message: 'Invalid task ID format' });
    }

    try {
        const db = getDB();
        const task = await db.collection('Tasks').findOne({ _id: new ObjectId(taskId) });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error('Error fetching task by ID:', error);
        res.status(500).json({ message: 'Failed to retrieve task', error: error.message });
    }
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: All fields are required
 */
router.post('/', async (req, res) => {
    const { title, description, status, assignedTo, dueDate, priority, createdBy, tags = [], comments = [] } = req.body;

    // Validate required fields
    if (!title || !description || !status || !assignedTo || !dueDate || !priority || !createdBy) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const db = getDB();
        const newTask = {
            title,
            description,
            status,
            assignedTo,
            dueDate: new Date(dueDate),
            priority,
            tags,
            comments,
            createdBy,
            createdAt: new Date(),
            updatedAt: new Date() // Set the initial updatedAt to now
        };
        const result = await db.collection('Tasks').insertOne(newTask);
        res.status(201).json({ message: 'Task created successfully', taskId: result.insertedId });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Failed to create task', error: error.message });
    }
});

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update an existing task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 *       400:
 *         description: All fields are required
 */
router.put('/:id', async (req, res) => {
    const taskId = req.params.id;

    if (!ObjectId.isValid(taskId)) {
        return res.status(400).json({ message: 'Invalid task ID format' });
    }

    const { title, description, status, assignedTo, dueDate, priority } = req.body;

    // Validate required fields
    if (!title || !description || !status || !assignedTo || !dueDate || !priority) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const db = getDB();
        const updatedTask = {
            $set: {
                title,
                description,
                status,
                assignedTo,
                dueDate: new Date(dueDate),
                priority,
                updatedAt: new Date() // Update the updatedAt field
            }
        };

        const result = await db.collection('Tasks').updateOne({ _id: new ObjectId(taskId) }, updatedTask);

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: 'Task updated successfully' });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Failed to update task', error: error.message });
    }
});

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
router.delete('/:id', async (req, res) => {
    const taskId = req.params.id;

    if (!ObjectId.isValid(taskId)) {
        return res.status(400).json({ message: 'Invalid task ID format' });
    }

    try {
        const db = getDB();
        const result = await db.collection('Tasks').deleteOne({ _id: new ObjectId(taskId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Failed to delete task', error: error.message });
    }
});

module.exports = router;
