import express from 'express';
import dotenv from 'dotenv';
import apiRouter from './routes/apiRoutes.js';
import swaggerUI from 'swagger-ui-express';
import swaggerFile from './swagger-output.json' with { type: 'json' };
import cors from 'cors';
import { tunnelmole } from 'tunnelmole';
import client from 'prom-client';
dotenv.config()
const app = express()
app.set('view engine', 'ejs');
app.use(express.static('public'));



client.collectDefaultMetrics();

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    });
  });
  next();
});
app.use(express.static(process.cwd())); // To serve the generated .zip files
// To Parse the body of the email as json
app.use(express.json())

app.use(express.urlencoded({ extended: true }));
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
app.use(cors({
  origin: "*", // For development, allow everything. For production, put your frontend URL.
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerFile))
// Use the Routers
app.use('/api', apiRouter);  // API routes
app.use('/', (req,res)=>{
    res.send({"message":'Welcome'})
});   


app.listen(process.env.PORT,'0.0.0.0',()=>{
    console.log(`Server is Listening on http://localhost:${process.env.PORT} `, process.env.PORT)
})


