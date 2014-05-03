var appt_id;
var appts = {};
var view_date;
var start_hour;
var end_hour;
var patientInfo = [];
var currentPatientIndex = 0;
//NOTE appointment is for Parse, Appointment is for internal array until Parse fully implemented
var parseAppointment;
var parsePatient;
$(document).ready(function(){
    Parse.initialize("KTPQvAC5MnRTfoPJfqtOq1HS5zQy5OomLrRVmkH0", "UcT9MFG78hnKlgVz94FEolxdmJ63xyy1ZG9TTo10");
    parseAppointment = Parse.Object.extend("Appointment");

    parsePatient = Parse.Object.extend("Patient");
    var query = new Parse.Query(parsePatient);

    query.exists("Name");
    query.ascending("Name");
    query.find({
        success: function(results) {
            results.forEach(function(patient) {
                patientInfo.push([patient.id, patient.get("Name"), patient.get("Conditions"), patient.get("Summary"), patient.get("image"), patient]);
            });
            var patientNameList = document.getElementById("patientNameList");
            for (var i=0; i<patientInfo.length; i++) {
                var newListItem = document.createElement("li");
                var newLinkItem = document.createElement("a");
                newLinkItem.href="#";
                newListItem.className = newListItem.className+" list-group-item patient";
                newLinkItem.className = i;
                var newListValue = document.createTextNode(patientInfo[i][1]);
                newLinkItem.appendChild(newListValue);
                newListItem.appendChild(newLinkItem);
                patientNameList.appendChild(newListItem);

                newListItem.onclick = function() {
                    $("#starting_patient_view").css("visibility", "hidden");
                    $("#letterman_patient_view").css("visibility", "visible");
                    var i = this.children[0].className;
                    currentPatientIndex = i;
                    var patientSummary = document.getElementById("patientSummary");
                    patientSummary.innerHTML = patientInfo[i][3];
                    var patientConditions = document.getElementById("patientConditions");
                    patientConditions.innerHTML = patientInfo[i][2];
                    var patientTitle = document.getElementById("title1");
                    patientTitle.innerHTML = patientInfo[i][1]; 
                    var patientImage = document.getElementById("patientImage");
                    patientImage.src = patientInfo[i][4].url();
                    var patientPastAppts = document.getElementById("patientPastAppts");
                    patientPastAppts.innerHTML = "";
                    var patientUpcomingAppts = document.getElementById("patientUpcomingAppts");
                    patientUpcomingAppts.innerHTML = "";
                    var queryAppt = new Parse.Query(parseAppointment);
                    queryAppt.lessThan("date", date_str);
                    queryAppt.equalTo("patient",patientInfo[i][5]);
                    queryAppt.find({
                        success: function(results) {
                            results.forEach(function(result) {
                                var ap = new Appointment(result.get('type'), result.get('date'), result.get('time'), patientInfo[i][1], result.get('notes'), result.id);
                                var appt = document.createElement("a");
                                appt.href="#";
                                var apptText = document.createTextNode(result.get('date'));
                                appt.appendChild(apptText);
                                appt.onclick = function () {
                                    _lightbox_appt(ap);
                                }
                                patientPastAppts.appendChild(appt);
                                var lnbreak = document.createElement("br");
                                patientPastAppts.appendChild(lnbreak);
                            });
                        },
                        error: function(error) {
                            alert("Appointment Error: " + error.code + " " + error.message);
                        }
                    });
                    var queryApptFuture = new Parse.Query(parseAppointment);
                    queryApptFuture.greaterThan("date", date_str);
                    queryApptFuture.equalTo("patient",patientInfo[i][5]);
                    queryApptFuture.find({
                        success: function(results) {
                            results.forEach(function(result) {
                                var ap = new Appointment(result.get('type'), result.get('date'), result.get('time'), patientInfo[i][1], result.get('notes'), result.id);
                                var appt = document.createElement("a");
                                appt.href="#";
                                var apptText = document.createTextNode(result.get('date'));
                                appt.appendChild(apptText);
                                appt.onclick = function () {
                                    _lightbox_appt(ap);
                                }
                                patientFutureAppts.appendChild(appt);
                                var lnbreak = document.createElement("br");
                                patientFutureAppts.appendChild(lnbreak);
                            });
                        },
                        error: function(error) {
                            alert("Appointment Error: " + error.code + " " + error.message);
                        }
                    });
                }
            }
        }
    });
    var summaryDivClicked = function () {
        divClicked("summary");
    }
    var conditionsDivClicked = function () {
        divClicked("conditions");
    }
    var divClicked = function (div) {
        var divToReplace;
        if(div == "summary") {
            divToReplace = $("#patientSummary");
        } else {
            divToReplace = $("#patientConditions");
        }
        var divHtml = divToReplace.html();
        var newTextItem = document.createElement("textarea");
        newTextItem.innerHTML = divHtml;
        newTextItem.className = "panel-body";
        newTextItem.id = "textareaEdit";
        divToReplace.replaceWith($(newTextItem));
        newTextItem.focus();
        // setup the blur event for this new textarea
        if (div=="summary") {
            $(newTextItem).blur(summaryEditableTextBlurred);            
        } else {
            $(newTextItem).blur(conditionsEditableTextBlurred);
        }
    }
    var summaryEditableTextBlurred = function () {
        editableTextBlurred("summary", $(this));
    }
    var conditionsEditableTextBlurred = function () {
        editableTextBlurred("conditions", $(this));
    }
    var editableTextBlurred = function (div, thisDiv) {
        var html = thisDiv.val();
        var newTextItem = document.createElement("div");
        newTextItem.innerHTML = html;
        newTextItem.className = "panel-body";
        if(div=="summary") {
            newTextItem.id = "patientSummary";
            newTextItem.click(summaryDivClicked);
            patientInfo[currentPatientIndex][3] = html;
            var query = new Parse.Query(parsePatient);
            query.get(patientInfo[currentPatientIndex][0], {
                success: function (patient) {
                    patient.set("Summary",html);
                    patient.save(null, {
                        success: function(patient) {
                            patient.save();
                        }
                    });
                },
                error: function (object, error) {
                    console.log("struggz");
                }
            });
        } else {
            newTextItem.id = "patientConditions";
            newTextItem.click(conditionsDivClicked);
            patientInfo[currentPatientIndex][2] = html;
            var query = new Parse.Query(parsePatient);
            query.get(patientInfo[currentPatientIndex][0], {
                success: function (patient) {
                    patient.set("Conditions",html);
                    patient.save(null, {
                        success: function(patient) {
                            patient.save();
                        }
                    });
                },
                error: function (object, error) {
                    console.log("struggz");
                }
            });
        }
        thisDiv.replaceWith(newTextItem);
    }
    $('#edit_summary').click(summaryDivClicked);
    $('#edit_conditions').click(conditionsDivClicked);

    appt_id = 0;
    start_hour = 9;
    end_hour = 17;
    _put_hours_list(start_hour, end_hour);

    //Add tabs Listeners
    $('#actualTabs a[href="#nameList"]').click(function (e) {
      e.preventDefault();
      $(this).tab('show');
  });

    $('#actualTabs a[href="#freedomList"]').click(function (e) {
      e.preventDefault();
      $(this).tab('show');
  });

    $('#popovergoddamit').popover('hide');

    // set view date to current
    view_date = new Date();
    var date_str = $.datepicker.formatDate('yy/mm/dd', view_date);

    // placeholder "database" = appts
    // appts[0] = new Appointment('ch', date_str, 10, 'Jeffrey Sun', 'Broken bone');
    // appts[1] = new Appointment('ev', date_str, 11, 'Keertan Kini', 'Running exercises');
    // appts[2] = new Appointment('hon', date_str, 12, 'Ashley Smith', 'Stretches');
    // appts[3] = new Appointment('hof', date_str, 10, 'Vynnie Kong', 'Weights');
    // appts[4] = new Appointment('me', date_str, 11, 'Keertan Kini', 'Progress Report');
    // appts[5] = new Appointment('me', '2014/04/16', 11, 'Jeffrey Sun', 'Progress Report');
    // appts[6] = new Appointment('me', '2014/04/25', 11, 'Ashley Smith', 'Progress Report');
    // appts[7] = new Appointment('me', '2014/04/27', 11, 'Vynnie Kong', 'Progress Report');
    // appts[8] = new Appointment('me', '2014/04/02', 11, 'David', 'Progress Report');
    // appts[9] = new Appointment('me', '2014/03/27', 11, 'David', 'Progress Report');
    
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

    $("#date425").click(function(){
        _lightbox_appt(appts[6]);
    });
    $("#date427").click(function(){
        _lightbox_appt(appts[7]);
    });
    $("#date42").click(function(){
        _lightbox_appt(appts[8]);
    });
    $("#date327").click(function(){
        _lightbox_appt(appts[9]);
    });
});


