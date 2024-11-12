const socket = io();

const currentBidElement = document.getElementById("currentBid");
const bidButton = document.getElementById("bidButton");

socket.on("updateBid", (bidAmount) => {
    currentBidElement.textContent = `$${bidAmount}`;
});

let userName = sessionStorage.getItem('userName');

if (!userName) {
    userName = prompt("Please enter your name to join the auction:");
    if (userName) {
        sessionStorage.setItem('userName', userName);
    } else {
        alert("A name is required to participate in the auction.");
        window.location.href = 'index.html';
    }
}

bidButton.addEventListener("click", () => {
    const userName = sessionStorage.getItem('userName') || "Anonymous";
    socket.emit("placeBid", { 
        auctionId: auctionId,
        userName: userName
    });
});


socket.on("bidSuccess", (newBid) => {
    alert("Bid placed successfully!");
    currentBidElement.textContent = `$${newBid}`;
});

socket.on("bidError", (message) => {
    alert(`Error: ${message}`);
});
