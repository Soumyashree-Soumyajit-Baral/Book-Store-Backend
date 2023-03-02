require("dotenv").config()
const express=require("express")
const mongoose=require("mongoose")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const cors=require("cors")
const {existUser, genPassHash}=require("./utility/utility")
const userModel=require("./models/usermodel")
const bookModel =require("./models/bookmodel")
const DATABASE= process.env.DATABASE
// const express=require("express")

const app=express()
const unProtectedRoutes=["/signup","/login"]
app.use(express.json({limit:"100mb"}))
app.use(express.urlencoded({extended:false}))
app.use(cors())
app.use((req,res,next)=>{
    if(unProtectedRoutes.includes(req.url)){
        next()
    }else{
        if(req.headers.authorization){
            jwt.verify(req.headers.authorization, process.env.SECRET_KEY, (err,uname)=>{
                if(err){
                    return res.sendStatus(403)
                }
                req.uname=uname
                next();
            })
        }else{
            res.send("Authorization required")
        }
    }
})

const port=process.env.PORT || 3001
app.listen(port,(err)=>{
    if(!err){
      console.log(`server is connected to port ${port}`)
    }else{
      console.log(err);
    }
  });

mongoose.connect(`${DATABASE}`,()=>{
    console.log('connected to db');
    // console.log(DATABASE)
  },(err)=>{
    console.log(err);
  })

// mongoose.connect("mongodb://localhost/bookmark",()=>{
//     console.log("connected to db")
// },(err)=>{
//     console.log(err)
// })


app.post("/signup",async(req,res)=>{
    if(await existUser(req.body.username)){
        res.status(400).send("User already present.")
    }else{
        genPassHash(req.body.password).then((passwordHash)=>{
            userModel.create({
                username:req.body.username,
                password:passwordHash
            }).then(()=>{
                res.status(200).send("user added sucessfully")
            }).catch((err)=>{
                res.status(400).send(err.message)
            })
        })
    }
})

app.post("/login",(req,res)=>{
    userModel.find({username:req.body.username}).then((udata)=>{
        if(udata.length){
            bcrypt.compare(req.body.password,udata[0].password).then((val)=>{
                if(val){
                    const authToken=jwt.sign(udata[0].username, process.env.SECRET_KEY);
                    res.status(200).send({authToken})
                }else{
                    res.status(400).send("invalid password")
                }
            })
        }else{
            res.status(400).send("Create an account before login")
        }
    })
})

app.get("/books", async (req, res) => {
    try {
      const user = req.uname;
      const data = await bookModel.find({ user });
    //   console.log(data)
      const booksdata = data.map((d) => d.books);
    //   console.log(booksdata)
    //   console.log(...booksdata)
      res.status(200).send(...booksdata);
    } catch {
      res.status(400).send("An error occured while getting data");
    }
  });

app.post("/books",async(req,res)=>{
    const user = req.uname;
    const data=req.body
    const isUser=await bookModel.find({user:user});
    if(isUser.length){
        const bookdata=isUser.map((d)=>d.books)
        const oldData=bookdata[0]
        const newData=[...oldData, data]
        bookModel.updateOne({user:user}, {books:newData}).then(()=>{
            res.status(200).send("added sucessfully")
        }).catch((err)=>{
            res.send(err.message)
        })
    }else{
        bookModel.create({
            user:user,
            books:data
        }).then(()=>{
            res.status(200).send("book added sucessfully")
        })
    }
})

app.delete("/delete", async (req, res) => {
    try {
      const deleteitems = req.body.deleteitems;
      const user = req.uname;
      const deleted = await bookModel.updateOne(
        { user: user },
        { $pull: { books: { _id: { $in: deleteitems } } } }
      );
      if (deleted.modifiedCount) {
        console.log("done")
        res.status(200).send("Contacts Deleted Successfully");
      } else {
        res.status(200).send("There is no contacts to delete");
      }
    } catch {
      res.status(400).send("An error occured while deleting");
    }
  });

app.put("/edit/:id",(req,res)=>{
    const bookID=req.params.id
    console.log(bookID)
    bookModel.updateOne(
        {
            "books._id":bookID
        },
        {
            $set:{
                "books.$.image":req.body.image,
                "books.$.title":req.body.title,
                "books.$.isbn":req.body.isbn,
                "books.$.author":req.body.author,
                "books.$.describe":req.body.describe,
                "books.$.publishdate":req.body.publishdate,
                "books.$.publisher":req.body.publisher
            }
        }).then(()=>{
            res.status(200).send("Book updated sucessfully")
        }).catch((err)=>{
            res.status(400).send(err.message)
        })
})

app.get("/uname", (req,res)=>{
    const userName= req.uname;
    res.status(200).send(userName)
})