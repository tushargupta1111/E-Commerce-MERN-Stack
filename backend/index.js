const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

app.use(express.json());    //request we will get from response that will be automatically passed through JSON
app.use(cors());    //reactjs project will connect to express app on port 4000

//Database Connection With Mongose(mongoose DB atlas database):-xJJfkYMbT7YjBDM
mongoose.connect("mongodb+srv://Tushargupta:xJJfkYMbT7YjBDM@cluster0.hmmggx0.mongodb.net/e-commerce")
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

//API Creation
app.get("/",(req,res)=>{
    res.send("Express App is Running")
})

// Image Storage Engine 

const storage = multer.diskStorage({
    destination: './upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload =multer({storage:storage})

// Creating Upload Endpoint for Images
app.use('/images',express.static('upload/images'))

app.post('/upload',upload.single("product"),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

// Schema for creating Products
const Product = mongoose.model("Product",{
    id:{
        type:Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true, 
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    avilable:{
        type:Boolean,
        default:true,
    },
});

app.post('/addproduct',async (req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length>0)
    {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }
    else
    {
        id=1;
    }
    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    }); 
    console.log(product);
    await product.save();
    console.log("Saved");
    // Generate a response for saved in Database
    res.json({
        success:true,
        name:req.body.name,
        message:"Product added to database"
    })
})

// Creating API For Deleting product
app.post('/removeproduct',async(req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("removed");
    res.json({
        success:true,
        name:req.body.name,
        message:"Product removed from database"
    })
})

//Creating API for Getting all products
app.get('/allproducts', async (req, res) =>{
        let products = await Product.find({});
        console.log("All Product Fetched");
        res.send(products);
})

//schema creating API for users model
const Users =mongoose.model('User',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

//Creating Endpoints for registering the user
app.post('/signup',async (req,res)=>{
    
    let check = await Users.findOne({email:req.body.email}).exec();
    if(check)
    {return res.status(400).json({success:false,errors:"existing user found with same email address."})}
    let cart = {};
    for(let i=0;i<150;i++)
    {
        cart[i]=0;
    }
    const user =new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })
    await user.save();
    //creating a token that is generate through the signup 
    const data = {user:{id:user.id}}
    //generating token through jwt.sign method
    const token =jwt.sign(data,'secret_ecom');
    res.json({success:true,token})
})

//creating Endpoint API to login the user
app.post('/login',async (req,res)=>{
    let user =await Users.findOne({email:req.body.email}).exec();
    if(user) {
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data = {user:{id:user.id}}
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            return res.status(400).json({success:false,errors:"Wrong Password"});
        }
    }
    else
    {
        return res.status(400).json({success:false,errors:"Wrong Email Id"});
    }
})

// Creating endpoint for newcollection data API
const _ = require('lodash');

app.get('/newcollection', async (req, res) => {
    let products = await Product.find({});
    let newcollection = _.shuffle(products).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newcollection);
})

// Creating endpoint for popular in women section
app.get('/popularinwomen', async (req, res) => {
    let products = await Product.find({category:"women"});
    let popularinwomen = _.shuffle(products).slice(-4);
    console.log("Popular In Women Fetched");
    res.send(popularinwomen);
})

// Creating middleware to fetch user
const verifyUser = async (req,res,next)=>{
    const token =req.header('auth-token');
    if(!token){
        res.status(401).send({errors:"please authenticate using valid token"});
    }
        try{
            const data = jwt.verify(token,'secret_ecom');
            req.user = data.user;
            next();
        } catch(error){
            res.status(401).send({errors:"please authenticate a valid token"});
        }
    };

// Creating endpoint for adding product in cartdata
app.post('/addtocart',verifyUser,async (req,res)=>{
    console.log("added",req.body.itemId,req.user);

    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added");
})

// Creating endpoint for remove product in cartdata
app.post('/removefromcart',verifyUser,async (req,res)=>{
    console.log("removed",req.body.itemId,req.user);

    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Removed");
})

//creating endpoints to get cartdata
app.post('/getcart',verifyUser,async (req,res)=>{
    console.log("GetCart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})                       

//Creating Payment Api
app.post('/payment',async (req,res)=>{
    
})

app.listen(port,(error)=>{
    if(!error)
    {console.log("Server is running at Port " +port)}
    else
    {console.log("Error : "+error)}
})