function generate_gpx(nFlag){
    show_popup("xmlsave-box");
    var txt = document.getElementById("xml-textarea");
    var numbPointsPerSeg = document.getElementById("txtNumb_Points_Seg").value;
    //alert(numbPointsPerSeg);
    var sXML= "<?xml version=\"1.0\"?>\n" +
        "<gpx version=\"1.1\"\n" +
        "  xmlns=\"http://www.topografix.com/GPX/1/1\"\n" +
        "  xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n" +
        "  xsi:schemaLocation=\"http://www.topografix.com/GPX/1/1 \n" +
        "  http://www.topografix.com/GPX/1/1/gpx.xsd\">\n";
    var obj=document.getElementById("txtRouteName");
    var sRouteName = obj.value;
    if (sRouteName.length==0) sRouteName="Route Name";
    sXML+="    <name>" + sRouteName + "</name>\n";
    
    if(nFlag==0 || nFlag==2){
	sXML+= "  <rte>\n";
        for(var i=0; i<arPoints.length; i++){
            if(nFlag==2 && arComments[i].length==0) continue;
            sXML+="    <rtept lat=\"" + arPoints[i].y + "\" lon=\"" + arPoints[i].x + "\">\n";
            var sName="";
            sName+=(i);
            if (arComments[i].length>0) sName+="-"+arComments[i];
            sXML+="      <name>" + sName + "</name>\n";
            sXML+="    </rtept>\n";
        }
	sXML+="  </rte>\n</gpx>";
    }else if(nFlag==1){
	 sXML+= "  <rte>\n";
        for(var i=arPoints.length-1; i>=0; i--){
            sXML+="    <rtept lat=\"" + arPoints[i].y + "\" lon=\"" + arPoints[i].x + "\">\n";
            var sName="";
            sName+=(i);
            if (arComments[i].length>0) sName+="-";
            if(arComments[i]=='R' || arComments[i]=="RIGHT") {
                sName+="L";
            }else if(arComments[i]=='L' || arComments[i]=="LEFT") {
                sName+="R";
            }else{
                sName+=arComments[i];
            }

            sXML+="      <name>" + sName + "</name>\n";
            sXML+="    </rtept>\n";
        }
	sXML+="  </rte>\n</gpx>";
    }else if(nFlag=3){ //creat a track log
	   sXML+= "  <trk>\n";
	   sXML+= "<trkseg>\n";
	 for(var i=0; i<arPoints.length; i++){
            if(nFlag==2 && arComments[i].length==0) continue;
            sXML+="    <trkpt lat=\"" + arPoints[i].y + "\" lon=\"" + arPoints[i].x + "\"></trkpt>\n";            
        }  
	sXML+= "</trkseg>\n";
	sXML+="  </trk>\n</gpx>";  
    }
    
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

function load_gpx(flag){
    // clear down old stuff
    if(flag == 1){//Route
	    show_popup('wait-box');
	    setTimeout("load_gpx2()",1); // we do this to allow the "please wait" to show
    }else if (flag ==2){//Track
	    
    }
    
}
function load_gpx2(){
    try{
        clearRoute();
        obj=document.getElementById("loadTextArea");
        var xml=GXml.parse(obj.value);
        var sRouteName=xml.documentElement.getElementsByTagName("rte")[0].getElementsByTagName("name")[0].childNodes[0].nodeValue;
        var txtRouteName=document.getElementById("txtRouteName");
        txtRouteName.value=sRouteName;
        var waypoints = xml.documentElement.getElementsByTagName("rtept");
        for (var i = 0; i < waypoints.length; i++) {
            var waypointName=waypoints[i].getElementsByTagName("name")[0].childNodes[0].nodeValue;
            arComments.push(stripSequence(waypointName, i));
            var y=parseFloat(waypoints[i].getAttribute("lat"));
            var x=parseFloat(waypoints[i].getAttribute("lon"));
	   // alert(x+" , "+y);
            var point=new GPoint(x,y);
            arPoints.push(point);
            var mk=createMarker(point, i, waypointName);
            arMarkers.push(mk);
            map.addOverlay(mk);
            mk.enableDragging();
        }
        drawRoute();
        changeText();
        if(arPoints.length>0) map.setCenter(new GLatLng(arPoints[0].y, arPoints[0].x));
	
	document.getElementById("wayPointCount").innerHTML  = arMarkers.length;
	
    }
    catch(e){
	alert(e);
        alert("Failed to load the route... maybe the text was incomplete?");
    }
    close_popup("wait-box");
    addWMSLayers();
}

