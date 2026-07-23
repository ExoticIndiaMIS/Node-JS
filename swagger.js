import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Exotic India - MIS',
    description: 'API for managing simple tasks',
  },
  host: 'localhost:4000',
  schemes: ['http'],
  securityDefinitions: {
    apiKeyAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'x-api-key',
      description: 'API Key authentication. Pass your secret key in the x-api-key header.'
    }
  },
  security: [
    {
      apiKeyAuth: []
    }
  ]
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.js']; // Point to your main file where routes are defined

swaggerAutogen(outputFile, endpointsFiles, doc);