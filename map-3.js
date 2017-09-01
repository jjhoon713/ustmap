mapImgVersion = "2";

function readTextFile(file) {
  var rawFile = new XMLHttpRequest();
  var allText;
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        allText = rawFile.responseText;
      }
    }
  }
  rawFile.send(null);
  return allText;
}

function getBuildingNames() {
  var buildings = ["Academic Building",
    "CYT",
    "IAS",
    "LSK",
    "Univ. Center",
    "Campus"
  ];
  return buildings;
}

function getFloorIds() {
  return ["LG7", "LG5", "LG4", "LG3", "LG1", "G", "1", "2", "3", "4", "5", "6", "7",
    "CYTG", "CYTUG", "CYT1", "CYT2", "CYT3", "CYT4", "CYT5", "CYT6", "CYT7",
    "IASG", "IAS1", "IAS2", "IAS3", "IAS4", "IAS5",
    "NABG", "NAB1", "NAB2", "NAB3", "NAB4", "NAB5", "NAB6", "NAB7",
    "UCG", "UC1",
    "Overall"
  ];
}

function getFloorIdsOfBuilding(buildingNo) {
  if (buildingNo == 0) {
    return ["LG7", "LG5", "LG4", "LG3", "LG1", "G", "1", "2", "3", "4", "5", "6", "7"];
  } else if (buildingNo == 1) {
    return ["CYTG", "CYTUG", "CYT1", "CYT2", "CYT3", "CYT4", "CYT5", "CYT6", "CYT7"];
  } else if (buildingNo == 2) {
    return ["IASG", "IAS1", "IAS2", "IAS3", "IAS4", "IAS5"];
  } else if (buildingNo == 3) {
    return ["NABG", "NAB1", "NAB2", "NAB3", "NAB4", "NAB5", "NAB6", "NAB7"];
  } else if (buildingNo == 4) {
    return ["UCG", "UC1"];
  } else if (buildingNo == 5) {
    return ["Overall"];
  }
}

function idToInfos(id) {
  if (id.includes("Overall")) {
    buildingNo = 5;
    floorNo = 0;
  } else if (id.includes('CYT')) {
    buildingNo = 1;
    floorNo = getFloorIdsOfBuilding(1).indexOf(id);
  } else if (id.includes('IAS')) {
    buildingNo = 2;
    floorNo = getFloorIdsOfBuilding(2).indexOf(id);

  } else if (id.includes('NAB')) {
    buildingNo = 3;
    floorNo = getFloorIdsOfBuilding(3).indexOf(id);

  } else if (id.includes('UC')) {
    buildingNo = 4;
    floorNo = getFloorIdsOfBuilding(4).indexOf(id);

  } else {
    buildingNo = 0;
    floorNo = getFloorIdsOfBuilding(0).indexOf(id);
  }

  return {
    buildingNo: buildingNo,
    floorNo: floorNo
  }
}

function getFloorNames(buildingNo) {
  if (buildingNo == 0) {
    return ["LG7", "LG5", "LG4", "LG3", "LG1", "G", "1", "2", "3", "4", "5", "6", "7"];
  } else if (buildingNo == 1) {
    return ["G", "UG", "1", "2", "3", "4", "5", "6", "7"];
  } else if (buildingNo == 2) {
    return ["G", "1", "2", "3", "4", "5"];
  } else if (buildingNo == 3) {
    return ["G", "1", "2", "3", "4", "5", "6", "7"];
  } else if (buildingNo == 4) {
    return ["G", "1"];
  } else if (buildingNo == 5) {
    return ["Overall"];
  }
}

function changeBuilding(building_num) {
  document.getElementById("building_btn").innerHTML = getBuildingNames()[building_num];

  floor = document.getElementById("floor_dropdown");
  while (floor.hasChildNodes()) {
    floor.removeChild(floor.lastChild);
  }
  floors = getFloorNames(building_num);
  for (i = 0; i < floors.length; i++) {
    li = document.createElement("li");
    a = document.createElement("a");
    var linkText = document.createTextNode(floors[i]);
    a.appendChild(linkText);
    li.appendChild(a);
    floor.appendChild(li);
    li.setAttribute("onclick", "changeFloor(" + building_num + "," + i + ");");
  }
  document.getElementById("floor_btn").innerHTML = floors[0];

  map.setCenter({
    lat: initLat,
    lng: initLng
  });
  map.setZoom(initZoom);

  return changeFloor(building_num, 0);
}


var markers = [];

