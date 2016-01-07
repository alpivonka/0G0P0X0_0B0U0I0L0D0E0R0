
var map;
var ov_map;
var arRoutes = new Array();
var currentGPX;
var l;
var gsUnits;
var gbLines=true;

function load() {
    if (GBrowserIsCompatible()) {
        //map = new GMap2(document.getElementById("map"), {draggableCursor: 'pointer', draggingCursor: 'hand'});
		map = new google.maps.Map(document.getElementById("map"), {draggableCursor: 'pointer', draggingCursor: 'hand'});
		goHome();
        gsUnits=getCookie('mgoUnits')||'m';
        updateToolsDialogUnits();
		
        //map.addControl( new GLargeMapControl());
        //map.addControl( new GScaleControl(135) );
        //map.addControl( new GMapTypeControl() );
		alert("Google Map loaded");
	map.addMapType(G_PHYSICAL_MAP); 
	map.enableScrollWheelZoom();
      
	addWMSLayers();
        GEvent.addListener(map, "click", function(marker, point) {
            close_popup('xmlsave-box');
            close_popup('about-box');	
            close_popup('xmlload-box');
                if (marker) {
			 
			  showBalloon(marker);
			
                } else {
			if(currentGPX != undefined){
			    if (currentGPX.arPoints.length<1000){ //optimistic :)
				// add a marker
				point.array_index = currentGPX.arPoints.length;
				currentGPX.arPoints.push(point);
				currentGPX.arComments.push("");                                                                                                  
				var sWaypointName;
				var marker=createMarker(point, currentGPX.arPoints.length-1);
				currentGPX.arMarkers.push(marker);
				map.addOverlay(marker);
				marker.enableDragging();
				changeText();
				focusTextBox(marker.MCD_ID);
				updateDisplay();
				
			    }else{
				    alert("You have created a 1000 points. This is the limit allowed. Please either save off your work by selecting GPX or delete unneeded points.");
			    }
			}else{
				show_gpxType_box();
			}
                }
        });
        //setTimeout("positionOverview("+(screen_width-410)+","+ ((screen_height/2)-10) +")",1);
    }else{
      alert("Sorry, the Google Maps API is not compatible with this browser");
    }
    obj=document.getElementById("txtRouteName");
    obj.focus();
    obj.select();
    loadStates();
}



function deleteMarker(marker_id){
	
    map.closeInfoWindow();
    map.removeOverlay(currentGPX.arMarkers[marker_id]);
    map.removeOverlay(currentGPX.gLine);
    currentGPX.arPoints.splice(marker_id,1);
    currentGPX.arMarkers.splice(marker_id,1);
    currentGPX.arComments.splice(marker_id,1);
    // reset the marker IDs
    for(i=0; i<currentGPX.arMarkers.length; i++){
        currentGPX.arMarkers[i].MCD_ID=i;
    }
    changeText();
    drawRoute();
    updateDisplay();
}

function showBalloon(marker){
	if(currentGPX != undefined){
	  checkCurrentGPX4Marker(marker);
	}
	if (marker != undefined){
	    var sHTML="Waypoint " + marker.MCD_ID;
	    if(currentGPX.arComments[marker.MCD_ID] != undefined){
		    if(currentGPX.arComments[marker.MCD_ID].length>0) sHTML += ": " + currentGPX.arComments[marker.MCD_ID];
	    }
	    sHTML += "<BR><BR><a href='javascript:deleteMarker(" + marker.MCD_ID + ");'>Delete this waypoint</a>";
	    if(marker.MCD_ID < (currentGPX.arMarkers.length-1)){
		sHTML += "<BR><a href='javascript:insertMarkerAfter(" + marker.MCD_ID + ");'>Insert waypoint after this one</a>";
	    }
	    sHTML += "<BR><a href='javascript:centreMap(" + marker.MCD_ID + ");'>Centre map around here</a>";
	    marker.openInfoWindowHtml(sHTML);
	}else{
		//alert("Marker is undefined ");
	}
}

function centreMap(markerID){
    map.setCenter(new GLatLng(currentGPX.arPoints[markerID].y, currentGPX.arPoints[markerID].x));
}

