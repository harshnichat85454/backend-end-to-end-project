import dotenv from 'dotenv';
import connectDB from './db/index.js';

dotenv.config();

connectDB();



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
