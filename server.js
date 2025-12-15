const express=require("express")
require("dotenv").config()
const {connectDB}=require("./config/db.js")
const app=express()
const authRoute=require("./routes/authRoutes.js")
const authorRoute=require("./routes/authorRoutes.js")
const adminRoute=require("./routes/adminRoutes.js")
const path=require("path")
const cors=require("cors")
const session = require("express-session");
const passport=require("passport")
require("./config/passport");

// Optional: session for Passport (some strategies require it)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());


app.use(
  cors({
    origin: [
      "https://blog-shell-frontend.vercel.app", // production frontend
      "http://localhost:5173",                  // local frontend for testing
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // allow cookies
  })
);

// handle prefiglight requests
app.options("*", cors());


// middlewares
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ extended: true, limit: '1gb' }));
// Serve static files from 'uploads' and 'videos' directories
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// routes
app.use("/user",authRoute)
app.use("/author",authorRoute)
app.use("/admin",adminRoute)

app.get("/",(req,res)=>{
    res.send("hi i am blogshell server")
})

app.listen(process.env.PORT,()=>{
    console.log(`server started on port ${process.env.PORT}`)
    connectDB()
})