const mongoose=require("mongoose");

const userinfo=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})
const user=mongoose.model("userInfo",userinfo)
module.exports=user;