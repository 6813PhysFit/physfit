var appt_id;
var appts = {};
var view_date;

$(document).ready(function(){
	appt_id = 0;
	_put_hours_list(9,17);

	// set view date to current
	view_date = new Date();
	var date_str = $.datepicker.formatDate('yy/mm/dd', view_date);

	// placeholder "database" = appts
	appts[0] = new Appointment('ch', date_str, 10, 'Peter', 'Broken bone');
	appts[1] = new Appointment('ev', date_str, 11, 'Lily', 'Running exercises');
	appts[2] = new Appointment('hon', date_str, 12, 'John', 'Stretches');
	appts[3] = new Appointment('hof', date_str, 10, 'Howard', 'Weights');
	appts[4] = new Appointment('me', date_str, 11, 'Blake', 'Progress Report');
	appts[5] = new Appointment('me', '2014/04/16', 11, 'Blake', 'Progress Report');

	// put appts into sheet
	_draw_date(date_str);

	$("#today").click(function(){
		set_day($.datepicker.formatDate('yy/mm/dd', new Date()));
	});
	$("#prev_day").click(prev_day);
	$("#next_day").click(next_day);

	$("#calendar_icon").datepicker({
        buttonImage: 'calendar_icon.png',
        buttonImageOnly: true,
        dateFormat: 'yy/mm/dd',
        showOn: 'both',
     });
	$("#calendar_icon").change(function(){
		set_day($("#calendar_icon").val());
	});

	$("#view_date").text(date_str);
	$("#add_appt").click(_lightbox_new);

});


// insert a certain appointment appt into the DOM
var insert_appt = function(appt){
	var apptElement = $("<div id='appt"+appt.appt_id+"' class='span2 appt_elem'>");
	apptElement.text(appt.to_string());
	if(appt.kind == "ch"){
		apptElement.prepend($("<i class='icon-ok icon-white'></i>"));
	} else if(appt.kind == "ev"){
		apptElement.prepend($("<i class='icon-list-alt icon-white'></i>"));
	} else if(appt.kind == "hon"){
		apptElement.prepend($("<i class='icon-thumbs-up icon-white'></i>"));
	} else if(appt.kind == "hof"){
		apptElement.prepend($("<i class='icon-ban-circle icon-white'></i>"));
	} else if(appt.kind == "me"){
		apptElement.prepend($("<i class='icon-user icon-white'></i>"));
	}
	apptElement.addClass(appt.kind);
	$("#hour"+appt.hour).append($("<li>").append(apptElement));

	// attach popup handler
	apptElement.click(function(){
		_lightbox_appt(appt);
	});
}

var next_day = function(){
	view_date.setTime(view_date.getTime() + (24 * 60 * 60 * 1000));
	var date_str = $.datepicker.formatDate('yy/mm/dd', view_date);
	_draw_date(date_str);
}

var prev_day = function(){
	view_date.setTime(view_date.getTime() - (24 * 60 * 60 * 1000));
	var date_str = $.datepicker.formatDate('yy/mm/dd', view_date);
	_draw_date(date_str);
}

var set_day = function(date){
	view_date.setTime(Date.parse(date));
	var date_str = $.datepicker.formatDate('yy/mm/dd', view_date);
	_draw_date(date_str);
}

// create object from appointment parameters
// kind = type of appointment
// date = current date in 'yyyy/mm/dd' format
// hour = hour of appointment
// patient_name = patient's name
// notes = notes for that appointment
// returns: Appointment object

var Appointment = function(kind, date, hour, patient_name, notes){
	this.kind = kind;
	this.date = date;
	this.hour = hour;
	this.patient_name = patient_name;
	this.notes = notes;
	this.appt_id = appt_id;
	this.to_string = function(){
		if(this.kind == "ch"){
			return "Check-In";
		} else if(this.kind == "ev"){
			return "Evaluation";
		} else if(this.kind == "hon"){
			return "Hands-On";
		} else if(this.kind == "hof"){
			return "Hands-Off";
		} else if(this.kind == "me"){
			return "Meeting";
		}
		return "Appt"
	}

	// INSERT INTO DATABASE
	appts[appt_id] = this;
	appt_id += 1;
}

var _draw_date = function(date_str){
	$("#view_date").text(date_str);
	$(".appt_elem").remove();
	for(var appt in appts){
		if(appts[appt].date == date_str){
			insert_appt(appts[appt]);
		}
	}
}

// given time i, return hour with AM or PM
// i = integer (0-23)
// returns: string with time in AM/PM
var _readable_hour = function(i){
	if(i == 0){
		return "12 AM";
	} else if(i < 12){
		return i+" AM";
	} else if(i == 12){
		return "12 PM"
	} else {
		return (i-12)+" PM";
	}
}

// Draws the hours list in the calendar view.
// start = earliest hour desired to view (0-23)
// end = latest hour desired to view (0-23)
var _put_hours_list = function(start, end){
	var hour_ul = $("<ul id='schedule_view'>");
	for(var i=start;i<end;i++){
		hour_ul.append(_make_hour_element(i));
	}
	$("#calendar_view").append(hour_ul);
}

// Draw row for hour given by integer i
var _make_hour_element = function(i){
	var hour_div = $("<div class='row hour_row'>");
		hour_div.id = 'hour_'+i;


		hour_label = $("<label class='label'>"+_readable_hour(i)+"</label>");

		var hour_inner_ul = $("<ul class='hour_inner' id='hour"+i+"' style='height:100%'>");

		hour_div.prepend($("<div class='span1 hour_label'>").append(hour_label));
		hour_div.append(hour_inner_ul);
	return hour_div;
}

