import mongoose from 'mongoose';
import {DB_NAME} from './constants';




/*
import express from 'express'
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