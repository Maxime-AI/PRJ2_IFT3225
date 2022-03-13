$(document).ready(function(){
  $("#table-faits").show();
  $("#consultation").hide();
  $("#jeux").hide();

  // Set JSON to local storage.
  getInfo();

  // Load pages
  createTableDeFaits();
  computeInfo();

  // Disable OUI/NON buttons
  $("button.oui").prop("disabled", true);
  $("button.non").prop("disabled", true);

  // Events Handler
  onClick(".table-faits", ["#table-faits"], ["#consultation", "#jeux"]);
  onClick(".consultation", ["#consultation"], ["#table-faits", "#jeux"]);
  onClick(".jeux", ["#jeux", "#oui-non"], ["#consultation", "#table-faits", "#consigne", "#qui-suis-je"]);

  onClick(".oui-non", ["#oui-non"], ["#consigne", "#qui-suis-je"]);
  onClick(".consigne", ["#consigne"], ["#oui-non", "#qui-suis-je"]);
  onClick(".qui-suis-je", ["#qui-suis-je"], ["#oui-non", "#consigne"]);

  onClickGame(".start-oui-non");
  onClickGame(".start-consigne");
  onClickGame(".start-qui-suis-je");

  consultation();

});

/******************* Constructor Functions *******************/
var createTableDeFaits = function(){
  var nodeTable = $('<table>');
  nodeTable.addClass("table center table-bordered table-info")

  var nodesTable = ["Start", "Relation", "End"];
  var node = $("<tr>");
  $.each(nodesTable, function(index, elem){
    node.append($("<th>").addClass("text-center").text(elem));
  });
  nodeTable.append(node);

  // Update Table with JSON data.
  $.each(JSON.parse(localStorage["result"]), function(index, elem){

    var n = $("<tr>");
    $.each(elem, function(key, val){
      n.append($("<td>").addClass(val["@id"]).text(val["label"]));
    });
    nodeTable.append(n);
  });

  $('#table').append(nodeTable);
}

var createTableConsultation = function(data){
  // Remove table
  $("#consultation table").remove();

  var nodeTable = $('<table>');
  nodeTable.addClass("table table-bordered table-info");

  var nodesTable = ["Start", "Relation", "End"];
  var node = $("<tr>");
  $.each(nodesTable, function(index, elem){
    node.append($("<th>").addClass("text-center").text(elem));
  });
  nodeTable.append(node);

  // Update Table with JSON data.
  $.each(data["edges"], function(index, elem){
    var n = $("<tr>");
    n.append($("<td>").addClass(elem["start"]["@id"]).text(elem["start"]["label"]));
    n.append($("<td>").addClass(elem["rel"]["@id"]).text(elem["rel"]["label"]));
    n.append($("<td>").addClass(elem["end"]["@id"]).text(elem["end"]["label"]));

    nodeTable.append(n);
  });

  $('#consultation div.table').append(nodeTable);

  // TODO.. review this
  // Update Table de Faits
  var nodeTable = $('#table .table');
  $.each(data["edges"], function(index, elem){
    console.log(elem);
    var n = $("<tr>");
    n.append($("<td>").addClass(elem["start"]["@id"]).text(elem["start"]["label"]));
    n.append($("<td>").addClass(elem["rel"]["@id"]).text(elem["rel"]["label"]));
    n.append($("<td>").addClass(elem["end"]["@id"]).text(elem["end"]["label"]));
    nodeTable.append(n);
  });
  computeInfo();
}

// Put result.json data inside local storage.
var getInfo = function() {
  $.getJSON('result.json', function(data){
    $.each(data.result.edges, function(index, elem){
      var start = {"@id": elem["start"]["@id"], "label": elem["start"]["label"]};
      var rel = {"@id": elem["rel"]["@id"], "label": elem["rel"]["label"]};
      var end = {"@id": elem["end"]["@id"], "label": elem["end"]["label"]};

      data.result.push({"start": start, "rel": rel, "end": end});
    });
    window.localStorage.setItem("result", JSON.stringify(data.result));
  });
}

