import express from "express"
import cors from "cors"
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";


const app = express();
const port = process.env.PORT || 5000
connectDB()

const allowedOrigins = ['https://auth-frontend-taupe.vercel.app']

app.use(express.json())
app.use(cookieParser())
app.use(cors({origin:allowedOrigins,credentials:true}))

// API endpoints
app.get("/api/status", (req,res)=>res.send("API is live"))
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)



app.listen(port, ()=>{
    console.log("the server is running on port", port)
})