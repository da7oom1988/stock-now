
$(function(){
var socket = io.connect();
var $stock = $('#stocks');
var $stockInput = $('#stock-input');
var $add = $("#add-btn");
var stockName = '';

const options = {
	url: '/lip/autocomplete-ticker-name-data.json',
	getValue: 'name',
	list: {
		match: {
			enabled: true
		},
		onSelectItemEvent: function() {
			stockName = $("#stock-input").getSelectedItemData().code;
            $stockInput.val(stockName);
		}
	}
};

$('#stock-input').easyAutocomplete(options);


function add(name){
    return '<div class="stock"><h4>'+ name + '</h4></div>';
}

function updateChart(){
        seriesOptions = [];
        seriesCounter = 0;
        $.each(names, function (i, name) {

            $.getJSON('/api/get/' + name.toLowerCase(),    function (data) {
                var parsedData = data.dataset.data.map(function(item) {
                    item.splice(0, 1, Date.parse(item[0]));
                    return item;
                });

                seriesOptions[i] = {
                    name: name,
                    data: parsedData
                };

                // As we're loading the data asynchronously, we don't know what order it will arrive. So
                // we keep a counter and create the chart when all the data is loaded.
                seriesCounter += 1;

                if (seriesCounter === names.length) {
                    createChart();
                }
            });
        });
}


socket.on('get stocks',function(data){
    var html = "";
    for(var i = 0 ; i < data.length ; i++){
        html += add(data[i]);
    }
    $stock.html(html);
    names = data;
    //seriesCounter = 0;
    console.log(names);
    updateChart();
});



$add.click(function(){
    if(names.indexOf($stockInput.val()) !== -1){
        return alert('you already have this stock');
    }else if($stockInput.val() == ''){
        return alert('Please enter stock name');
    }else{
        $.getJSON('/api/get/' + $stockInput.val())
			.done(function(data) {
                socket.emit('new stock', {stock: $stockInput.val() });
                $stockInput.val('');
            }).fail(function(data) {
				// notify user that the stock doesn't exist
				alert('Stock unavailable or doesn\'t exist');
			});
    }
    
});


var $stockBtn = $('.stock');
$stock.on('click', $stockBtn, function(e) {

	var stocksRemaining = document.querySelector('#stocks').children.length;

	// only remove stock if there's more than one stock left
	if(stocksRemaining > 1) {
		var stockName = e.target.firstChild.textContent;
        console.log(stockName);
		socket.emit('del stock', {stock: stockName});
	} else {
		alert('Cannot remove final stock');
	}

});

})
