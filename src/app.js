const express = require("express");
const connectDB = require("./config/database")
const User = require("./models/user");
const user = require("./models/user");
const app = express();
const {validateSignUpData} = require("./utils/validation")
const bcrypt = require('bcrypt');

app.use(express.json());

app.get("/user", async (req,res)=>{
    const userId = req.body._id;
   
  try{ 
    const users = await User.findById(userId);
    res.send(users)} 
  
  catch(err){
    res.status(400).send("something went wrong")
  }
  
})

app.patch("/user/:userId", async (req,res)=>{
    const userId = req.params?.userId;
    const data = req.body;

try{
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender","age", "skills"];
    const isUpdateAllowed = Object.keys(data).every((k)=>
    ALLOWED_UPDATES.includes(k));
    if(!isUpdateAllowed){
        throw new Error("Update is not allowed");
    }
    if(data?.skills.length >10){
        throw new Error("Not more than 10");
    }

    await User.findByIdAndUpdate({_id:userId},data, {
        returnDocument: "after", 
        runValidators: true
    });
    res.send("Updated sucessful")
}
catch(err){
    res.status(400).send("something went wrong")
  }
 
})

app.delete("/user", async(req,res) =>{
    const userId = req.body.userId;
    try{
        const user = await User.findByIdAndDelete(userId);
        res.send("user Deleted Sucessfull")
    }
    catch(err){
        res.status(400).send("UNABLE TO DELETE")
    }
})

app.post("/signup", async(req, res)=>{
    // const userObj = {
    //     firstName: "Uma",
    //     lastName: "Pratap",
    //     emailId: "uma@gmail.com",
    //     password:"uma123",
    //     gender: "Female"
    // }

    try{ 
        validateSignUpData(req);
        const {firstName, lastName, emailId, password} = req.body;

        //encrypt password
        const passwordHash = await bcrypt.hash(password, 10);
         
        const user = new User({firstName, lastName, emailId, password: passwordHash});
        await user.save();    
        res.send("User created sucessfully");
    } catch(err){
        res.status(400).send("Error: "+ err.message);
     }   
   
})
 
app.post("/login", async(req, res) =>{
    try{
        const {emailId, password} = req.body;
        const user = await User.findOne({emailId: emailId});

        if(!user){
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(isPasswordValid){
            res.send("Login Sucessful!!!");
        }
        else{
            throw new Error("Invalid credentials");
        }
        
    }catch(err){
            res.status(400).send("Error :" +err.message);
    }
})
connectDB()
.then(() =>{
    console.log("DB Connection is established")
    app.listen(3000, () =>{
        console.log("Server is successfully listen")
    });
})
.catch((err)=>{
    console.log("DB can't established")
})



 