function changeFloor(building_num, floor_num) {

  if (onlyMarker != null) {
    onlyMarker.setMap(null);
  }
  floors = getFloorNames(building_num);
  document.getElementById("floor_btn").innerHTML = floors[floor_num];
  changeMap(building_num, floor_num);

  text = readTextFile("data/" + building_num + floor_num).split('\n');
  lat_weight = parseFloat(text[0]);
  lat_bias = parseFloat(text[1]);
  lon_weight = parseFloat(text[2]);
  lon_bias = parseFloat(text[3]);

  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];


  $.ajax({
      type: "GET",
      url: "http://jchungaa.student.ust.hk/ustmap/getdataproxy.php?floor=" + getFloorIdsOfBuilding(building_num)[floor_num],
      xhr: function() {
        return xhr;
      }
    })
    .done(function(msg) {
      text = msg.split('\n');

      for (i = 0; i < text.length; i++) {
        elem = text[i].split(';');
        if (elem.length < 3) {
          continue;
        }

        number = elem[5];
        name = elem[1];
        if (name.substr(0, 4).toLowerCase() == "room") {
          name = name.substr(4);
        }
        if (name == 'null') {
          continue;
        }
        typ = elem[2];
        //desc = elem[3];
        x = parseFloat(elem[0].split(',')[0]);
        y = parseFloat(elem[0].split(',')[1]);
        page = elem[4];
        donno = elem[3];
        lat = y * lat_weight + lat_bias;
        lon = x * lon_weight + lon_bias;

        {
          zIndex = 0;
          if (typ.toLowerCase().includes('stair') || name.substr(0, 5) == "stair") {
            label = "";
            icon = "img/ic_stairs.png"
          } else if (typ.toLowerCase().includes('female')) {
            label = "";
            icon = "img/ic_ftoilet.png"
          } else if (typ.toLowerCase().includes('male')) {
            label = "";
            icon = "img/ic_mtoilet.png"
          } else if (typ.toLowerCase().includes('atm')) {
            label = "";
            icon = "img/ic_atm.png"
          } else if (typ.toLowerCase().includes('cross')) {
            label = "";
            icon = "img/ic_crossconnector.png"
          } else if (typ.toLowerCase().includes('fountain')) {
            label = "";
            icon = "img/ic_drinking.png"
          } else if (typ.toLowerCase().includes('escalator') || name.substr(0, 9) == "ESCALATOR") {
            label = "";
            icon = "img/ic_escalator.png"
          } else if (typ.toLowerCase().includes('express') || typ.toLowerCase().includes('virtual')) {
            label = "";
            icon = "img/ic_express.png"
          } else if (name.substr(0, 4) == "LIFT") {
            label = name.toLowerCase().replace('lift', "");
            icon = "img/ic_lift_bg.png";
            zIndex = 500*parseInt(label);
          } else if (typ.toLowerCase().includes('mail')) {
            label = "";
            icon = "img/ic_mailbox.png"
          } else if (typ.toLowerCase().includes('restaurant')) {
            label = "";
            icon = "img/ic_restaurant.png"
          } else if (typ.toLowerCase().includes('satellite printer')) {
            label = "";
            icon = "img/ic_printer.png";
          } else {
            label = name.replace(/ /g,'\n');
            icon = " ";
          }

        }

        if(icon == " "){
          newMarker = new MapLabel({
            text: label,
            position: new google.maps.LatLng(lat, lon),
            map: map,
            fontSize: 30,
            align: 'center',
            strokeWeight : 8
          });
        } else{
          newMarker = new google.maps.Marker({
            position: {
              lat: lat,
              lng: lon
            },
            clickable: false,
            cursor: "123",
            label: label,
            icon: {
              url: icon,
              // This marker is 20 pixels wide by 32 pixels high.
              scaledSize: new google.maps.Size(20, 20),
              size: new google.maps.Size(60, 60),
              // The origin for this image is (0, 0).
              origin: new google.maps.Point(0, 0),
              // The anchor for this image is the base of the flagpole at (0, 32).
              anchor: new google.maps.Point(10, 10),
              labelOrigin: new google.maps.Point(10, 10)
            },
            map: null,
            title: name,
            zIndex: zIndex
          });
        }


        markers.push(newMarker);



      }


      setMarkers();
    });


  return {
    latW: lat_weight,
    latB: lat_bias,
    lonW: lon_weight,
    lonB: lon_bias
  }
}

