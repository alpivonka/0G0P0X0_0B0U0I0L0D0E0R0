var charCodeRange = {
	start: 65,
	end: 90
}



function generate_gpx(nFlag){
    show_popup("xmlsave-box");
    var txt = document.getElementById("xml-textarea");
    //alert(numbPointsPerSeg);
    var sXML= "<?xml version=\"1.0\"?>\n" +
        "<gpx \n"+
	"  creator = \"http://GIS2GPS.com \"\n"+
	"  version=\"1.1\"\n" +
        "  xmlns=\"http://www.topografix.com/GPX/1/1\"\n" +
        "  xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n" +
        "  xsi:schemaLocation=\"http://www.topografix.com/GPX/1/1 \n" +
        "  http://www.topografix.com/GPX/1/1/gpx.xsd\">\n";
    var obj=document.getElementById("txtRouteName");
    var sRouteName = obj.value;
    if (sRouteName.length==0) sRouteName="Route Name";
    sXML+="  ";
    var cc = charCodeRange.start;
    //alert(arRoutes.length);
    for(var xx = 0; xx<arRoutes.length; xx++){
	   
	    //alert("XX = "+xx);
	    var workingGPX = arRoutes[xx];
	    var gpxType = workingGPX.gpxType;
	    //alert("Points Length = "+workingGPX.arPoints.length);
	    if(gpxType==1){
		sXML+= "  <rte>\n";
		var sName=""+String.fromCharCode(cc);
		sXML+="	<name>" + sName + "</name>\n";
		for(var i=0; i<workingGPX.arPoints.length; i++){
		    if(nFlag==2 && workingGPX.arComments[i].length==0) continue;
		    sXML+="	<rtept lat=\"" + workingGPX.arPoints[i].y + "\" lon=\"" + workingGPX.arPoints[i].x + "\">\n";
		    sName=""+String.fromCharCode(cc);
		    sName+=(i);
		    //if (workingGPX.arComments[i].length>0) sName+="-"+workingGPX.arComments[i];
		    sXML+="		<name>" + sName + "</name>\n";
		    sXML+="		<sym>Waypoint</sym>\n";
		    sXML+="	</rtept>\n";
		}
		sXML+="  </rte>\n";
		cc++;
	    }else if(gpxType==2){ //creat a track log
		   sXML+= "	<trk>\n";
		   sXML+= "		<trkseg>\n";
		 for(var i=0; i<workingGPX.arPoints.length; i++){
		    //if(nFlag==2 && workingGPX.arComments[i].length==0) continue;
		    sXML+="			<trkpt lat=\"" + workingGPX.arPoints[i].y + "\" lon=\"" + workingGPX.arPoints[i].x + "\"></trkpt>\n";            
		}  
		sXML+="		</trkseg>\n";
		sXML+="	</trk>\n";  
	    }
	    
    }
    sXML+="</gpx>"
    txt.value=sXML;
    txt.focus();
}

function stripSequence(sText, nWaypointNumber) {
    // Note waypoints can only be 8 chars, and we use the first few of those for the
    // prefix to ensure that they are unique.  Hence the user has only a few
    // more to enter stuff, and we have to lose anything over that on an imported GPX.
    var maxCmtLen=4;
    if(nWaypointNumber<100) maxCmtLen=5;
    if(nWaypointNumber<10)  maxCmtLen=6;
    var ValidChars = "0123456789";
    for(var n=0; n<3; n++){
        if(sText.length==n) return "";
        if(ValidChars.indexOf(sText.charAt(n)) == -1) return sText.substring(0,maxCmtLen);
        if(sText.charAt(n+1)=='-') return sText.substring(n+2,n+2+maxCmtLen);
    }
    // if we get here, we generated the GPX most likely, so we strip off the
    // guff at the beginning of the waypoint name
    return sText.substring(3,8);
}