// display the lightbox for a certain Appointment object appt
function _lightbox_appt(appt){

	var content = $("<div id='innerbox' />");
	content.append($("<div id='lightbox_title'>"+appt.patient_name+"'s Appointment</div>"));
	content.append($("<br>"));
	content.append($("<div id='lightbox_date'><b>Date:</b> <input id='datepicker' type='text' value='"+appt.date+"'></input></div>"));
	content.append($("<div id='lightbox_time'><b>Time:</b> <input id='timepicker' type='text' value='"+appt.hour+"'></input></div>"));
	content.append($("<div id='lightbox_kind'><b>Type:</b> "+
	"<select id='lightbox_selected'>"+
	"<option value='ch'>Check-In</option>"+
	"<option value='ev'>Evaluation</option>"+
	"<option value='hon'>Hands-On</option>"+
	"<option value='hof'>Hands-Off</option>"+
	"<option value='me'>Meeting</option>"+
	"</select>"+
	"</div>"));

	content.append($("<div id='lightbox_notes'><b>Notes:</b></div>"+
		"<div><textarea id='lightbox_input'>"+appt.notes+"</textarea></div>"
	));

	var button_div = $("<div id='lightbox_buttons' />");
	button_div.append($("<button id='lightbox_cancel' class='btn'>Cancel</button>"));
	button_div.append($("<button id='lightbox_save' class='btn btn-primary'>Save</button>"));

	content.append(button_div);

	_lightbox(content);

	$('#datepicker').datepicker({ dateFormat: 'yy/mm/dd' })
	$("#lightbox_selected").val(appt.kind); // set default to appt's current type

	$("#lightbox_cancel").click(_closeLightbox);
	$("#lightbox_save").click(function(){
		appt.kind = $('#lightbox_selected').val();
		appt.date = $('#datepicker').val();
		appt.hour = $('#timepicker').val();
		appt.notes = $("#lightbox_input").val();
		_draw_date($.datepicker.formatDate('yy/mm/dd', view_date));
		_closeLightbox();
	});
}

function _lightbox_new(){
	var content = $("<div id='innerbox' />");
	content.append($("<div id='lightbox_title'>Create a New Appointment</div>"));
	content.append($("<br>"));
	content.append($("<div id='lightbox_name'><b>Name:</b> <input id='namepicker' type='text'></input></div>"));
	content.append($("<div id='lightbox_date'><b>Date:</b> <input id='datepicker' type='text' value='"+$.datepicker.formatDate('yy/mm/dd', view_date)+"'></input></div>"));
	content.append($("<div id='lightbox_time'><b>Time:</b> <input id='timepicker' type='text'></input></div>"));
	content.append($("<div id='lightbox_kind'><b>Type:</b> "+
	"<select id='lightbox_selected'>"+
	"<option value='ch'>Check-In</option>"+
	"<option value='ev'>Evaluation</option>"+
	"<option value='hon'>Hands-On</option>"+
	"<option value='hof'>Hands-Off</option>"+
	"<option value='me'>Meeting</option>"+
	"</select>"+
	"</div>"));
	content.append($("<div id='lightbox_notes'><b>Notes:</b></div>"+
		"<div><textarea id='lightbox_input'></textarea></div>"
	));

	var button_div = $("<div id='lightbox_buttons' />");
	button_div.append($("<button id='lightbox_cancel' class='btn'>Cancel</button>"));
	button_div.append($("<button id='lightbox_save' class='btn btn-primary'>Save</button>"));

	content.append(button_div);
	// draw on screen
	_lightbox(content);

	$('#datepicker').datepicker({ dateFormat: 'yy/mm/dd' })

	$("#lightbox_cancel").click(_closeLightbox);
	$("#lightbox_save").click(function(){
		var new_appt = new Appointment($("#lightbox_selected").val(),
			$('#datepicker').val(),
			$("#timepicker").val(),
			$("#namepicker").val(),
			$("#lightbox_input").val());
		_draw_date($.datepicker.formatDate('yy/mm/dd', view_date));
		_closeLightbox();
	});

}

// display the lightbox for a certain string content
function _lightbox(content){

	// add lightbox/shadow <div/>'s if not previously added
	if($('#lightbox').size() == 0){
		var theLightbox = $('<div id="lightbox"/>');
		var theShadow = $('<div id="lightbox-shadow"/>');
		$(theShadow).click(function(e){
			_closeLightbox();
		});
		$('body').append(theShadow);
		$('body').append(theLightbox);
	}

	// remove any previously added content
	$('#lightbox').empty();

	$('#lightbox').append(content);
	// TODO: Saving does not do anything yet, since no backend. 

	// move the lightbox to the current window top + 100px
	$('#lightbox').css('top', $(window).scrollTop() + 100 + 'px');

	// display the lightbox
	$('#lightbox').show();
	$('#lightbox-shadow').show();

}

// close the lightbox
function _closeLightbox(){

	// hide lightbox and shadow <div/>'s
	$('#lightbox').hide();
	$('#lightbox-shadow').hide();

	// remove contents of lightbox in case a video or other content is actively playing
	$('#lightbox').empty();
}