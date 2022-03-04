$(document).ready(function(){
  var nodeTable = $('<table>');
  nodeTable.addClass("table center table-bordered table-striped table-responsive table-info")

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

  $('#main').append(nodeTable);
});