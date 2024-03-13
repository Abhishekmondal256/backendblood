const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const multer=require("multer");
const cors=require("cors");
const bodyParser = require('body-parser');
const cookieParser=require("cookie-parser");
const corsOption={
origin:"https://frontendblood.onrender.com",
   credentials: true,
}
  
router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cors(corsOption));
const authenticate=require("../middleware/authenticate");
console.log(authenticate);
require("../db/conn");


const User = require("../model/userSchema");
router.get('/', (req, res) => {
  res.send("hello world");

})
const storage=multer.diskStorage({destination:function(req,file,cb){
cb(null,"public/images");

},
filename:function(req,file,cb){
cb(null,Date.now()+'_'+ file.originalname);

}
})

var upload=multer({storage:storage});
router.post("/register",upload.single("profpic"), async (req, res) => {
  console.log(req.file);
let profpic=req.file.filename;
console.log(req);
  const { name, email, phone, bloodgrp, gender, age,ldate, state, city, password, cpassword } = req.body;
  
  if (!name || !email || !phone || !bloodgrp || !gender || !ldate || !age  ||!state || !city || !password || !cpassword) {
   
    return res.status(422).json({ error: "plz fill all the deatils" });
  }
  if(password!==cpassword){
    return res.status(422).json({ error: "plz fill correct" });
  }
  try {
    const userExist = await User.findOne({ email: email })
    if (userExist) {
      return res.status(422).json({ error: "Email already registered" });
    }

    const user = new User({ name, email, phone, bloodgrp, gender, age,profpic,ldate, state, city, password, cpassword });
    await user.save();


    res.status(201).json({ message: "user registered successfully" });




  }
  catch (err) {
    console.log(err);
  }


});

//login route
router.post("/signin", async (req, res) => {
  try {
    console.log(req.body);
    let token;
    
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "plz filled the data" });

    }
    const userLogin = await User.findOne({ email: email });
    console.log(userLogin);
    if (userLogin) {
      const isMatch = await bcrypt.compare(password, userLogin.password);

      token = await userLogin.generateAuthToken();
      console.log(token);
      res.cookie("jwtoken", token, {
        expires: new Date(Date.now() + 25892000000),
         httpOnly:true
           
      })
       
      if (!isMatch) {
        res.status(400).json({ error: "Invalid credentials" });
      }
      else {
        res.json({ message: "user login successfully" });
      }
    }
    else {
      res.status(400).json({ error: "Invalid credentials" });

    }





  }
  catch (err) {
    console.log(err);

  }

});
router.get("/about",authenticate,(req,res)=>{
res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Methods",
             "GET,HEAD,OPTIONS,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers",
             "Origin,X-Requested-With,Content-Type,Accept,Authorization");
res.send(req.rootUser);

})
router.get("/searchpage",async (req,res)=>{
try{
const allUser=await User.find({});
res.send(allUser);
}catch(err){
  console.log(err);
}
  
  
  })
router.post("/searchpage",async(req,res)=>{
  try {
   
    const { state,city,bloodgrp } = req.body;
    
    
    const users=await User.find({state:state.toLowerCase()|| {$exists:true},city:city.toLowerCase() || {$exists:true},bloodgrp:bloodgrp.toUpperCase() || {$exists:true}});
    
   
    res.json(users);

  }catch(err){
    
   console.log(err);
   res.status(500).json({message:"internal server"});
  }


})
router.put("/update", upload.single('profpic'),async(req,res)=>{
  console.log(req.body);
 
console.log(req.params);
  const recordId = req.body._id;
  const newData = req.body;
  
  // If an image was uploaded, update the image field in the newData object
  if (req.file) {
    var path = require('path');
    newData.profpic = path.basename(req.file.path); // Assuming the file path is stored as the image field
  }

  
  if (!newData.name || !newData.email || !newData.phone || !newData.bloodgrp || !newData.gender || !newData.ldate || !newData.age  ||!newData.state || !newData.city || !newData.password || !newData.cpassword) {
   
    return res.status(422).json({ error: "plz fill all the deatils" });
  }
  if(newData.password!==newData.cpassword){
    return res.status(422).json({ error: "plz fill correct" });
  }
  try{
    if(newData.name!==null){
    newData.name=newData.name.toLowerCase();}
    if(newData.gender!==null){
    newData.gender=newData.gender.toLowerCase();}
    if(newData.state!==null){
    newData.state=newData.state.toLowerCase();}
    if(newData.city!==null){
    newData.city=newData.city.toLowerCase();}
    if(newData.bloodgrp!==null){
    newData.bloodgrp=newData.bloodgrp.toUpperCase();}
    if(newData.password!==null){
    newData.password= await bcrypt.hash(newData.password,5);}
    if(newData.cpassword!==null){
      newData.cpassword= await bcrypt.hash(newData.cpassword,5);}
      
    // newData.cpassword= await bcrypt.hash(newData.cpassword,5);
    User.findByIdAndUpdate(recordId, { $set: newData }, { new: true })
    .then((updatedRecord) => {
      if (updatedRecord) {
        res.json(updatedRecord);
      } else {
        res.status(404).json({ error: 'Record not found' });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal server error' });
    });

  }
  
catch(err){
  console.log(err);
  res.status(500).json({message:"internal server error occurred"});
}



})
router.put("/update2", upload.single('profpic'),async(req,res)=>{

  const recordId = req.body._id;
 
  const newData=req.body;
  if (req.file) {
    var path = require('path');
    newData.profpic = path.basename(req.file.path); // Assuming the file path is stored as the image field
  }
  try{
      
   
    
    User.findByIdAndUpdate(recordId, { $set: newData }, { new: true })
    .then((updatedRecord) => {
      if (updatedRecord) {
        res.json(updatedRecord);
      } else {
        res.status(404).json({ error: 'Record not found' });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal server error' });
    });

   
 }
  
  


  catch(err){
    res.status(500).json({message:"internal server error occurred"});
    
  }

})



router.get("/logout",authenticate,async (req,res)=>{
  console.log("hello my slogout");
   req.rootUser.tokens=req.rootUser.tokens.filter((curElem)=>{
    return curElem.token !== req.token
   })
    await req.rootUser.save();
  res.clearCookie("jwtoken",{path:"/"});
  
  res.status(200).send("User Logout");
  
  })

router.delete("/delete",async (req, res) =>{
  try{
    console.log(req.body.id);
  const documentId =req.body.id;
  const result = await User.deleteOne({ _id: documentId });
  console.log(result);
  if (result.deletedCount > 0) {
    res.send('Document deleted successfully.');
    

  } else {
    res.status(404).send('Document not found.');
  }
  }catch(err){
    console.error(err);
    res.status(500).send('Internal Server Error');

  }

})

module.exports = router;
