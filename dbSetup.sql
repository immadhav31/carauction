CREATE TABLE IF NOT EXISTS auctions (
    auction_id SERIAL PRIMARY KEY,
    car_name VARCHAR(100) NOT NULL,
    start_price NUMERIC(10, 2) NOT NULL,
    current_highest_bid NUMERIC(10, 2) DEFAULT 0,
    end_time TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS bids (
    bid_id SERIAL PRIMARY KEY,
    auction_id INTEGER REFERENCES auctions(auction_id) ON DELETE CASCADE,
    user_name VARCHAR(50) NOT NULL,
    bid_amount NUMERIC(10, 2) NOT NULL,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
