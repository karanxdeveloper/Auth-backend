import jwt from "jsonwebtoken"

const userAuth = async (req,res,next)=>{
    // console.log(req.cookies)
    const {token} = req.cookies;
    // console.log(token)

    if(!token){
        return res.json({success:false, message:"Not Authorized Login Again", tokenFailure:"the token is not found"})
    }

    try {
      
     const tokenDecode = jwt.verify(token,process.env.JWT_SECRET);
    //  console.log(tokenDecode)

        if(tokenDecode.id){
            
            req.user = tokenDecode.id
        }else{
            return res.json({success:false,message:"Not Authorized. Login Again",tokenDecode:"token decode to object id failure"})
        }


        next()

    } catch (error) {
        return res.json({success:false, message:error.message, customMessage:"This is user auth message"})
    }
}

export default userAuth;