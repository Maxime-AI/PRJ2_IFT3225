$(document).ready(function(){
  $("#table-faits").show();
  $("#consultation").hide();
  $("#jeux").hide();

  // Load pages
  createTable();
  computeInfo();

  // Events Handler
  onClick(".table-faits", ["#table-faits"], ["#consultation", "#jeux"]);
  onClick(".consultation", ["#consultation"], ["#table-faits", "#jeux"]);
  onClick(".jeux", ["#jeux"], ["#consultation", "#table-faits"]);
  search();

});

// Constructor Functions
var createTable = function(){
  var nodeTable = $('<table>');
  nodeTable.addClass("table center table-bordered table-info")

  var nodesTable = ["Start", "Relation", "End"];
  var node = $("<tr>");
  $.each(nodesTable, function(index, elem){
    node.append($("<th>").addClass("text-center").text(elem));
  });
  nodeTable.append(node);

  // Update Table with JSON data.
  $.getJSON('result.json', function(data){
    $.each(data.result, function(index, elem){

      var n = $("<tr>");
      $.each(elem, function(key, val){
        n.append($("<td>").addClass(val["@id"]).text(val["label"]));
      });
      nodeTable.append(n);
    });
  });

  $('#table').append(nodeTable);
}

var computeInfo = function(){
  var conceptDict = {count: 0};
  var relationDict = {count: 0};

  $.getJSON('result.json', function(data){
    $.each(data.result, function(index, elem){
      // Concept 'end' doesn't already exists.
      if(!conceptDict[elem["end"]["@id"]]){
        conceptDict[elem["end"]["@id"]] = true;
        conceptDict.count++;
      } else {
        conceptDict[elem["end"]["@id"]] = false;
        conceptDict.count--;
      }

      // Concept 'start' doesn't already exists.
      if(!conceptDict[elem["start"]["@id"]]){
        conceptDict[elem["start"]["@id"]] = true;
        conceptDict.count++;
      } else {
        conceptDict[elem["start"]["@id"]] = false;
        conceptDict.count--;
      }

      // Concept 'relation' doesn't already exists.
      if(!relationDict[elem["rel"]["@id"]]){
        relationDict[elem["rel"]["@id"]] = true;
        relationDict.count++;
      } else {
        relationDict[elem["rel"]["@id"]] = false;
        relationDict.count--;
      }
    });

    // Update informations
    $("#faits").text(data.result.length);
    $("#concepts").text(relationDict.count);
    $("#relations").text(conceptDict.count);
  });
}

// Events Handler Functions
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

var search = function(){
  /* TODO
      * avoir seulement fr et/ou en comme resultat
      * montrez les résultats avec un bouton prev et suiv qui effectue une autre requête qui se trouve dans le 'view'
      * updatez la table de faits
  */

  $("#submit").click(function(){
    // Search for concept and/or relation
    if ($("#rel").val() && $("#concept").val()) {
      $.get("https://api.conceptnet.io/query?rel=" + $("#rel").val() + "&node=" + $("#concept").val() + "&limit=1000")

    } else if ($("#concept").val()) {
      $.get("https://api.conceptnet.io/query?node=" + $("#concept").val() + "&limit=1000")

    } else if ($("#rel").val()) {
      $.get("https://api.conceptnet.io/query?rel=" + $("#rel").val() + "&limit=1000")
    }
  });
}

// TODO.. LEGACY CODE, COULD BE USEFUL.
//  $("#search").on("input", function(){
//    var node = "";
//    var rel = "";
//    // Search for concept or relation
//    $.get("https://api.conceptnet.io/query?rel=" + rel + "&node=" + node + "&limit=1000")
//
//    console.log($(this).val()); // TODO.. for debugging only.
//  });