import express from 'express'
import Redis from 'ioredis'

const app = express()
const PORT = process.env.PORT || 8000
app.use(express.json())

const client = new Redis()


app.get('/',(req,res) => {
    res.send('hello world')
})

async function get_data(){
    const result = await client.get('user:3')
    console.log(`result -> ${result}`)
} // this function is to get the data from the redis server

// get_data() // result -> sunil which is correct data

async function set_data(){
    await client.set('user:4','hey from node_server')
    await client.expire('user:4',10) // this things set a create time for caching data
    const result = await client.get('user:4')
    console.log(`result -> ${result}`)
}

// set_data()

async function list() {
    await client.lpush('messages', 1)
    await client.lpush('messages', 2)
    await client.lpush('messages', 3)
    await client.lpush('messages', 4)

    // get length properly
    const length = await client.llen('messages') // this is how we get the data length in a list

    for (let i = 0; i < length; i++) {
        let first_result = await client.rpop('messages')
        let second_result = await client.blpop('messages',5)
        console.log(first_result,second_result)
    } // this is how we get the data in stack or queue fashion

    let third_result = await client.lrange("messages", 1, 3)
    console.log(third_result) // this is how we get the range in between in a list
}

// list()

app.listen(PORT,() => {
    console.log(`listening on port ${PORT}`)
})