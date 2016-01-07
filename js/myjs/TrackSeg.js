fuction  TrackSeg(){
 this.inheritFrom = Collection;
 this.inheritFrom();
 }
 
 TrackSeg.prototype.toGPX = function(){
  var sb = new StringBuffer();
  if(collection.length > 0){
	  sb.append("<trkseg>");
	  for(i = 0; i <collection.length; i++){
	     var point = collection[i];
	     sb.append("<trkpt lat="+point.lat+" lon="+point.lon+"></trkpt>");
	  }
	  sb.append("</trkseg>");
	  return sb.toString();
  }
}

TrackSeg.prototype.loadGPX(gpx){
	for(x = 0; x < gpx.length; x++){
		var seg = gpx[i];
		var trackseg =xml.documentElement.getElementsByTagName("trkpt");
		for(tpt = 0; tpt<trackseg; tpt++){
			var waypoint = new WayPoint();
			waypoint.lat = parseFloat(waypoints[i].getAttribute("lat"));
			waypoint.lon = parseFloat(waypoints[i].getAttribute("lon"));
			this.add(waypoint);
		}
	}
	
	
}