function positionOverview(x,y) {
    var omap=document.getElementById("map_overview");
    omap.style.left = x+"px";
    omap.style.top = y+"px";
            
    // == restyling ==
    omap.firstChild.style.border = "1px solid gray";

    omap.firstChild.firstChild.style.left="4px";
    omap.firstChild.firstChild.style.top="4px";
    omap.firstChild.firstChild.style.width="280px";
    omap.firstChild.firstChild.style.height=(screen_height/2)-30+"px";
}
function drawRoutes(yo){
	alert(yo);
	drawRoute();	
}

function drawRoute(){
	if(currentGPX != null){
	    map.removeOverlay(currentGPX.gLine);
	   // if(!gbLines) return;
	   if(currentGPX.gpxType == 1){
	    currentGPX.gLine=new GPolyline(currentGPX.arPoints,color="green");
	   }else if (currentGPX.gpxType== 2){
	     currentGPX.gLine=new GPolyline(currentGPX.arPoints,color="black");
	   }else{
	      currentGPX.gLine=new GPolyline(currentGPX.arPoints,color="green");
	   }
	    try{
	     // gLine.enableDrawing( new GPolyEditingOptions(999,true));
	      map.addOverlay(currentGPX.gLine);
	    }
	    catch(e){
	      //The above line dies in IE...
	    }
	}
}


function save_text(nIndex, sText){
    currentGPX.arComments[nIndex]=sText.toUpperCase();
}

function find_waypoint(n){
    //alert("find waypoint "+ n);
    map.setCenter(new GLatLng(currentGPX.arPoints[n].y, currentGPX.arPoints[n].x));
    showBalloon(currentGPX.arMarkers[n]);
    //focusTextBox(n);
}

function changeText() {
    var sHTML="<table cellspacing='0px'>";
    var totalKs=0;
    var totalMs=0;
    for(var i=0; i<currentGPX.arPoints.length; i++){
        var maxCmtLen;
        if (i<10) {
            maxCmtLen=6;
        }else if(i<100){
            maxCmtLen=5;
        }else{
            maxCmtLen=4;
        }
        sHTML+="<tr><td align='left'>";
        if (i>0){
	    var marker1 = currentGPX.arMarkers[i];
	    var marker2 = currentGPX.arMarkers[i-1];
	    if(marker1 != undefined && marker2 != undefined){
		    var metres=marker1.getPoint().distanceFrom(marker2.getPoint());
		    totalKs+=(metres * 0.001);
		    totalMs=(totalKs * 0.621371192);
	    }
        }
        sHTML += "<a href='javascript:find_waypoint(" + i + ");' title='Click to locate waypoint on map'> " +
        (i) + "</a></td><td>:  <input type='text' " +
        " id='txtWaypoint" + i + "' " +
        " class='waypoint_text' name='waypoint_" + i + "' " +
        "onkeyup=save_text(" + i + ",this.value) " +
        "onfocus=highlightTextBox(this) " +
        "onblur=highlightTextBox(this) " +
        "size='8' maxlength='" + maxCmtLen + "' " +
        "value='" + currentGPX.arComments[i] + "'>";
        if(gsUnits=='m'){
            sHTML+="<span title='" + totalKs.toFixed(2) + " Km'> (" + totalMs.toFixed(2) + " miles)</span><br>";
        }else{
            sHTML+="<span title='" + totalMs.toFixed(2) + " miles'> (" + totalKs.toFixed(2) + " Km)</span><br>";
        }
        sHTML+="</td></tr>";
    }
    sHTML+="</table>";
   // var coords=document.getElementById('coords');
    //coords.innerHTML="<b>Waypoints:</b><br>" + sHTML;
    //focusTextBox(currentGPX.arPoints.length-1);
}

/*
  We need to keep track of markers and ensure that if there are multiple GPXLines that
  the marker we are working with exists within the currentGPX, if not change the currentGPX to the GPXLine
  that does contain the marker.
  
  This allow us to work with mutiple GPXLines
*/
function checkCurrentGPX4Marker(marker){
	if(!currentGPX.containsMarker(marker)){
	    for(var i = 0; i<arRoutes.length; i++){
		var gpx = arRoutes[i];
		 //debugObject(gpx);
		if(gpx.containsMarker(marker)){
		    currentGPX = gpx;
		    break;
		}
	    }
	}	
	
}

