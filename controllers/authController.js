import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"


export const register = async (req,res)=>{
    const {name,email,passoword} = req.body;

    if(!name || !email || !passoword){
        return res.json({success:false, message:"missing details"})
    };

    try {

        const existingUser = await userModel.findOne({email})
        if(existingUser){
            return res.json({success:false,message:"User already exists"})
        }

        const hashedPassword = await bcrypt.hash(passoword,10);

        const user = new userModel({name,email,passoword:hashedPassword})
        await user.save();

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET,{expiresIn:"7d"});

        res.cookie("token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV === "production" ? "none" : "strict",
            maxage:7 * 24 * 60 * 60 * 1000
        })

    } catch (error) {
        res.json({success:false,message:error.message})
    }
}