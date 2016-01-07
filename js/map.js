
var map;
var ov_map;
var arRoutes = new Array();
var arTracks = new Array();
var arPoints = new Array();
var arMarkers = new Array();
var arComments = new Array();
var gLine = new GPolyline();
var l;
var gsUnits;
var gbLines=true;

function load() {
    if (GBrowserIsCompatible()) {
        map = new GMap2(document.getElementById("map"), {draggableCursor: 'pointer', draggingCursor: 'hand'});
        goHome();
        gsUnits=getCookie('mgoUnits')||'m';
        updateToolsDialogUnits();
        map.addControl( new GLargeMapControl());
        map.addControl( new GScaleControl() );
        map.addControl( new GMapTypeControl() );
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
                    if (arPoints.length<1000){ //optimistic :)
                        // add a marker
                        point.array_index = arPoints.length;
                        arPoints.push(point);                                                                                                     
                        var sWaypointName;
                        arComments.push("");
                        var marker=createMarker(point, arPoints.length-1);
                        arMarkers.push(marker);
                        map.addOverlay(marker);
                        marker.enableDragging();
                        changeText();
                        focusTextBox(marker.MCD_ID);
			document.getElementById("wayPointCount").innerHTML  = arMarkers.length;
			
                    }else{
			    alert("You have created a 1000 points. This is the limit allowed. Please either save off your work by selecting GPX or delete unneeded points.");
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
    map.removeOverlay(arMarkers[marker_id]);
    map.removeOverlay(gLine);
    arPoints.splice(marker_id,1);
    arMarkers.splice(marker_id,1);
    arComments.splice(marker_id,1);
    // reset the marker IDs
    for(i=0; i<arMarkers.length; i++){
        arMarkers[i].MCD_ID=i;
    }
    changeText();
    drawRoute();
    document.getElementById("wayPointCount").innerHTML  = arMarkers.length;
}

function showBalloon(marker){
    var sHTML="Waypoint " + marker.MCD_ID;
    if(arComments[marker.MCD_ID].length>0) sHTML += ": " + arComments[marker.MCD_ID];
    sHTML += "<BR><BR><a href='javascript:deleteMarker(" + marker.MCD_ID + ");'>Delete this waypoint</a>";
    if(marker.MCD_ID < (arMarkers.length-1)){
        sHTML += "<BR><a href='javascript:insertMarkerAfter(" + marker.MCD_ID + ");'>Insert waypoint after this one</a>";
    }
    sHTML += "<BR><a href='javascript:centreMap(" + marker.MCD_ID + ");'>Centre map around here</a>";
    marker.openInfoWindowHtml(sHTML);
}

function centreMap(markerID){
    map.setCenter(new GLatLng(arPoints[markerID].y, arPoints[markerID].x));
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

function drawRoute(){
    map.removeOverlay(gLine);
    if(!gbLines) return;
    gLine=new GPolyline(arPoints);
    try{
     // gLine.enableDrawing( new GPolyEditingOptions(999,true));
      map.addOverlay(gLine);
    }
    catch(e){
      //The above line dies in IE...
    }
}


function save_text(nIndex, sText){
    arComments[nIndex]=sText.toUpperCase();
}

function find_waypoint(n){
    map.setCenter(new GLatLng(arPoints[n].y, arPoints[n].x));
    showBalloon(arMarkers[n]);
    focusTextBox(n);
}

function changeText() {
    var sHTML="<table cellspacing='0px'>";
    var totalKs=0;
    var totalMs=0;
    for(var i=0; i<arPoints.length; i++){
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
            var metres=arMarkers[i].getPoint().distanceFrom(arMarkers[i-1].getPoint());
            totalKs+=(metres * 0.001);
            totalMs=(totalKs * 0.621371192);
        }
        sHTML += "<a href='javascript:find_waypoint(" + i + ");' title='Click to locate waypoint on map'> " +
        (i) + "</a></td><td>:  <input type='text' " +
        " id='txtWaypoint" + i + "' " +
        " class='waypoint_text' name='waypoint_" + i + "' " +
        "onkeyup=save_text(" + i + ",this.value) " +
        "onfocus=highlightTextBox(this) " +
        "onblur=highlightTextBox(this) " +
        "size='8' maxlength='" + maxCmtLen + "' " +
        "value='" + arComments[i] + "'>";
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
    //focusTextBox(arPoints.length-1);
}



function createMarker(point,number) {
   var marker = new GMarker(point, {draggable:true, bouncy:false});
    marker.MCD_ID=number;
    GEvent.addListener(marker, "dragend", function() {
        arPoints[marker.MCD_ID]=marker.getPoint();
        changeText();
        focusTextBox(marker.MCD_ID);
        drawRoute();
    });
    GEvent.addListener(marker, "dragstart", function(){
        map.removeOverlay(gLine);
        map.closeInfoWindow();
    });
    GEvent.addListener(marker, "mouseover", function() {
        focusTextBox(marker.MCD_ID);
    });       
    drawRoute();
    return marker;
}

function focusTextBox(sID){
    changeText();
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
        if(! confirm("Are you sure you want to delete all the waypoints?")) return;
    }    
    
    arComments.length=0;
    arPoints.length=0;
    arMarkers.length=0;
    arComments = new Array();
    arPoints = new Array();
    arMarkers = new Array();
    changeText();
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
    var newX=arPoints[afterWaypoint].x + (arPoints[afterWaypoint+1].x-arPoints[afterWaypoint].x)/2;
    var newY=arPoints[afterWaypoint].y + (arPoints[afterWaypoint+1].y-arPoints[afterWaypoint].y)/2;
    var point=new GPoint(newX, newY);
    arPoints.splice(afterWaypoint+1, 0,  point);
    arComments.splice(afterWaypoint+1, 0,  "");
    var mk=createMarker(point, afterWaypoint+1);
    arMarkers.splice(afterWaypoint+1, 0, mk);
    for(var i=0; i<arMarkers.length; i++){
        arMarkers[i].MCD_ID=i;
    }
    map.addOverlay(mk);
    mk.enableDragging();
    changeText();
    focusTextBox(mk.MCD_ID);
    showBalloon(mk);
    //arMarkers[afterWaypoint+1].openInfoWindowHtml("New waypoint");
    drawRoute();
    close_popup("options-box");
    document.getElementById("wayPointCount").innerHTML  = arMarkers.length;

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
    changeText();
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

