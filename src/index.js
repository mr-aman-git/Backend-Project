
import db from './db/index.js';

import dotenv from 'dotenv';

dotenv.config();


db();















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