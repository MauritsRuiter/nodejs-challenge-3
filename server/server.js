import express from "express";
import { Server } from "socket.io";

const app    = express();
const port   = 3000;
const server = app.listen(port, () => { console.log("Server running on port: 3000"); });
const io     = new Server(server);

const sockets   = [];
const users     = [];
const messages  = [];

app.use(express.static('public'));
app.use(express.urlencoded({ extended:true }));
app.use(express.json());

app.set ('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect('login');
}); 

app.get('/login', (req, res) => { 
    res.render('login');
});

app.post('/login', (req, res) => {
    res.redirect(`/chat/${req.body.username}`);
});

app.get('/chat/:username', (req, res) => {
    res.render('chat', { username:req.params.username });
});

io.on('connection', (socket) => {

    sockets[socket.id] = socket;

    socket.on('join', (username) => {
        users[socket.id] = username;
        io.emit('join', { username:username, users:Object.values(users) });
    });
    socket.on('disconnect', (reason) => {
        const username = users[socket.id];
        delete sockets[socket.id];
        delete users[socket.id];
        io.emit('join', { username:username, users:Object.values(users) });
    });
    socket.on('message', (data) => {
        const { messages, message } = data;
        io.emit('message', data);
    });
});