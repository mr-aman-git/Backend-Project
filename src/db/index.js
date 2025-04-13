import mongoose from 'mongoose';
import DB_NAME from '../constants.js'


const db= async()=>{
    try {
        const dbConnect= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`DATABASE HOST ${dbConnect.connection.host}`);
       
        
        
    } catch (error) {
        console.log(error);
        process.exit(1);
        
    }
}

export default db