function createMarker(point,number) {
	var marker = new GMarker(point, {draggable:true, bouncy:false, title:""});
    marker.MCD_ID=number;
    GEvent.addListener(marker, "dragend", function() {
        currentGPX.arPoints[marker.MCD_ID]=marker.getPoint();
        //changeText();
        //focusTextBox(marker.MCD_ID);
        drawRoute();
    });
    GEvent.addListener(marker, "dragstart", function(){
	checkCurrentGPX4Marker(marker);
        map.removeOverlay(currentGPX.gLine);
        map.closeInfoWindow();
    });
   // GEvent.addListener(marker, "mouseover", function() {
    //    focusTextBox(marker.MCD_ID);
    //});       
    drawRoute();
    return marker;
}

function focusTextBox(sID){
    //changeText();
    obj=document.getElementById("txtWaypoint" + sID);
    if(obj){
        obj.focus();
        obj.select();
        obj.style.backgroundColor = "#FFFF88";
    }
}
function highlightTextBox(obj){
    if(obj.style.backgroundColor==""){
        obj.style.backgroundColor="#FFFF88"
    }else{
        obj.style.backgroundColor="";
    }
}



function check_for_escape(e, sPopupID){
    if (e.keyCode==27) {
        close_popup(sPopupID);
        obj=document.getElementById("gpxButton");
        obj.focus();
    }
}
//start

function clearRoute(bConfirm){
    if(bConfirm){
        if(! confirm("Are you sure you want to delete all routes and tracks?")) return;
    }    
    
    currentGPX = null;
    arRoutes = new Array();
    //changeText();
    var obj=document.getElementById("txtRouteName");
    if(obj){
        obj.value="New Route";
        obj.focus();
        obj.select();
    }
    map.clearOverlays();
    drawRoute();
}

function insertMarkerAfter(afterWaypoint){
    // this routine inserts a waypoint after another waypoint 
    var newX=currentGPX.arPoints[afterWaypoint].x + (currentGPX.arPoints[afterWaypoint+1].x-currentGPX.arPoints[afterWaypoint].x)/2;
    var newY=currentGPX.arPoints[afterWaypoint].y + (currentGPX.arPoints[afterWaypoint+1].y-currentGPX.arPoints[afterWaypoint].y)/2;
    var point=new GPoint(newX, newY);
    currentGPX.arPoints.splice(afterWaypoint+1, 0,  point);
    currentGPX.arComments.splice(afterWaypoint+1, 0,  "");
    var mk=createMarker(point, afterWaypoint+1);
    currentGPX.arMarkers.splice(afterWaypoint+1, 0, mk);
    for(var i=0; i<currentGPX.arMarkers.length; i++){
        currentGPX.arMarkers[i].MCD_ID=i;
    }
    map.addOverlay(mk);
    mk.enableDragging();
    //changeText();
    focusTextBox(mk.MCD_ID);
    showBalloon(mk);
    //arMarkers[afterWaypoint+1].openInfoWindowHtml("New waypoint");
    drawRoute();
    close_popup("options-box");
    updateDisplay();

}

function updateDisplay(){
	document.getElementById("wayPointCount").innerHTML  = currentGPX.arMarkers.length	
}

function changeUnits(){
    // toggle the displayed distances from miles to Kms or vice versa
    if(gsUnits=='m'){
        setCookie("mgoUnits",'k', 365);
        gsUnits='k';
    }else{
        setCookie("mgoUnits",'m', 365);
        gsUnits='m';
    }
    updateToolsDialogUnits();
    //changeText();
    close_popup("idDivOptionsPopUp");
}

function updateToolsDialogUnits(){
    obj=document.getElementById("unitToggleStatus");
    if(obj){
        obj.innerHTML=(gsUnits=="m"?"Miles":"Kms");
    }
}

