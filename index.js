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

get_data() // result -> sunil which is correct data

async function set_data(){
    await client.set('user:4','hey from node_server')
    await client.expire('user:4',10) // this things set a create time for caching data
    const result = await client.get('user:4')
    console.log(`result -> ${result}`)
}

set_data()

app.listen(PORT,() => {
    console.log(`listening on port ${PORT}`)
})