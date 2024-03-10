const jwt=require("jsonwebtoken");
const User=require("../model/userSchema");
const Authenticate=async(req,res,next)=>{
try{
const token=req.cookies.jwtoken;
    console.log(token);
const verifytoken=jwt.verify(token,process.env.SECRET_KEY);
    console.log("me);
    console.log(process.env.SECRET_KEY);
     console.log("mey);
    console.log(verifytoken);
const rootUser=await User.findOne({_id:verifytoken._id,"tokens.token":token});
    console.log("hel); 
     console.log(rootUser);
if(!rootUser){
    throw new Error("User not found");

}
req.token=token;
req.rootUser=rootUser;
req.userID=rootUser._id;
    console.log("request arrha");
console.log(req);
next();
}
catch(err){
res.status(401).send("Unauthorized:No token provided");
console.log(err);
}
}
module.exports=Authenticate;
