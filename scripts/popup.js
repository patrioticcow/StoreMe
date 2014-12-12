'use strict';

$('#save').on("click", function () {
	var name = $('#name');
	var details = $('#details');
	var time = new Date().getTime();

	if (name.val().length === '' || name.val().length === 0) {
		alert('Enter a name');
	} else {
		var obj = {};
		obj[time] = {name: name.val(), details: details.val()};
		chrome.storage.sync.set(obj, function () {
			$('#alert').show();
			name.val('');
			details.val('');
			setTimeout(function () {
				$('#alert').fadeOut();
			}, 1000);
		});
	}

	return false;
});

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	if ($(e.target).attr('href') === '#view') getData();
});

getData();

function getData() {
	chrome.storage.sync.get(function (data) {
		var htm = '';
		for (var key in data) {
			var obj = data[key];
			htm += getColapsable(key, obj);
		}
		$('#accordion').html(htm);
	});
}

function getColapsable(key, obj) {
	var d = new Date(key * 1000);
	console.log(d.toDateString());

	var html = '';
	html += '<div class="panel panel-default">';
	html += '   <div class="panel-heading" role="tab" id="heading' + key + ' ' + d.toDateString() + '">';
	html += '       <h4 class="panel-title">';
	html += '           <a data-toggle="collapse" data-parent="#accordion" href="#collapse' + key + '" aria-expanded="true" aria-controls="collapse' + key + '">' + obj.name + '</a>';
	html += '       </h4>';
	html += '   </div>';
	html += '   <div id="collapse' + key + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading' + key + '">';
	html += '       <div class="panel-body">' + obj.details + '</div>';
	html += '   </div>';
	html += '</div>';

	return html;
}