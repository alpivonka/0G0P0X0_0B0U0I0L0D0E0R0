fuction  Route(){
 this.inheritFrom = TrackSeg;
 this.inheritFrom();
 this.name = "";
 }
 Route.prototype.getName = function(){
   return this.name;
 }
 
 Route.prototype.toGPX = function(){
  var sb = new StringBuffer();
  sb.append("<rte>");
  sb.append("<name>"+this.name+"</name>");
  for(i = 0; i <collection.length; i++){
     var point = collection[i];
     sb.append("<rtept lat="+point.lat+" lon="+point.lon+">");
     sb.append("<name>"+point.name+"</name>");
     sb.append("</rtept>");
  }
  sb.append("</rte>");
  return sb.toString();
}

Route.prototype.loadGPX = function(gpx){
	for(x = 0; x < gpx.length; x++){
		var route = gpx[i];
		var waypoints = route.getElementsByTagName("rtept");
		this.name = route.getElementsByTagName("name")[0].childNodes[0].nodeValue;
		for (var i = 0; i < waypoints.length; i++) {
		     var waypoint = new WayPoint();
		     waypoint.name = waypoints[i].getElementsByTagName("name")[0].childNodes[0].nodeValue;
		     waypoint.lat = parseFloat(waypoints[i].getAttribute("lat"));
		     waypoint.lon = parseFloat(waypoints[i].getAttribute("lon"));
		     this.add(waypoint);
		}
	}
	
}
