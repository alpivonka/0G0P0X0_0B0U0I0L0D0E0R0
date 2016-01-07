
function GPXLine(type){
   this.gpxType = type;
   this.arPoints = new Array();
   this.arMarkers = new Array();
   this.arComments = new Array();
   if(type == 1){
       this.gLine = new GPolyline(this.arPoints);
   }else if (type ==2){
      this.gLine = new GPolyline(this.arPoints,color="yellow");
   }
}

GPXLine.prototype.getPoints = function(){
   return this.arPoints;
}

GPXLine.prototype.getMarkers=function(){
   return this.arMarkers;
}

GPXLine.prototype.getComments=function(){
   return this.arComments;
}

GPXLine.prototype.getPolyLine=function(){
   return this.gLine;
}

GPXLine.prototype.getType=function(){
   return this.gpxType;
}

GPXLine.prototype.containsMarker = function(marker){
	exists = false;
	searchLatLon = marker.getPoint();
	markers = this.getMarkers();
	for(var i = 0; i<markers.length; i++){
	   var marker2 = markers[i];
	   var markerLatLon = marker2.getPoint();
	   //alert("Search "+searchLatLon == markerLatLon);
	   if(searchLatLon == markerLatLon){
		   exists = true;
		   break;
	   }//end if
	}//end for
	return exists;
	
}
