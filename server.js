const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'madhav',
    database: 'auction_platform',
});

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Front', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'Front')));

app.use('/public', express.static(path.join(__dirname, 'public')));

const BID_INCREMENT = 10000;

app.post('/place-bid', async (req, res) => {
    const { auctionId, userName } = req.body;

    try {
        const { rows } = await pool.query(
            'SELECT current_highest_bid FROM auctions WHERE auction_id = $1',
            [auctionId]
        );

        if (rows.length === 0) {
            return res.status(400).send('Auction not found');
        }

        const currentHighestBid = rows[0].current_highest_bid;
        const newBidAmount = currentHighestBid + BID_INCREMENT;

        await pool.query(
            'UPDATE auctions SET current_highest_bid = $1 WHERE auction_id = $2',
            [newBidAmount, auctionId]
        );

        await pool.query(
            'INSERT INTO bids (auction_id, user_name, bid_amount) VALUES ($1, $2, $3)',
            [auctionId, userName, newBidAmount]
        );

        io.emit('newBid', { auctionId, userName, bidAmount: newBidAmount });

        res.status(200).send('Bid placed successfully');
    } catch (err) {
        console.error('Error placing bid:', err.message);
        res.status(500).send('An error occurred while placing the bid');
    }
});

app.get('/current-bid', async (req, res) => {
    const { auctionId } = req.query;

    try {
        const { rows } = await pool.query(
            'SELECT current_highest_bid FROM auctions WHERE auction_id = $1',
            [auctionId]
        );

        if (rows.length === 0) {
            return res.status(400).send('Auction not found');
        }

        res.json({ currentHighestBid: rows[0].current_highest_bid });
    } catch (err) {
        console.error('Error retrieving current bid:', err.message);
        res.status(500).send('Error retrieving current bid');
    }
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("placeBid", async (data) => {
        const { auctionId, userName } = data;

        try {
            const { rows } = await pool.query(
                'SELECT current_highest_bid FROM auctions WHERE auction_id = $1',
                [auctionId]
            );

            if (rows.length === 0) {
                socket.emit("bidError", "Auction not found");
                return;
            }

            const currentHighestBid = rows[0].current_highest_bid;
            const newBidAmount = currentHighestBid + BID_INCREMENT;

            await pool.query(
                'UPDATE auctions SET current_highest_bid = $1 WHERE auction_id = $2',
                [newBidAmount, auctionId]
            );

            await pool.query(
                'INSERT INTO bids (auction_id, user_name, bid_amount) VALUES ($1, $2, $3)',
                [auctionId, userName, newBidAmount]
            );

            io.emit("updateBid", newBidAmount);
            socket.emit("bidSuccess", newBidAmount);

        } catch (err) {
            console.error("Error placing bid:", err.message);
            socket.emit("bidError", "An error occurred while placing the bid");
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

app.get('/api/bidding-history/:auctionId', async (req, res) => {
    const auctionId = req.params.auctionId;
    try {
        const result = await pool.query(
            'SELECT user_name, bid_amount, bid_time FROM bids WHERE auction_id = $1 ORDER BY bid_time DESC',
            [auctionId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching bidding history:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
