import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dating App API',
      version: '1.0.0',
      description: 'API documentation for the Dating App',
    },
    servers: [
      {
        url: 'https://spark-be-ix83.onrender.com/',
      },
    ],
  },
  apis: ['./routes/api/*.ts'], 
};

const swaggerSpec = swaggerJsdoc(options);

export default function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
