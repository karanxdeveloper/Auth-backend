import userModel from "../models/userModel.js";

export const getUserData = async (req,res)=>{
    try {
        // console.log(req.user,"this is get user data")
        const userId = req.user;
        
        const user = await userModel.findById(userId);

        if(!user){ 
            return res.json({success:false,message:"User not found", customMessage:"This is not user if condition"})
        }

        return res.json({
            success:true,
            userData:{
                name:user.name,
                isAccountVerified:user.isAccountVerified
            }
        })
    } catch (error) {
        return res.json({success:false,message:error.message, custom:"this is get user data error"})
    }
}