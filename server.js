import express from "express"
import cors from "cors"
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";

const app = express();
const port = process.env.PORT || 5000
connectDB()

app.use(express.json())
app.use(cookieParser())
app.use(cors({credentials:true}))

app.get("/api/status", (req,res)=>res.send("server is live"))



app.listen(port, ()=>{
    console.log("the server is running on port", port)
})