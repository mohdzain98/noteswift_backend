const express = require('express')
const router = express.Router();
const User = require('../models/User')
const {body, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchuser')


const JWT_SECRET = 'welcometonoteswift'

//create a user using : POST "/api/auth" doesn't require auth
router.post('/createuser',[
    body('name','Enter a Valid name').isLength({min:3}),
    body('email','Enter a Valid Email').isEmail(),
    body('password','Enter a Valid Password').isLength({ min: 5 }),
], async (req,res)=>{
    let success = false;
    //if there are error return bad request
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    // check email already exist
    try{
        let user = await User.findOne({"email": req.body.email})
        if(user){
            return res.status(400).json({success, error:"Email Already Exist"})
        }
        //If email is unique create user 
        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(req.body.password,salt)
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password:secPass,
        })
        const data={
            user:{
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)
        success = true;
        res.json({success, authToken})
    }catch(err){
        console.error(err.message)
        res.status(500).send("Some Error Occured")
    }
})

router.post('/login',[
    body('email','Enter a Valid Email').isEmail(),
    body('password','Password cannot be Blank').exists(),
],async (req,res) => {
    let success = false;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success, errors:errors.array()})
    }

    const {email, password} = req.body
    try{
        let user = await User.findOne({email})
        if(!user){
            return res.status(400).json({success, errors:'Wrong Credentials'})
        }
        const passwordCompare = await bcrypt.compare(password, user.password)
        if(!passwordCompare){
            return res.status(400).json({success, errors:'Wrong Credentials'})
        }
        const data={
            user:{
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)
        success = true
        res.json({success, authToken})
    }catch(error){
        console.error(error)
        res.status(500).send("Internal server occured")
    }
})

//Route 3 : Get loggedin user detail : POST "/api/auth/getuser"
router.post('/getuser',fetchuser, async (req,res) => {
    try{
        const userId =req.user.id
        const user = await User.findById(userId).select("-password")
        res.send(user)
    }catch(error){
        console.error(error)
        res.status(500).send('internal server error')
    }
})


module.exports = router