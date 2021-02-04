const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const port = new SerialPort('/dev/cu.usbmodem14101');
const parser = port.pipe(new Readline({delimeter: '\r\n'}));

let path = require('path');

app.use(express.static('public'))

io.on('connection', (socket)=>{
    // socket.emit('welcome', socket.id);

    parser.on('data', (data)=>{
        console.log(data)
        socket.emit('arduino data', data);
    })

    socket.on('disconnect', ()=>{
        console.log('left: ' + socket.id)
    })
})



app.get ('/', function(req, res){
res.sendFile(path.join(__dirname + '/views/index.html'));
});

server.listen(3000, ()=>{
    console.log("I'm listening" + server.address().port)
})