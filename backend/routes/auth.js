const express = require('express')
const router = express.Router()
const User = require('../models/User.js')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
const JWT_SECRET = "qwertyuiop"
var fetchuser = require('../middleware/fetchuser.js')

// Create a user using POST (Route 1)
router.post('/createuser',[
    body("name",'Enter a valid Name').isLength({min:3}),
    body("email",'Enter a valid email').isEmail(),
    body("password",'Password must be atleast 5 characters').isLength({min:5}),
], async(req,res)=>{

    let success = false;
    // return error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }

    try{

    
        let user = await User.findOne({email:req.body.email});
        if(user){
            return res.status(400).json({success, error:"This email exists"})
        }
        
        const salt = await bcrypt.genSalt(10);
        const secpass = await bcrypt.hash(req.body.password,salt)
        user = await User.create({
            name : req.body.name,
            email : req.body.email,
            password : secpass
        })
        
        const data = {
            user : {id : user.id}
        }
        const authtoken = jwt.sign(data,JWT_SECRET)
        success = true;
        res.json({success,authtoken})
        
    }
    catch(error){
        console.error(error.message)
        res.status(500).send("Internal error")
    }
    
})

// Route 2
router.post('/login',[
    body("email",'Enter a valid email').isEmail(),
    body("password",'Please enter a password').exists(),
], async(req,res)=>{

    let success = false;
    // return error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const{email,password} = req.body;

    try{

        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success, error:"Please login with correct credentials"})
        }
        
        const comparepass = await bcrypt.compare(password,user.password)
        if(!comparepass){
            return res.status(400).json({success, error:"Please login with correct credentials"})
        }
        
        const data = {
            user : {id : user.id}
        }
        const authtoken = jwt.sign(data,JWT_SECRET)
        success = true;
        res.json({success, authtoken})

    }
    catch(error){
        console.error(error.message)
        res.status(500).send("Internal Error")
    }
})

// Route 3
router.post('/getuser', fetchuser, async(req,res)=>{

    try{
        userid = req.user.id;
        const user = await User.findById(userid).select("-password");
        res.send(user);
    }
    catch(error){
        console.error(error.message)
        res.status(500).send("Internal Error")
    }

})

module.exports = router