function toggleLines(){
    gbLines=!gbLines;
    obj=document.getElementById("lineToggleStatus");
    if(obj){
        obj.innerHTML=(gbLines==true?"ON":"OFF");
    }
    drawRoute();
}

function geocoderCheckForEnter(e){
    if(e.keyCode==13){
        geoCode();
    }
}

function geoCode(){
    var address;
    obj=document.getElementById("txtGeocoder");
    if(obj){
        address=obj.value;
    }
    if(address=="") return;
    var geocoder = new GClientGeocoder();
    geocoder.getLatLng(
        address,
        function(point) {
            if (!point) {
                alert("\n'" + address + "' not found.\n\nPlease note that there are currently legal/contractual reasons why Google cannot search in the UK, Japan and China, amongst other countries.");
            } else {
                map.setCenter(point, 7);
            }
        }
    );
}
var selectedRoadTypes = new Array();

function selectRoadType(){
	dirt = document.getElementById("chkDirtRoads").checked;
	rock = document.getElementById("chkRockRoads").checked;
	chip = 	document.getElementById("chkChipSealRoads").checked;
	alert("selectRoadType()    DIRT = "+dirt+", Rock = "+rock+", Chip ="+chip);
}

function addNewGPX(type){
 var gpx = new GPXLine(type);
 arRoutes.push(gpx);
 currentGPX = gpx; 
 alert("You have created a new gpx object");
}

function getRouteInfo(){
	var content = "<BR>The routes and tracks you have created thus far:<br><HR><form><table width='100%'><TR><TD><u>Route/Track #</u></TD><TD><u>Type</u></td><TD><center><u># Of Waypoints</u></center></td></tr>";
	for(var i = 0; i<arRoutes.length; i++){
		var gpx = arRoutes[i];
		var type;
		if(gpx.gpxType == 1){type="Route";}else if(gpx.gpxType==2){type="Track";}
		content+="<tr><td><input type='radio' name= 'gpx' id="+i+" value="+i+" onclick=selectGPX("+i+") /> "+i+"</td><td>"+type+"</td><td><center>"+gpx.arMarkers.length+"</center></td></tr>";
		
	}
	content+='<tr><td colspan=3 align="right"><a id="aboutClose" href="javascript:close_popup(\'route-track-box\');">close</a>&nbsp;</td></tr></table></form>';
	return content;
}

function selectGPX(index){
	var gpx = arRoutes[index];
	if(gpx.arMarkers.length != 0){
	   lastMarker = gpx.arMarkers.length - 1;
	}else{
		lastMarker = gpx.arMarkers.length;
	}
	currentGPX = gpx;
	find_waypoint(lastMarker);
		
}


//debug
    function debugObject(elem, recurseIntoObjects, elemPropertyName) {  
        var mesg = "";  
        if ((elem == undefined) || (elem == null)) {  
            alert("Passed element is not valid: "+elem);  
            return;  
        }  
        for (var i in elem) {  
            if ((i == undefined) || (i == null) || (typeof elem[i] == 'function') || (typeof elem[i] == 'undefined') || (elem[i] == null)) {  
                continue;  
           }  
           if (recurseIntoObjects && typeof elem[i] == 'object') {  
               if ((elemPropertyName != undefined) && (elem[i][elemPropertyName] != 'undefined')) {  
                   mesg += i+": "+elem[i][elemPropertyName]+"\n";  
               }  
               else {  
                   var elements = "";  
                   var elementCount = 0;  
                   for (var j in elem[i]) {  
                       if ((j == undefined) || (j == null) || (typeof elem[i][j] == 'function') || (typeof elem[i][j] == 'undefined') || (elem[i][j] == null)) {  
                           continue;  
                       }  
                       if (elementCount != 0) {  
                           elements += ", ";  
                       }  
                       elements += elem[i][j];  
                       elementCount++;  
                   }  
                   mesg += i+"["+elementCount+"]: "+elements+"\n";  
               }  
           }  
           else {  
               mesg += i+": "+elem[i]+"\n";  
           }  
       }  
       alert(mesg);  
       return mesg;  
   }  
