const express = require('express');
const request = require('request');
var app = express();
const http = require('http').createServer(app);
const io = require('socket.io').listen(http);

var port = process.env.PORT || 3000;
app.use(express.static(__dirname + '/public'));

http.listen(port,function(err){
    if(err) return console.log(err);
    console.log('server started in port ' + port);
});


var stocks = ['goog' , 'fb'];
var connact =[];


app.get('/api/get/:id',function(req,res){
    var id = req.params.id;
   var url = 
   "https://www.quandl.com/api/v3/datasets/WIKI/"+ id +".json?column_index=1&order=asc&start_date=2010-01-01&api_key=Jp2GYwTSzi8ndBevwEAW";
    request({
        url: url,
        json: true
    },function(err,rs,bd){
      res.send(bd);
    })
});

app.get('/api/delete/:id',function(req,res){
    var id = req.params.id;
    if(stocks.indexOf(id) >= 0 ){
        stocks.slice(stocks.indexOf(id),1);
    }
});

io.sockets.on('connection',function(socket){
    connact.push(socket);
    updateStocks();
    console.log('Connect: %s sockets conected', connact.length);

     socket.on('disconnect',function(data){
        connact.splice(connact.indexOf(socket),1);
        console.log('Disconnect: %s sockets conected', connact.length)
     });

    socket.on('new stock',function(data){
        stocks.push(data.stock);
        updateStocks();
    });

    socket.on('del stock',function(data){
        stocks.splice(stocks.indexOf(data.stock),1);
        updateStocks();
    });

    function updateStocks(){
        io.sockets.emit('get stocks',stocks);
    }

});