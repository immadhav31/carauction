const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("Connected to the server");

    // Request to place a bid by only providing auctionId and userName
    socket.emit("placeBid", {
        auctionId: 1,    // Replace with the actual auction ID
        userName: "jo"   // Replace with the user name
    });
});

// Listen for new highest bid notification
socket.on("newBid", (data) => {
    console.log("New highest bid placed:", data);
});

// Listen for error messages
socket.on("error", (errorMessage) => {
    console.log("Error:", errorMessage);
});

socket.on("disconnect", () => {
    console.log("Disconnected from the server");
});