// Compute nombre de faits, nombre de concepts différents and nombre de relations
// différentes.
var computeInfo = function(){
  var conceptDict = {count: 0};
  var relationDict = {count: 0};

  $.each(JSON.parse(localStorage["result"]), function(index, elem){
    // Concept 'end' doesn't already exists.
    if(!conceptDict[elem["end"]["@id"]]){
      conceptDict[elem["end"]["@id"]] = true;
      conceptDict.count++;
    }

    // Concept 'start' doesn't already exists.
    if(!conceptDict[elem["start"]["@id"]]){
      conceptDict[elem["start"]["@id"]] = true;
      conceptDict.count++;
    }

    // Concept 'relation' doesn't already exists.
    if(!relationDict[elem["rel"]["@id"]]){
      relationDict[elem["rel"]["@id"]] = true;
      relationDict.count++;
    }
  });

  // Update informations
  $("#faits").text(JSON.parse(localStorage["result"]).length);
  $("#concepts").text(conceptDict.count);
  $("#relations").text(relationDict.count);
}


/******************* Events Handler Functions *******************/
var onClick = function(button, toShow, toHide){
  $(button).click(function(){
    $.each(toHide, function(index, elem){
      $(elem).hide();
    });

    $.each(toShow, function(index, elem){
      $(elem).show();
    });
  });
}

var onClickGame = function(button){
  $(button).click(function(){
    switch(button) {
      case ".start-oui-non":
        ouiNonGame();
        break;
      case ".start-consigne":
        consigneGame();
        break;
      case ".start-qui-suis-je":
        quiSuisJeGame();
        break;
    }
  });
}

var onClickAnswer = function(button, timeout){
  $(button).click(function(){
    if($(button).val() == "true"){
      $("p.oui-non").text("Success!");
    } else {
      $("p.oui-non").text("Better Luck Next Time!");
    }

    clearTimeout(timeout);
    // Disable OUI/NON buttons
    $("button.oui").prop("disabled", true);
    $("button.non").prop("disabled", true);

    // Enable Start button
    $("button.start-oui-non").prop("disabled", false);
  });
}

/******************* Consultation's Logic *******************/
// This function handles the GET request for the query and changes
// the Interface de Consultation depending on the return value.
var search = function(query){
  var result = null;

  // Search for concept and/or relation
  $.ajax({
    type: 'GET',
    url: query,
    async: false,
    success: function(data){
      console.log(data);
      result = updateData(data);

    },
    error: function(XMLHttpRequest, status, err){
      console.log(XMLHttpRequest);
    }
  });

  createTableConsultation(result);
  if(result["view"]){
    $("#consultation nav").show();

    if(result["view"]["nextPage"]){
      $("#consultation .next").show();
    } else {
      $("#consultation .next").hide();
    }

    if(result["view"]["previousPage"]){
      $("#consultation .prev").show();
    } else {
      $("#consultation .prev").hide();
    }
  }

  return result;
}

// This function updates the JSON file and returns only french and/or english results.
var updateData = function(data){
  // Filter the edges to only keep french and/or english result.
  var edges = [];
//  var jsonData = JSON.parse(localStorage["result"]);
  $.each(data["edges"], function(index, elem){
    if(elem["start"]["language"] == "fr" || elem["start"]["language"] == "en"){
      edges.push(elem);
//      jsonData.push(elem);
    }
  });
  data["edges"] = edges;

  // Modify data for the localStorage format
  var jsonData = JSON.parse(localStorage["result"]);
  $.each(data["edges"], function(index, elem){
    var start = elem["start"];
    var rel = elem["rel"];
    var end = elem["start"];
    jsonData.push({"start": {"@id": start["@id"],"label": start["label"]}, "rel": {"@id": rel["@id"], "label": rel["label"]}, "end": {"@id": end["@id"], "label": end["label"]}});
  });

  // Update Local Storage data.
  window.localStorage.setItem("result", JSON.stringify(jsonData));
  console.log(localStorage["result"]);

  return data;
}

