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

app.use(express.json())
app.use(cookieParser())
app.use(cors({credentials:true}))

// API endpoints
app.get("/api/status", (req,res)=>res.send("API is live"))
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)



app.listen(port, ()=>{
    console.log("the server is running on port", port)
})