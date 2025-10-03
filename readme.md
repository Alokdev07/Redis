# Redis with Node.js - Complete Guide

A comprehensive guide to using Redis with Node.js, covering all major Redis data structures, caching strategies, and pub/sub messaging.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Redis Clients](#redis-clients)
- [Data Structures](#data-structures)
- [Caching Strategy](#caching-strategy)
- [Pub/Sub Messaging](#pubsub-messaging)
- [API Endpoints](#api-endpoints)
- [Running the Application](#running-the-application)
- [Best Practices](#best-practices)

## 🎯 Overview

This project demonstrates various Redis operations using Node.js with Express. It showcases:

- Multiple Redis client implementations (node-redis and ioredis)
- All major Redis data structures (Strings, Lists, Sets, Hashes, Streams)
- API response caching with TTL
- Redis Streams for event logging
- Pub/Sub messaging pattern

## 📦 Prerequisites

- Node.js (v14 or higher)
- Redis Server (v6 or higher)
- npm or yarn package manager

## 🚀 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install express redis ioredis axios
```

3. Start Redis server:
```bash
redis-server
```

4. Start the application:
```bash
npm start
```

## 🔧 Redis Clients

This project uses two popular Redis clients:

### node-redis (createClient)
```javascript
import { createClient } from 'redis';
const client = createClient();
await client.connect();
```

### ioredis
```javascript
import Redis from 'ioredis';
const client = new Redis();
```

**Key Differences:**
- **ioredis**: Auto-connects, supports clustering, built-in Promise support
- **node-redis**: Requires explicit connection, official Redis client

## 📊 Data Structures

### 1. Strings (Key-Value)

Basic get/set operations with optional expiration:

```javascript
// Set value with 10 second expiration
await client.set('user:4', 'hey from node_server');
await client.expire('user:4', 10);

// Get value
const result = await client.get('user:3');
```

**Use Cases:** Session storage, simple caching, counters

### 2. Lists (Ordered Collections)

FIFO/LIFO operations with lists:

```javascript
// Push elements
await client.lpush('messages', 1);
await client.lpush('messages', 2);

// Pop elements
const first = await client.rpop('messages');      // Non-blocking
const second = await client.blpop('messages', 5); // Blocking with timeout

// Get range
const range = await client.lrange('messages', 1, 3);

// Get length
const length = await client.llen('messages');
```

**Use Cases:** Message queues, activity feeds, task lists

### 3. Sets (Unique Collections)

Unordered collections with set operations:

```javascript
// Add elements (duplicates ignored)
await client.sadd('ip', 1);
await client.sadd('ip', 2);

// Get cardinality
const length = await client.scard('ip');

// Pop random element
const element = await client.spop('ip');

// Set operations
const union = await client.sunion('ip', 'another_ip');
const intersection = await client.sinter('ip', 'another_ip');
```

**Use Cases:** Unique visitors, tags, relationships

### 4. Hashes (Object Storage)

Store objects as field-value pairs:

```javascript
// Set multiple fields
await client.hmset('user', {
    'name': 'alok',
    'age': '22'
});

// Get single field
const name = await client.hget('user', 'name');

// Get all fields
const allFields = await client.hgetall('user');
```

**Use Cases:** User profiles, product details, configuration

### 5. Streams (Event Logs)

Append-only logs with consumer groups:

```javascript
// Add entry
await client.xAdd('temperature:bhadrak', '*', {
    'chandbali': 'hot',
    'tihidi': 'cold'
});

// Read entries
const entries = await client.xRead({
    key: 'temperature:bhadrak',
    id: '0'  // Read from beginning, use '0' or specific ID
}, {
    COUNT: 100,
    BLOCK: 300  // Block for 300ms if no data
});
```

**Use Cases:** Event sourcing, activity logs, time-series data

## 💾 Caching Strategy

### API Response Caching

The `/get-todo` endpoint demonstrates a cache-aside pattern:

```javascript
app.get('/get-todo', async (req, res) => {
    // 1. Check cache first
    const cached = await client.get('cache');
    if (cached) {
        return res.json(JSON.parse(cached));
    }

    // 2. Fetch from API if cache miss
    const response = await axios.get('https://jsonplaceholder.typicode.com/todos');

    // 3. Store in cache with TTL
    await client.set('cache', JSON.stringify(response.data), {
        EX: 30  // Expires in 30 seconds
    });

    return res.json(response.data);
});
```

**Benefits:**
- Reduces API calls and latency
- Automatic cache invalidation with TTL
- Improves application performance

## 📡 Pub/Sub Messaging

Redis Pub/Sub enables real-time messaging between components:

### Publisher

```javascript
import Redis from 'ioredis';

const publisher = new Redis();

// Publish message to channel
await publisher.publish('notifications', JSON.stringify({
    type: 'email',
    message: 'New user registered'
}));
```

### Subscriber

```javascript
import Redis from 'ioredis';

const subscriber = new Redis();

// Subscribe to channel
await subscriber.subscribe('notifications', (err, count) => {
    if (err) {
        console.error('Failed to subscribe:', err);
    } else {
        console.log(`Subscribed to ${count} channel(s)`);
    }
});

// Handle incoming messages
subscriber.on('message', (channel, message) => {
    console.log(`Received from ${channel}:`, message);
    const data = JSON.parse(message);
    // Process the message
});
```

### Pattern Subscription

```javascript
// Subscribe to multiple channels matching pattern
await subscriber.psubscribe('user:*', 'order:*');

subscriber.on('pmessage', (pattern, channel, message) => {
    console.log(`Pattern ${pattern}, Channel ${channel}:`, message);
});
```

**Use Cases:**
- Real-time notifications
- Microservice communication
- Live updates and broadcasts
- Chat applications

## 🔌 API Endpoints

### GET `/`
Returns a simple "hello world" message.

### GET `/get-todo`
Fetches todos from JSONPlaceholder API with caching:
- First request: Fetches from API and caches for 30 seconds
- Subsequent requests: Returns cached data
- After 30 seconds: Cache expires, fetches fresh data

**Response:**
```json
[
    {
        "userId": 1,
        "id": 1,
        "title": "delectus aut autem",
        "completed": false
    },
    ...
]
```

## 🏃 Running the Application

1. Ensure Redis is running:
```bash
redis-server
```

2. Start the Node.js server:
```bash
node app.js
```

3. Test the endpoints:
```bash
# Basic endpoint
curl http://localhost:8000/

# Cached todos endpoint
curl http://localhost:8000/get-todo
```

## ✨ Best Practices

### 1. Connection Management
- Connect Redis client once at startup
- Handle connection errors gracefully
- Close connections on application shutdown

### 2. Error Handling
```javascript
client.on('error', (err) => {
    console.error('Redis Client Error', err);
});
```

### 3. Key Naming Conventions
Use descriptive, hierarchical names:
- `user:1001:profile`
- `session:abc123`
- `cache:todos:all`

### 4. TTL Strategy
Always set expiration for cached data:
```javascript
await client.set('key', 'value', { EX: 3600 }); // 1 hour
```

### 5. Data Serialization
Serialize complex objects before storing:
```javascript
await client.set('user', JSON.stringify(userData));
const data = JSON.parse(await client.get('user'));
```

### 6. Monitoring
Monitor Redis performance:
```bash
redis-cli INFO
redis-cli MONITOR
```

## 📚 Additional Resources

- [Redis Official Documentation](https://redis.io/docs/)
- [node-redis Documentation](https://github.com/redis/node-redis)
- [ioredis Documentation](https://github.com/luin/ioredis)
- [Redis Commands Reference](https://redis.io/commands/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

---

**Note:** This is a learning project demonstrating Redis capabilities. For production use, consider additional security measures, connection pooling, and proper error handling