function initBuildingDropdowns() {
  building = document.getElementById("building_dropdown");
  while (building.hasChildNodes()) {
    building.removeChild(building.lastChild);
  }
  buildings = getBuildingNames();
  for (i = 0; i < buildings.length; i++) {
    li = document.createElement("li");
    a = document.createElement("a");
    linkText = document.createTextNode(buildings[i]);
    a.appendChild(linkText);
    li.appendChild(a);
    building.appendChild(li);
    li.setAttribute("onclick", "changeBuilding(" + i + ");");
  }
  document.getElementById("building_btn").innerHTML = buildings[0];
}

function returnXtimesTwoSquareY(x, y) {
  if (y >= 0) {
    return x * parseInt(Math.pow(2, y));
  } else
    return x / parseInt(Math.pow(2, -y));
}

function getSrc(building, floor, zoom, coord) {
  var iniZoom = 6;
  var iniTileX = 16;
  var iniTileY = 32;
  //
  return "" + building + "/" + floor + "/tile_" + parseInt(zoom - iniZoom) + "_" + (coord.x - returnXtimesTwoSquareY(iniTileX, zoom - iniZoom)) + "-" + (coord.y -
    returnXtimesTwoSquareY(
      iniTileY, zoom - iniZoom)) + ".png?"+mapImgVersion;
}

function changeMap(buildingNo, floorNo) {
  map.setMapTypeId(buildingNo + "" + floorNo);
}

function hideAllMarkers(abc, bound) {

  if (bound == null) {
    return;
  }

  cnt = 0;
  if (abc) {
    for (var i = 0; i < markers.length; i++) {
      if (!(markers[i].getIcon().url.includes('lift')||markers[i].getIcon().url.includes('toilet'))) {
        markers[i].setMap(null);
      } else {
        if (markers[i].getMap() == null) {
          markers[i].setMap(map);
        }
      }
    }
  } else {
    for (var i = 0; i < markers.length; i++) {
      markerPos = markers[i].getPosition();
      if (bound.contains(markerPos)) {
        cnt = cnt + 1;
        if (markers[i].getMap() == null) {
          markers[i].setMap(map);
        }
      } else {
        markers[i].setMap(null);
      }
    }
  }
}

function searchFocusIn() {
  document.getElementById("search_card").style.visibility = "visible";
}

function searchFocusOut() {
  document.getElementById("search_card").style.visibility = "hidden";
}

function goToPin(room, x, y, strr) {

  saveCookie(strr);

  //saveCookie(strr);


  changeBuilding(idToInfos(room).buildingNo);
  var res = changeFloor(idToInfos(room).buildingNo, idToInfos(room).floorNo);
  lat = y * res.latW + res.latB;
  lon = x * res.lonW + res.lonB;
  map.setCenter({
    lat: lat,
    lng: lon
  });
  map.setZoom(8);
  searchFocusOut();
  addMarker({
    lat: lat,
    lng: lon
  }, map);

}

var onlyMarker;

function addMarker(location, map) {
  // Add the marker at the clicked location, and add the next-available label
  // from the array of alphabetical characters.

  if (onlyMarker != null) {
    onlyMarker.setMap(null);
  }

  marker = new google.maps.Marker({
    position: location,
    label: "",
    map: map,
    optimized: false,
    zIndex: 99999999,
    icon: {
      url: "img/ic_here.png",
      // This marker is 20 pixels wide by 32 pixels high.
      size: new google.maps.Size(48, 48),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(24, 24),
      labelOrigin: new google.maps.Point(24, 24)
    }
  });

  marker.addListener('click', function() {
    marker.setMap(null);
  });

  onlyMarker = marker;
}

function isCardEmpty() {

  text = document.getElementById("search").value;
  cardIsEmpty(text.length == 0);
}

