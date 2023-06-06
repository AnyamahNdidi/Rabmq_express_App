import express, { Application, Request, Response, NextFunction, application } from "express"
import mongoose,{Schema} from "mongoose"
import * as amqps from 'amqplib'


mongoose.connect('mongodb://127.0.0.1/mydatablog')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });


const port:number = 3020

const app: Application = express()
app.use(express.json())

interface iBlog extends mongoose.Document{
    title: string;
    decs: string;
  createdAt: Date;
}

const blogSchema:Schema = new mongoose.Schema({
    title: {
          type: String
    },
    decs: {
        type: String
    },
    createdAt: { type: Date, default: Date.now }

},
     {
    timestamps:true,
    }
)


const blogModel:any = mongoose.model<iBlog>("blogs", blogSchema)


app.get('/', (req: Request, res: Response) => {
    
    res.status(201).json({
        message:"api is ready to use"
    })
})

//setting up the rabbit mq connections
let channel: any, connection: any;

const connectionQueue = async () => {
    try
    {
        connection = await amqps.connect(`amqp://localhost:5672`)
        channel = await connection.createChannel()
        await channel.assertQueue("blogPost")
        console.log("conection has been made")
    } catch (error)
    {
        console.log("hbjkn",error.message)
    }
}

connectionQueue()

//function that send send data to the queue

const sendDataNoti = async (data) => {
    await channel.sendToQueue("blogPost", Buffer.from(JSON.stringify(data)))
    console.log(`message sent : ${data}`)
    // await channel.close()
    // await connection.close()

    
}


app.post('/createblog', async (req: Request, res: Response) => {
    try
    {
        const blogData = await blogModel.create(req.body)
        sendDataNoti(blogData)
          return res.status(201).json({
				message: "blog has been successfully created",
				data: blogData,
			});
        
    } catch (error)
    {
          return res.status(404).json({
				message: error.message,
			});
    }
})

app.listen(port, () => {
    console.log(`port is running ${port} `)
})