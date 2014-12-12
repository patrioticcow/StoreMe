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

$('#import').on("click", function () {
	var importContent = $('#import_content');

	if (importContent.val().length === '' || importContent.val().length === 0) {
		alert('Nothing to import');
	} else {
		console.log('start');
		chrome.storage.sync.get(function (data) {
			for (var key in data) {
				chrome.storage.sync.remove(key);
			}
		});

		chrome.storage.sync.set(JSON.parse(importContent.val()), function () {
			$('#import_alert').show();
			setTimeout(function () {
				$('#import_alert').fadeOut();
			}, 1000);
		});
	}

	return false;
});

$('.store_me').on("click", '.remove', function (e) {
	e.preventDefault();
	var key = $(this).data('key').toString();
	$('#panel_' + key).remove();
	chrome.storage.sync.remove(key);
	return false;
});

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	if ($(e.target).attr('href') === '#view') getData();
	if ($(e.target).attr('href') === '#export') {
		chrome.storage.sync.get(function (data) {
			$('#export_content').val(JSON.stringify(data));
		});
	}
});

$('#accordion').on('show.bs.collapse', function (e) {
	chrome.storage.sync.set({active_tab : $(e.target).attr('id')});
});

getData();

function getData() {
	chrome.storage.sync.get(function (data) {
		var htm = '';
		var collapseId;
		for (var key in data) {
			var obj = data[key];
			if(key !== 'active_tab') htm += getColapsable(key, obj);
			if(key === 'active_tab') collapseId = obj;
		}

		$('#accordion').html(htm);

		$('#' + collapseId).collapse('show');

		$('#search').hideseek({
			highlight: true
		});
	});
}

function getColapsable(key, obj) {
	var d = new Date(key * 1000);
	console.log(d.toDateString());

	var html = '';
	html += '<div class="panel panel-default" id="panel_' + key + '">';
	html += '   <div class="panel-heading" role="tab" id="heading' + key + '">';
	html += '       <h4 class="panel-title">';
	html += '           <a data-toggle="collapse" data-parent="#accordion" href="#collapse' + key + '" aria-expanded="true" aria-controls="collapse' + key + '">';
	html += '               ' + obj.name + ' <small class="pull-right">' + d.toDateString() + ' ';
	html += '               <button class="btn btn-xs btn-danger remove" data-key="' + key + '"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></small>';
	html += '           </a>';
	html += '       </h4>';
	html += '   </div>';
	html += '   <div id="collapse' + key + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading' + key + '">';
	html += '       <div class="panel-body">' + obj.details + '</div>';
	html += '   </div>';
	html += '</div>';

	return html;
}