// insert a certain appointment appt into the DOM
var insert_appt = function(appt){
    var apptElement = $("<div id='appt"+appt.appt_id+"' class='appt_elem'>");
    apptElement.html(appt.to_string());
    if(appt.kind == "ch"){
        apptElement.prepend($("<span class='appt_icon glyphicon glyphicon-ok'></span>"));
    } else if(appt.kind == "ev"){
        apptElement.prepend($("<span class='appt_icon glyphicon glyphicon-list-alt'></span>"));
    } else if(appt.kind == "hon"){
        apptElement.prepend($("<span class='appt_icon glyphicon glyphicon-thumbs-up'></span>"));
    } else if(appt.kind == "hof"){
        apptElement.prepend($("<span class='appt_icon glyphicon glyphicon-ban-circle'></span>"));
    } else if(appt.kind == "me"){
        apptElement.prepend($("<span class='appt_icon glyphicon glyphicon-user'></span>"));
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
// patient_name = patient's notes
// name = notes for that appointment
// returns: Appointment object

var Appointment = function(kind, date, hour, patient_name, notes, id){
    this.kind = kind;
    this.date = date;
    this.hour = hour;
    this.patient_name = patient_name;
    this.notes = notes;
    this.appt_id = id;
    this.to_string = function(){
        var s = "<span>";
        if(this.kind == "ch"){
            s += "Check-In";
        } else if(this.kind == "ev"){
            s += "Evaluation";
        } else if(this.kind == "hon"){
            s += "Hands-On";
        } else if(this.kind == "hof"){
            s += "Hands-Off";
        } else if(this.kind == "me"){
            s += "Meeting";
        } else {
            s += "Other";
        }

        s += "</span><div>" + this.patient_name + "</div>";
        return s;
    }

    // // INSERT INTO DATABASE
    // appts[appt_id] = this;
    // appt_id += 1;
}

var _draw_date = function(date_str){
    $("#view_date").text(date_str);
    $(".appt_elem").parent().remove();

    //date_str = '2014/04/16';
    var queryAppt = new Parse.Query(parseAppointment);
    queryAppt.equalTo("date", date_str);

    queryAppt.find({
          success: function(results) {
            results.forEach(function(result) {
              // console.log(result.get('type'), result.get('date'), result.get('time'), result.get('notes'));
              var queryPat = new Parse.Query(parsePatient);
              queryPat.get(result.get("patient").id, {
                success: function(pat) {
                  // The object was retrieved successfully.
                    var ap = new Appointment(result.get('type'), result.get('date'), result.get('time'), pat.get("Name"), result.get('notes'), result.id);
                    insert_appt(ap);
                },
                error: function(object, error) {
                  alert("Patient Error: " + error.code + " " + error.message);

                }
              });
            });
          },
          error: function(error) {
            alert("Appointment Error: " + error.code + " " + error.message);
        }
    });

    // for(var appt in appts){
    //     if(appts[appt].date == date_str){
    //         insert_appt(appts[appt]);
    //     }
    // }
    var today = $.datepicker.formatDate('yy/mm/dd', new Date());
    if(date_str == today){
        $("#today").addClass('disabled');
    } else {
        $("#today").removeClass('disabled');
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

    hour_label = $("<label class='label' style='font-size:10px'>"+_readable_hour(i)+"</label>");

    var hour_inner_ul = $("<ul class='hour_inner' id='hour"+i+"' style='height:100%;'>");

    hour_div.prepend($("<div class='span1 hour_label'>").append(hour_label));
    hour_div.append(hour_inner_ul);
    return hour_div;
}

function _generate_timepicker(start, end, curr){
    var s = "<select id='timepicker'>";
    for(var i=start;i<end;i++){
        if(i == curr){
            s += "<option value='"+i+"' selected='selected'>"+_readable_hour(i)+"</option>";
        } else {
            s += "<option value='"+i+"'>"+_readable_hour(i)+"</option>";
        }
    }
    s += "</select>";
    return s;
}


// display the lightbox for a certain Appointment object appt

function _lightbox_appt(appt){

    var content = $("<div id='innerbox' />");
    content.append($("<div id='lightbox_title' class='text-center'>"+appt.patient_name+"'s Appointment</div>"));
    content.append($("<br>"));
    content.append($("<div id='lightbox_date'><b>Date:</b> <input id='datepicker' type='text' value='"+appt.date+"'></input></div>"));
    content.append($("<div id='lightbox_time'><b>Time:</b>"+
        _generate_timepicker(start_hour, end_hour, appt.hour)+
        "</div>"));
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
    button_div.append($("<button id='lightbox_cancel' class='btn btn-default'>Cancel</button>"));

    button_div.append($("<button id='lightbox_remove' class='btn btn-danger'>Remove</button>"));
    button_div.append($("<button id='lightbox_save' class='btn btn-primary'>Save</button>"));

    content.append(button_div);

    _lightbox(content, 50);

    $('#datepicker').datepicker({ dateFormat: 'yy/mm/dd' })
    $("#lightbox_selected").val(appt.kind); // set default to appt's current type

    $("#lightbox_cancel").click(_closeLightbox);

    $("#lightbox_remove").click(function(){
        var query = new Parse.Query(parseAppointment);
        query.get(appt.appt_id, {
          success: function(ap) {
            // The object was retrieved successfully.
                ap.destroy({
                    success: function(ap) {
                        // The object was deleted from the Parse Cloud.
                        _draw_date($.datepicker.formatDate('yy/mm/dd', view_date)); // redraw calendar
                        _closeLightbox();
                    },
                    error: function(ap, error) {
                        // The delete failed.
                        // error is a Parse.Error with an error code and description.
                        alert("Appointment could not be deleted: " + error.description);
                        }
                    });
          },
          error: function(ap, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and description.
            alert("Appointment to be deleted was not found: " + error.description);
          }
        });
    });

    $("#lightbox_save").click(function(){
        appt.kind = $('#lightbox_selected').val();
        appt.date = $('#datepicker').val();
        appt.hour = Number($('#timepicker').val());
        appt.notes = $("#lightbox_input").val();

        // Create a pointer to an the parseAppointment object
        var ap = new parseAppointment();
        ap.id = appt.appt_id;

        // Set a new value on quantity
        ap.set("type", appt.kind);
        ap.set("date", appt.date);
        ap.set("time", appt.hour);
        ap.set("notes", appt.notes);

        // Save
        ap.save(null, {
          success: function(ap) {
            _draw_date($.datepicker.formatDate('yy/mm/dd', view_date));
            _closeLightbox();
          },
          error: function(ap, error) {
            // The save failed.
            // error is a Parse.Error with an error code and description.
            alert('Failed to save the appointment, with error code: ' + error.description);
          }
        });
    });
}

function _lightbox_new(){
    var content = $("<div id='innerbox' />");
    content.append($("<div id='lightbox_title' class='text-center'>Create a New Appointment</div>"));
    content.append($("<br>"));
    content.append($("<div id='lightbox_name'><b>Name:</b> <input id='namepicker' type='text'></input></div>"));

    content.append($("<div id='lightbox_date'><b>Date:</b> <input id='datepicker' type='text' value='"+$.datepicker.formatDate('yy/mm/dd', view_date)+"'></input></div>"));
    content.append($("<div id='lightbox_time'><b>Time:</b>"+
        _generate_timepicker(start_hour, end_hour)+
        "</div>"));
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
    button_div.append($("<button id='lightbox_cancel' class='btn btn-default'>Cancel</button>"));
    button_div.append($("<button id='lightbox_save' class='btn btn-primary'>Save</button>"));

    content.append(button_div);

    // draw on screen
    _lightbox(content, 50);

    var availableNames = [];
    patientInfo.forEach(function(patient){availableNames.push(patient[1]);});
    console.log(availableNames);
    $( "#namepicker" ).autocomplete({
        source: availableNames//,
        // select: function (event, ui)
        // {
        //     //Checks the selected word
        //     //and appropriately populates the columns
        //     var selectedItem = ui.item;
        //     var guess = selectedItem.value;
        //     $("#namepicker").autocomplete("close");
            
        //     selectedItem.focus();
        // }
    });

    $( "#namepicker" ).autocomplete( "option", "appendTo", ".eventInsForm" );
    console.log("on the back");
    $('#datepicker').datepicker({ dateFormat: 'yy/mm/dd' });


    $("#lightbox_cancel").click(_closeLightbox);
    $("#lightbox_save").click(function(){

        if(($("#namepicker").val() == "") || ($("#timepicker").val() == "")){
            content.append($('<div class="alert">'+
            '<button type="button" class="close" data-dismiss="alert">&times;</button>'+
            '<strong>Error:</strong> Please fill in all fields. Thanks!'+
            '</div>'));}
        else if($.inArray($("#namepicker").val(), availableNames) == -1){
            content.append($('<div class="alert">'+
            '<button type="button" class="close" data-dismiss="alert">&times;</button>'+
            '<strong>Error:</strong> Please choose an existing patient'+
            '</div>'));
        }
        else {
        //new Appointment('ev', date_str, 11, 'Keertan Kini', 'Running exercises');
        queryForPatient = new Parse.Query(parsePatient);

        queryForPatient.equalTo("Name", $("#namepicker").val());
        var patient_name = $("#namepicker").val();
        var hour =  $("#timepicker").val();
        var date = $('#datepicker').val();
        queryForPatient.find({
          success: function(results) {
            //alert("Successfully retrieved " + results.length + " patient.");

            console.log(results[0]);

            var appointment = new parseAppointment();
            appointment.set("type", $('#lightbox_selected').val());
            appointment.set("date", $('#datepicker').val());
            appointment.set("time", Number($("#timepicker").val()));
            appointment.set("notes", $("#lightbox_input").val());
            //var patientObject = results[0];

            appointment.set("patient", results[0]);
            console.log(appointment);


            appointment.save(null, {
                  success: function(appointment) {
                    // Execute any logic that should take place after the object is saved.
                    //alert('New object created with objectId: ' + appointment.id);

                    _draw_date($.datepicker.formatDate('yy/mm/dd', view_date));
                    _closeLightbox();

                    _lightbox($("<div style='text-align: center'>You've added an appointment for "+
                        patient_name+
                        " at "+
                        _readable_hour(hour)+
                        " on "+
                        date+
                        "!</div>"), 5);
                  },
                  error: function(appointment, error) {
                    // Execute any logic that should take place if the save fails.
                    // error is a Parse.Error with an error code and description.
                    alert('Failed to create new appoinment, with error code: ' + error.description);
                  }
                });

                // console.log(appointment);
          },
          error: function(error) {
            alert("Save Appointment Error: " + error.code + " " + error.message);
          }
        });


        /////////////////////////////
        // var new_appt = new Appointment($('#lightbox_selected').val(),
        //     $('#datepicker').val(),
        //     $("#timepicker").val(),
        //     $("#namepicker").val(),
        //     $("#lightbox_input").val());


        }
    });
}

// display the lightbox for a certain jQuery DOM element content
// content = DOM element
// top = px from top
function _lightbox(content, top){

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

    // move the lightbox to the current window top + 100px
    //$('#lightbox').css('top', top + 'px');
    $('#lightbox').css('top', '100px');

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