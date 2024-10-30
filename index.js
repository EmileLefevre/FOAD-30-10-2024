const express = require("express");
const http = require("http");
const app = express();
const server = http.Server(app);
const io = require("socket.io")(server);
const ip = "127.0.0.1"
const port = 4242;
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile("index.html", { root: __dirname });
})

const users = [];
const publicMessages = [];
const privateMessage = [];

io.on("connection", (socket) => {
    socket.emit("init", { message: "bienvenue" });
    socket.on("sendLog", (data) => {
        data.id = socket.id
        users.push(data);
    })
    socket.on("publicMessage", (data) => {
        data.id = socket.id;
        publicMessages.push(data)
        socket.broadcast.emit("publicMessageGlobal", data);
    })
    socket.on("privateMessage", (data) => {
        privateMessage.push(data)
        socket.broadcast.emit("privateMessageReceived", {
            senderPseudo: data.pseudo,
            privateMessageContent: data.messageContent,
            recipientSocketID: data.socketID
        });
    })
    socket.on("disconnect", () => {
        let indexDisconect;
        users.forEach((element, index) => {
            if (element.id === socket.id)
                indexDisconect = index;
        });
        users.splice(indexDisconect, 1);
    })

})

server.listen(port, ip, () => {
    console.log("Demarer sur http://" + ip + ":" + port);
})