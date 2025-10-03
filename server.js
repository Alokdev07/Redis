import express from "express";
import { createClient } from "redis";
import axios from "axios";

const app = express();
const client = createClient();

const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Redis client once at startup
client.connect()
    .then(() => console.log("Redis connected"))
    .catch(err => console.error("Redis connection error:", err));

app.get('/get-todo', async (req, res) => {
    try {
        // Check cache
        const cache_value = await client.get('cache');
        if (cache_value) {
            console.log("Returning from cache");
            return res.json(JSON.parse(cache_value));
        }

        // Fetch from API
        const response = await axios.get('https://jsonplaceholder.typicode.com/todos');

        // Store in cache
        await client.set('cache', JSON.stringify(response.data), {
            EX: 30 // set expiry 30 sec in one go
        });

        console.log("Returning from API");
        return res.json(response.data);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