function load_gpx(){
    // clear down old stuff
   	    show_popup('wait-box');
	    setTimeout("load_gpx2()",1); // we do this to allow the "please wait" to show
    
}
function load_gpx2(){
    try{
        clearRoute();
        obj=document.getElementById("loadTextArea");
        var xml=GXml.parse(obj.value);
	
        var sRouteName=xml.documentElement.getElementsByTagName("name")[0].childNodes[0].nodeValue;
        var txtRouteName=document.getElementById("txtRouteName");
        txtRouteName.value=sRouteName;
	if(xml.documentElement.getElementsByTagName("rte") != undefined){
		var routes =xml.documentElement.getElementsByTagName("rte");
		//alert(routes.length);
		drawRoutes(routes,"rtept");
	}
	if(xml.documentElement.getElementsByTagName("trk") != undefined){
		var tracks =xml.documentElement.getElementsByTagName("trk");
		//alert(tracks.length);
		drawTracks(tracks,"trkseg");
	}
	
	
	if(currentGPX.arPoints.length>0) map.setCenter(new GLatLng(currentGPX.arPoints[0].y, currentGPX.arPoints[0].x));
	
	document.getElementById("wayPointCount").innerHTML  = currentGPX.arMarkers.length;
	
    }
    catch(e){
	alert("Error"+e);
        alert("Failed to load the route... maybe the text was incomplete?");
    }
    close_popup("wait-box");
    addWMSLayers();
}

function drawRoutes(routes,kind){
	for(var routesX = 0; routesX<routes.length; routesX++){
		var waypoints = routes[routesX].getElementsByTagName(kind);
		if(kind=="rtept"){
		   gpxline = new GPXLine(1);
		}else{
		  gpxline = new GPXLine(2);
		}
		//alert(waypoints.length);
		for (var i = 0; i < waypoints.length; i++) {
		    var waypointName=waypoints[i].getElementsByTagName("name")[0].childNodes[0].nodeValue;
		    var y=parseFloat(waypoints[i].getAttribute("lat"));
		    var x=parseFloat(waypoints[i].getAttribute("lon"));
		    var point=new GPoint(x,y);
		    gpxline.arPoints.push(point);
		    var mk=createMarker(point, i, waypointName);
		    gpxline.arMarkers.push(mk);
		    map.addOverlay(mk);
		    mk.enableDragging();
		}
		 arRoutes.push(gpxline);
		 currentGPX = gpxline;
		 //alert(routesX);
		 drawRoute();
	}	
}

function drawTracks(tracks,kind){
	for(var tracksX = 0; tracksX<tracks.length; tracksX++){
		var trackSegs = tracks[tracksX].getElementsByTagName(kind);
		//alert(trackSegs.length);
		for(track_SEGS = 0; track_SEGS<trackSegs.length; track_SEGS++){
			var waypoints = trackSegs[track_SEGS].getElementsByTagName("trkpt");
			gpxline = new GPXLine(2);
			//alert(waypoints.length);
			for (var i = 0; i < waypoints.length; i++) {
			    var y=parseFloat(waypoints[i].getAttribute("lat"));
			    var x=parseFloat(waypoints[i].getAttribute("lon"));
			    var point=new GPoint(x,y);
			    gpxline.arPoints.push(point);
			    var mk=createMarker(point, i, "");
			    gpxline.arMarkers.push(mk);
			    map.addOverlay(mk);
			    mk.enableDragging();
			}
		}
		 arRoutes.push(gpxline);
		 currentGPX = gpxline;
		 //alert(tracksX);
		 drawRoute();
	}	
}

function gpxLoad(gpx){
	var gpxRead = new OpenLayers.Format.GPX({extractWaypoints: true, extractTracks: true, extractRoutes:true, extractAttributes: true})
	debugObject(gpxRead);
	var results = gpxRead.read(gpx);
	if(results != undefined){
		debugObject(results);
		alert(results.length);
	}
	
	
}