var consultation = function() {
  // Disable Nav bar.
  $("#consultation nav").hide();

  var data = null;
  $("#submit").click(function(){
    // Disable Nav bar.
    $("#consultation nav").hide();
    $("#consultation .next").hide();
    $("#consultation .prev").hide();

    // Build the query.
    const query = (($("#rel").val() != "") ? "rel=" + $("#rel").val() : "")
                  + ((($("#rel").val() != "") && ($("#concept").val() != "")) ? "&" : "")
                  + (($("#concept").val() != "") ? "node=" + $("#concept").val() : "");
    const httpsQuery = "https://api.conceptnet.io/query?" + query + "&limit=1000";
    data = search(httpsQuery);
  });

  $("#consultation .next").click(function(){
    data = search("https://api.conceptnet.io/" + data["view"]["nextPage"]);
  });

  $("#consultation .prev").click(function(){
    data = search("https://api.conceptnet.io/" + data["view"]["previousPage"]);
  });
}

/******************* Game's Logic *******************/
var ouiNonGame = function(){
  // Disable Start button
  $("button.start-oui-non").prop("disabled", true);

  // Enable OUI/NON buttons
  $("button.oui").prop("disabled", false);
  $("button.non").prop("disabled", false);

  var timeout = setTimeout(function(){
    // Show times up alert
    $("p.oui-non").text("Time's Up!");

    // Disable OUI/NON buttons
    $("button.oui").prop("disabled", true);
    $("button.non").prop("disabled", true);

    // Enable Start button
    $("button.start-oui-non").prop("disabled", false);
  }, 60000);

  // Randomly get a fait
  var index = Math.floor(Math.random() * JSON.parse(localStorage["result"]).length);
  var fait = JSON.parse(localStorage["result"])[index];

  // Randomly decides if it's going to be Oui or Non
  if (Math.random() < 0.5) {
    // Show question
    $("p.oui-non").text(fait["start"]["label"] + " " + fait["rel"]["label"] + "? " + fait["end"]["label"]);

    // Set value to Oui/Non button
    $("button.oui").val(true);
    $("button.non").val(false);

  } else {
    // Change the End node
    var i = Math.floor(Math.random() * JSON.parse(localStorage["result"]).length);
    var end = JSON.parse(localStorage["result"])[i]["end"];

    // Show question
    $("p.oui-non").text(fait["start"]["label"] + " " + fait["rel"]["label"] + "? " + end["label"]);

    // Set value to Oui/Non button
    $("button.oui").val(false);
    $("button.non").val(true);
  }

  onClickAnswer("button.oui", timeout);
  onClickAnswer("button.non", timeout);
}

var consigneGame = function(){
  // Enable Answer button
  $("button.consigne-answer").prop("disabled", false);

  // Disable Start button
  $("button.start-consigne").prop("disabled", true);

  // Hide <div> answers
  $("div.consigne-answers").hide();

  // Remove ul
  $("div.consigne-answers > ul").remove();

  var timeout = setTimeout(function(){
    // Show answers
    $("div.consigne-answers").show();

    // Disable Answer button
    $("button.consigne-answer").prop("disabled", true);

    // Enable Start button
    $("button.start-consigne").prop("disabled", false);

  }, 60000);

  // Create a dictionary with all {start : {rel, ends:{}}}
  const tmp = {};
  $.each(JSON.parse(localStorage["result"]), function(index, elem){

    // Concept 'end' doesn't already exists.
    if(!tmp[elem["start"]["label"]]){
      var ends = {};
      ends[elem["end"]["label"]] = true;
      tmp[elem["start"]["label"]] = {"isMore": false, "rel": elem["rel"]["label"], "ends": {}};
      tmp[elem["start"]["label"]]["ends"] = ends;
    } else {
      tmp[elem["start"]["label"]]["isMore"] = true;
      tmp[elem["start"]["label"]]["ends"][elem["end"]["label"]] = true;
    }
  });

  var dict = {};
  $.each(tmp, function(key, val){
    if(val["isMore"] && (Object.keys(val["ends"]).length > 1)){
      dict[key] = val;
    }
  });

  const keys = Object.keys(dict);
  const index = Math.floor(Math.random() * keys.length);

  // Show question
  const question = keys[index];
  const dictAnswers = dict[question]["ends"]; // Dictionary of answers
  $("p.consigne").text(question + " " + dict[question]["rel"] + "?");

  // Build Answers but hide it.
  var ul = $("<ul>").addClass("list-group list-group-flush");
  $.each(dictAnswers, function(key, val){
    var li = $("<li>").addClass("list-group-item text-center text-capitalize").text(key);
    ul.append(li);
  });
  $("div.consigne-answers").append(ul);

  // User clicks on answer button.
  $("button.consigne-answer").click(function(){
    // Check input answer
    var val = $("input.consigne-answer").val();

    // Remove input answer
    $("input.consigne-answer").val("");

    if(dictAnswers[val]) {
      $('li:contains("'+ val + '")').addClass("text-success"); // User give that answer!
    }
  });
}

