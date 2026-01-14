import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js'

dotenv.config();

connectDB()
.then( () => {
    const port = process.env.PORT || 8000 ;
    app.listen(port , () => {
        console.log(`Server started at port ${port}`);
    })
})
.catch( (error) => {
    console.log("Mongo DB connection error",error) ;
    
});



/*
import express from 'express';
const app = express();

;( async () => {import dotenv from 'dotenv';
import connectDB from './db/index.js';

dotenv.config({
    path: './env'
})

connectDB();


    try {
        await mongooseconnect(`${process.env.
            MONGODB_URL}/${DB_NAME}`);
        app.on("error",(error) => {
            console.log("ERROR",error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.LOG(`App is listening on port 
                ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("Error: ",error)
        throw error
    }
}) ()
*/
