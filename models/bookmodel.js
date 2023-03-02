const mongoose=require("mongoose");

const bookinfo=new mongoose.Schema({
    image:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    isbn:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    describe:{
        type:String,
        required:true
    },
    publishdate:{
        type:String,
        required:true
    },
    publisher:{
        type:String,
        required:true
    }
})

const userbookinfo=new mongoose.Schema({
    books:[bookinfo],
    user:{
        type:String,
        required:true
    }
})

const userbook=mongoose.model("userbookInfo",userbookinfo)
module.exports=userbook;