var quiSuisJeTime = (dictRel, index = 1) => () => {
  const colors = ["text-info", "text-success", "text-warning", "text-danger"]

  var start = ((dictRel[index]["start"] === undefined) ? "????" : dictRel[index]["start"]);
  var rel = dictRel[index]["rel"];
  var end = ((dictRel[index]["end"] === undefined) ? "????" : dictRel[index]["end"]);
  $("ul.qui-suis-je").append($("<li>").addClass("list-group-item text-center text-capitalize " + colors[index]).text(start + " " + rel + " " + end));

  index = index + 1;
}

var quiSuisJeGame = function(){
  // Enable Answer button
  $("button.qui-suis-je-answer").prop("disabled", false);

  // Disable Start button
  $("button.start-qui-suis-je").prop("disabled", true);

  // Remove <p> text
  $("p.qui-suis-je").text("");

  // Remove ul
  $("ul.qui-suis-je > li").remove();

  // Create a dictionary with all {start : {rel, ends:{}}}
  const tmp = {};
  $.each(JSON.parse(localStorage["result"]), function(index, elem){

    // Concept 'end' doesn't already exists.
    if(!tmp[elem["start"]["label"]]){
      tmp[elem["start"]["label"]] = {"isMore": false, "relations": [{"rel": elem["rel"]["label"], "end": elem["end"]["label"]}]};
    } else {
      tmp[elem["start"]["label"]]["isMore"] = true;
      tmp[elem["start"]["label"]]["relations"].push({"rel": elem["rel"]["label"], "end": elem["end"]["label"]});
    }

    if(!tmp[elem["end"]["label"]]){
      tmp[elem["end"]["label"]] = {"isMore": false, "relations": [{"start": elem["start"]["label"], "rel": elem["rel"]["label"]}]};
    } else {
      tmp[elem["end"]["label"]]["isMore"] = true;
      tmp[elem["end"]["label"]]["relations"].push({"start": elem["start"]["label"], "rel": elem["rel"]["label"]});
    }
  });

  var dict = {};
  $.each(tmp, function(key, val){
    if(val["isMore"] && (Object.keys(val["relations"]).length >= 5)){
      // TODO.. deal with duplicates
      dict[key] = val;
    }
  });

  const keys = Object.keys(dict);
  const index = Math.floor(Math.random() * keys.length);
  const node = keys[index];

  // Get relations array
  const dictRel = dict[node]["relations"];

  var start = ((dictRel[0]["start"] === undefined) ? "????" : dictRel[0]["start"]);
  var rel = dictRel[0]["rel"];
  var end = ((dictRel[0]["end"] === undefined) ? "????" : dictRel[0]["end"]);
  $("ul.qui-suis-je").append($("<li>").addClass("list-group-item text-center text-capitalize text-primary").text(start + " " + rel + " " + end));

  var interval = setInterval(quiSuisJeTime(dictRel), 20000);
  var timeout = setTimeout(clearInterval, 60000, interval);
  var timeout2 = setTimeout(function(){   // Time Out!
    $("p.qui-suis-je").text("Time Out!");

    // Disable Answer button
    $("button.qui-suis-je-answer").prop("disabled", true);

    // Enable Start button
    $("button.start-qui-suis-je").prop("disabled", false);

  }, 80000);

  // User clicks on answer button.
  $("button.qui-suis-je-answer").click(function(){
    // Check input answer
    var val = $("input.qui-suis-je-answer").val();

    // Remove input answer
    $("input.qui-suis-je-answer").val("");

    if(val == node) {
      clearInterval(interval);
      clearTimeout(timeout);
      clearTimeout(timeout2);

      $("p.qui-suis-je").text((8 - $("#qui-suis-je ul li").length)+" Points!");

      // Disable Answer button
      $("button.qui-suis-je-answer").prop("disabled", true);

      // Enable Start button
      $("button.start-qui-suis-je").prop("disabled", false);
    }
  });
}