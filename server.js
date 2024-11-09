const express = require('express');
const cors = require('cors');
const { connectDB } = require('./mongodb/database');
const tasksRoutes = require('./routes/tasks'); 
const commentsRoutes = require('./routes/comments'); 
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const authRoutes = require('./routes/auth');
const authenticateToken = require('./middleware/authMiddleware'); 

const app = express();

app.use(express.json());
app.use(cors());

// Swagger configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Your API',
            version: '1.0.0',
            description: 'API Documentation',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./routes/*.js'], // Path to your route files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/', (req, res) => {
    res.send('Task Management API');
});

// Use routes with authentication middleware
app.use('/tasks', authenticateToken, tasksRoutes);
app.use('/comments', authenticateToken, commentsRoutes); 
app.use('/auth', authRoutes); 

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong! Please try again later.');
});

// Connect to the database and start the server
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to the database. Server not started:', err);
    });
