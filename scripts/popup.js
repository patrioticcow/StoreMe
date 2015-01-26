'use strict';

//chrome.storage.sync.remove('patterna');
chrome.storage.sync.get('pattern', function (data) {
	if (!isEmpty(data)) {
		$('.store_me').css({width: '330px'});
		$('#patternLoginContainer').show();
		var loginLock = new PatternLock("#patternLoginContainer", {
			matrix: [3, 3],
			onDraw: function (pattern) {
				chrome.storage.sync.get('pattern', function (data) {
					if (parseInt(data.pattern) !== parseInt(pattern)) {
						$('#alert_match').html('<div class="alert alert-danger">Patterns don\'t match</div>');
					} else {
						$('#patternLoginContainer').hide();
						$('#alert_match').html('');
						$('#main_content').show();
						$('.store_me').css({width: '800px'});
					}
				});

				loginLock.reset();
			}
		});
	} else {
		$('#main_content').show();
	}
});

$('#remove_pattern').on("click", function () {
	chrome.storage.sync.remove('pattern');
	chrome.storage.sync.remove('pattern_temp');
	$('#alerts').html('<div class="alert alert-info">Patterns removed</div>');
});

var lock = new PatternLock("#patternContainer", {
	matrix: [3, 3],
	onDraw: function (pattern) {
		chrome.storage.sync.get('pattern_temp', function (data) {
			if (isEmpty(data)) {
				chrome.storage.sync.set({pattern_temp: pattern});
				$('#alerts').html('<div class="alert alert-info">Enter your pattern again</div>');
			} else {
				if (parseInt(data.pattern_temp) === parseInt(pattern)) {
					chrome.storage.sync.set({pattern: pattern});
					chrome.storage.sync.remove('pattern_temp');
					$('#alerts').html('<div class="alert alert-success">Pattern set successfully</div>');
				} else {
					$('#alerts').html('<div class="alert alert-warning">Patterns don\'t match</div>');;
				}
			}
		});

		lock.reset();
	}
});


$('#save').on("click", function () {
	var name = $('#name');
	var details = $('#details');
	var time = new Date().getTime();

	if (name.val().length === '' || name.val().length === 0) {
		$('#alert_name').html('<div class="alert alert-warning">The Name is required</div>')
	} else {
		//console.log(details.val());
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
		$('#alert_import').html('<div class="alert alert-warning">Nothing to import</div>')
	} else {
		chrome.storage.sync.set(JSON.parse(importContent.val()), function () {
			$('#import_alert').show();
			setTimeout(function () {
				$('#import_alert').fadeOut();
			}, 1000);
		});
	}

	return false;
});

var storeMe = $('.store_me');
storeMe.on("click", '.remove', function (e) {
	e.preventDefault();
	var key = $(this).data('key').toString();
	$('#panel_' + key).remove();
	chrome.storage.sync.remove(key);
	return false;
});

storeMe.on("click", '.edit', function (e) {
	e.preventDefault();
	var key = $(this).data('key').toString();

	$('#shown_details_' + key).hide();
	$('#edit_details_' + key).show();
	return false;
});

storeMe.on("click", '.cancel_edits', function (e) {
	e.preventDefault();
	var key = $(this).data('key').toString();

	$('#shown_details_' + key).show();
	$('#edit_details_' + key).hide();
	return false;
});

storeMe.on("click", '.save_edits', function (e) {
	e.preventDefault();
	var key = $(this).data('key').toString();
	var newContentDetails = $('#new_content_' + key).val();
	var newContentName = $('#content_name_' + key).val();

	var obj = {};
	obj[key] = {name: newContentName, details: newContentDetails};

	chrome.storage.sync.set(obj);

	var showDetailsDiv = $('#shown_details_' + key);
	showDetailsDiv.html(newContentDetails);
	showDetailsDiv.show();
	$('#edit_details_' + key).hide();

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
	chrome.storage.sync.set({active_tab: $(e.target).attr('id')});
});

getData();

function getData() {
	chrome.storage.sync.get(function (data) {
		var htm = '';
		var collapseId;
		for (var key in data) {
			var obj = data[key];
			if (key !== 'active_tab' && key !== 'pattern' && key !== 'pattern_temp') htm += getColapsable(key, obj);
			if (key === 'active_tab') collapseId = obj;
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
	var html = '';

	html += '<div class="panel panel-default" id="panel_' + key + '">';
	html += '   <div class="panel-heading" role="tab" id="heading' + key + '">';
	html += '       <h4 class="panel-title">';
	html += '           <a data-toggle="collapse" data-parent="#accordion" href="#collapse' + key + '" aria-expanded="true" aria-controls="collapse' + key + '">';
	html += '               <button class="btn btn-xs btn-info edit" data-key="' + key + '"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span></button></small>';
	html += '               <span>' + obj.name + '</span> <small class="pull-right">' + d.toDateString() + ' ';
	html += '               <button class="btn btn-xs btn-danger remove" data-key="' + key + '"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></small>';
	html += '           </a>';
	html += '       </h4>';
	html += '   </div>';
	html += '   <div id="collapse' + key + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading' + key + '">';
	html += '       <div class="panel-body" style="padding:3px">';
	html += '           <div id="shown_details_' + key + '" style="white-space: pre ; display: block; unicode-bidi: embed">' + obj.details + '</div>';
	html += '           <div id="edit_details_' + key + '" style="display:none">';
	html += '				<input type="hidden" id="content_name_' + key + '" value="' + obj.name + '"/>';
	html += '               <textarea name="edit_details" id="new_content_' + key + '" class="form-control input-sm" rows="10">' + obj.details + '</textarea><br>';
	html += '               <button type="submit"  data-key="' + key + '" class="btn btn-default cancel_edits">Cancel</button>';
	html += '               <button type="submit"  data-key="' + key + '" class="btn btn-success save_edits">Save</button>';
	html += '           </div>';
	html += '       </div>';
	html += '   </div>';
	html += '</div>';

	return html;
}

function isEmpty(obj) {
	if (obj == null) return true;
	if (obj.length > 0)    return false;
	if (obj.length === 0)  return true;
	for (var key in obj) {
		if (hasOwnProperty.call(obj, key)) return false;
	}
	return true;
}