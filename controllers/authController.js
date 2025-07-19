import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"
import transporter from "../config/nodeMailer.js";


export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "missing details" })
    };

    try {

        const existingUser = await userModel.findOne({ email })
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({ name, email, password: hashedPassword })
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        // Sending welcome email
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to mern auth",
            text: `welcome to mern auth.your account has been created with emai id: ${email}`
        }

        await transporter.sendMail(mailOption)

        return res.json({ success: true, message: "Sign up Successfull" })


    } catch (error) {
        res.json({ success: false, message: error.message, name: "this is register error" })
    }
}


export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Email and passwrd are required" })
    }

    try {

        const user = await userModel.findOne({ email });
        if (!user) {
            res.json({ success: false, message: "invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "invalid password" })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxage: 7 * 24 * 60 * 60 * 1000
        })

        return res.json({ success: true, message: "Logged in Successfully" })



    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}


export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({ success: true, message: "Logged out" })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Send verification otp to user's email
export const sendVerifyOtp = async (req, res) => {
    try {

        const { userId } = req.body;

        const user = await userModel.findById(userId);

        if (user.isAccountVerified) {
            res.json({ success: false, message: "already verified" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account verification OTP",
            text: `Your OTP is ${otp}. verify your account using this OTP.`
        }

        await transporter.sendMail(mailOption);

        res.json({ success: true, message: `verification OTP sent on Email ${user.email}` })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

//Verify email
export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.json({ success: false, message: "missing details" })
    }

    try {

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }

        if (user.verifyOtp === "" || user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" })
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP Expired" })
        }

        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpireAt = 0;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Verification Status",
            text: `Your email ${user.email} is Verified`
        }

        await transporter.sendMail(mailOption);

        return res.json({ success: true, message: "Email verified successfully" })

    } catch (error) {

    }
}

// Check if user is Authenticated
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

// Send password reset OTP
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: "Email is Required" })
    }

    try {

        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password Reset OTP",
            text: `Your OTP for resetting your password is **${otp}**. 🔴 Use this OTP to procees with resetting your password.`
        }

        await transporter.sendMail(mailOption);

        return res.json({success:true,message:"OTP sent to your email"})

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

// Reset User Password
export const resetPassword = async(req,res)=>{
    const {email,otp,newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success:false,message:"Email,OTP and new Password are required"})
    }
    try {
        
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:"User not found"})
        }

        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({success:false,message:"Invalid OTP"})
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success:false,message:"OTP Expired"})
        }

        const hasedPassword = await bcrypt.hash(newPassword,10);

        user.password = hasedPassword;

        user.resetOtp = "";
        user.resetOtpExpireAt = 0;

        return res.json({success:true,message:"Password has been reset Successfully"})

    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}