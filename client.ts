import express, { Application, Request, Response, NextFunction, application } from "express"
import mongoose,{Schema} from "mongoose"
import * as amqps from 'amqplib'

const port: number = 6090

const app: Application = express()
app.use(express.json())

//setting up the rabbit mq connections
let channel: any, connection: any;


const connectQueue = async () => {
    try
    { 
        connection = await amqps.connect(`amqp://localhost:5672`)
        channel = await connection.createChannel()

        await channel.assertQueue("blogPost")

        channel.consume("blogPost", (data) => {
            console.log(`${Buffer.from(data.content)}`)
            channel.ack(data)
        })
        
    } catch (error)
    {
        throw error
    }
}

connectQueue()

app.listen(port, () => {
   console.log(`Server listening on `)
})