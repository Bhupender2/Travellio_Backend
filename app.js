//WORK WITH EXPRESS

const express = require('express');
const app = express();

const tourRouter = require('./Routes/tourRouter')
const userRouter = require('./Routes/userRouter')
const reviewRouter = require('./Routes/reviewRouter')
const AppError = require('./utils/AppError')
const GlobalErrorHandler = require('./utils/GlobalErrorHandler')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitizer = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');

app.use(express.json());
app.use(cookieParser());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(cors({
    origin: 'http://localhost:5173', // your frontend origin
    credentials: true,               // allow cookies to be sent
    samesite: 'Lax',
    secure: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],  // ✅ Ensure PATCH is allowed
    allowedHeaders: ['Content-Type', 'Authorization']  // ✅ Ensure correct headers
}));

app.use(limiter);
app.use(helmet());
app.use(mongoSanitizer());
app.use(xss());

//app.use('/', (req, res, next) => { res.send("My Server"); next(); })
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.get("/", (req, res) => {
    res.send("Welcome to the Travellio API!");
});


app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

app.use(GlobalErrorHandler)

module.exports = app;


