import express, {json} from 'express'
import Redis from 'ioredis'
import {createClient} from 'redis'

const app = express()
const PORT = process.env.PORT || 8000
app.use(express.json())

const client = new Redis()
const new_client = createClient()



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

async function add_set(){
    await client.sadd('ip',1)
    await client.sadd('ip',2)
    await client.sadd('ip',3) // to add the element in set

    const length = await client.scard('ip')
    console.log(`The length of the set is ${length}`)

    for (let i = 0; i < length; i++) {
        const element = await client.spop('ip')
        console.log(`element of the set ${element}`)
    }

    await client.sadd('another_ip',3)
    await client.sadd('another_ip',4)
    await client.sadd('another_ip',5)

    const union = await client.sunion('ip','another_ip')
    console.log(union)
    const intersection = await client.sinter('ip','another_ip')
    console.log(intersection)
} // this is the method of set and we use this in this type

// add_set()

async function hash_map() {
    await client.hmset('user',{
        'name' : 'alok',
        'age' : '22'
    })

    const result = await client.hget('user', 'name')
    const all_result = await client.hgetall('user')
    console.log(`username is ${result} all result are ${JSON.stringify(all_result)}`)
} // this is how we interact with hashmap there is various method available

// hash_map()

async function redis_streams() {
    await new_client.connect();

    // const first_response = new_client.xAdd('temperature:bhadrak','*',{
    //     'chandbali' : 'hot',
    //     'tihidi' : 'cold'
    // })

    const read_data = await new_client.xRead({
        key: 'temperature:bhadrak',
        id: '1759472934548-0'
    }, {
        COUNT: 100,
        BLOCK: 300
    });

    console.log(JSON.stringify(read_data)); // will print Stream ID like "1727954695300-0"
}
redis_streams()


app.listen(PORT,() => {
    console.log(`listening on port ${PORT}`)
})