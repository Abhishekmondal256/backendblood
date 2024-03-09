const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
dotenv.config({ path: "./config.env" });
require("./db/conn");
// const User=require("./model/userSchema");
app.use(express.json());
app.use(require("./router/auth"));


app.use('/public', express.static('public'));

// app.get('/about',(req,res)=>{
//     res.send("hello world about");

//     })

app.get('/signin', (req, res) => {
    res.send("hello world signin");

})
app.get('/signup', (req, res) => {
    res.send("hello world signup");

})
app.listen(5000, () => {
    console.log(`server running on port 5000`);
})