import express from 'express'
import db from './db/index.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();

db()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server connect on port ${process.env.PORT}`);
        
    })
})
.catch((error)=>{
    console.log("error", error);
    
})

//routes import
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/user", userRouter)
















/*
import express from 'express'
const app = express()
( async ()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI} / ${DB_NAME}`)
       app.on("error",(error)=>{
        console.log(error);
        throw error
        
       })

       app.listen( process.env.PORT, ()=>{
        console.log(`app listening in port ${process.env.PORT}`);
        
       })

    } catch (error) {
        console.log("error",  error);
        
    }
})()

*/