function searchChange() {
  xhr.abort();
  text = document.getElementById("search").value;

  cardIsEmpty(text.length == 0);


  pgbar = document.getElementById("pgbar");
  pgbar.hidden = false;
  if (text.length == 0) {
    pgbar.hidden = true;
    return;
  }

  var myNode = document.getElementById("search_results");
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }
  if (text.length != 0) {
    var req = $.ajax({
        type: "GET",
        url: "http://jchungaa.student.ust.hk/ustmap/searchproxy.php?keyword=" + text,
        xhr: function() {
          return xhr;
        }
      })
      .done(function(msg) {
        cnt = 0;
        msg.split('\n').forEach(function(entry) {
          msges = entry.split(';');

          if (entry.length == 0)
            return;

          if (msges.length < 2) {
            return;
          }

          if (cnt > 4) {
            return;
          }

          cnt = cnt + 1;
          one = document.createElement('div');
          one.classList.add('col');
          one.classList.add('s12');

          two = document.createElement('a');
          abc = 1
          two.setAttribute("onclick", "goToPin('" + msges[3] + "'," + msges[2] + ",`" + entry + "`);");
          two.classList.add('valign-wrapper');

          threeone = document.createElement('div');
          threeone.classList.add('col');
          threeone.classList.add('s1');
          threeone.classList.add('center-align');
          threeone.style = "padding:0px";

          threetwo = document.createElement('div');
          threetwo.innerHTML = getBuildingNames()[idToInfos(msges[3]).buildingNo];
          threetwo.style = "line-height: 1.1";
          threetwo.classList.add('col');
          threetwo.classList.add('s5');
          threetwo.classList.add('center-align');

          threethree = document.createElement('div');
          threethree.style = "line-height: 1.1";
          threethree.classList.add('col');
          threethree.classList.add('s6');
          threethree.innerHTML = msges[0];

          icon = document.createElement('i');
          icon.classList.add('material-icons');
          icon.innerHTML = "location_on";

          threeone.appendChild(icon);
          two.appendChild(threeone);
          two.appendChild(threetwo);
          two.appendChild(threethree);
          one.appendChild(two);

          document.getElementById("search_results").appendChild(one);
        })
        if (cnt == 0) {
          document.getElementById('search_results').innerHTML = "There are no result with " + text;
        }
        pgbar.hidden = true;
      });

  } else {
    pgbar.hidden = true;
  }
}

function saveCookie(strr) {

  till = 4;
  for (i = 0; i < 4; i++) {
    if (Cookies.get('room' + i) == strr) {
      till = i;
      break;
    }
  }

  for (i = till; i > 0; i--) {
    Cookies.set('room' + i, Cookies.get('room' + (i - 1)));
  }
  Cookies.set('room' + 0, strr);
}

function cardIsEmpty(abc) {
  if (abc) {
    if (Cookies.get('room0') == null || Cookies.get('room0') == "undefined") {
      document.getElementById("empty_card").style.display = "block";
      document.getElementById("searches").style.display = "none";
      document.getElementById("historys").style.display = "none";
    } else {
      document.getElementById("searches").style.display = "none";
      document.getElementById("empty_card").style.display = "none";
      document.getElementById("historys").style.display = "inline";
      showHistory();
    }
  } else {
    document.getElementById("searches").style.display = "inline";
    document.getElementById("empty_card").style.display = "none";
    document.getElementById("historys").style.display = "none";
  }
}

function showHistory() {

  var myNode = document.getElementById("history_results");
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }

  for (i = 0; i < 5; i++) {
    entry = Cookies.get('room' + i);
    if (entry == null || entry == "undefined") {
      return;
    }

    msges = entry.split(';');

    if (entry.length == 0)
      return;

    one = document.createElement('div');
    one.classList.add('col');
    one.classList.add('s12');

    two = document.createElement('a');
    two.setAttribute("onclick", "goToPin('" + msges[3] + "'," + msges[2] + ",`" + entry + "`);");
    two.classList.add('valign-wrapper');

    threeone = document.createElement('div');
    threeone.classList.add('col');
    threeone.classList.add('s1');
    threeone.classList.add('center-align');
    threeone.style = "padding:0px";

    threetwo = document.createElement('div');
    threetwo.innerHTML = getBuildingNames()[idToInfos(msges[3]).buildingNo];
    threetwo.style = "line-height: 1.1";
    threetwo.classList.add('col');
    threetwo.classList.add('s5');
    threetwo.classList.add('center-align');

    threethree = document.createElement('div');
    threethree.style = "line-height: 1.1";
    threethree.classList.add('col');
    threethree.classList.add('s6');
    threethree.innerHTML = msges[0];

    icon = document.createElement('i');
    icon.classList.add('material-icons');
    icon.innerHTML = "search";

    threeone.appendChild(icon);
    two.appendChild(threeone);
    two.appendChild(threetwo);
    two.appendChild(threethree);
    one.appendChild(two);

    document.getElementById("history_results").appendChild(one);
  }



}

function removeHistory() {
  for (i = 0; i < 5; i++) {
    Cookies.set('room' + i, "undefined");
  }
  isCardEmpty();
}

function setMarkers() {

  if (map == null) {
    return;
  }

  if (map.getMapTypeId()[0] == 0) {
    maxZoom = 9;
  } else {
    maxZoom = 8;
  }
  if (map.getZoom() < maxZoom - 1) {
    hideAllMarkers(true, map.getBounds());
    return;
  } else {
    hideAllMarkers(false, map.getBounds());
  }
}
