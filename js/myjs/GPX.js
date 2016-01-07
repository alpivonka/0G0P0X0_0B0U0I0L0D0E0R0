function GPX(){
 this.waypoints = new Collection();
 this.routes = new Collection();
 this.tracks = new Collection();
}

GPX.prototype.getWaypoints = function(){
  return this.waypoints;
}
GPX.prototype.getRoutes = function(){
  return this.routes;
}
GPX.prototype.getTracks = function(){
  return this.tracks;
}

GPX.prototype.toGPX = function(){
   var sb = new StringBuffer();
   sb.append("<?xml version=\"1.0\"?>");
   sb.append("<gpx version=\"1.1\"  xmlns=\"http://www.topografix.com/GPX/1/1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"");
   sb.append( "xsi:schemaLocation=\"http://www.topografix.com/GPX/1/1\"  http://www.topografix.com/GPX/1/1/gpx.xsd\">");
   if(this.waypoints.size()>0){
	sb.append(waypoints.toGPX());   
   }
   if(this.routes.size() > 0){
	sb.append(routes.toGPX());   
   }
   if(this.tracks.size() > 0){
	sb.append(tracks.toGPX());   
   }
   sb.append("</gpx>");
   return sb.toString();
}

GPX.protoType.loadGPX = function(gpx){
	
	if(xml.documentElement.getElementsByTagName("rte") != undefined){
		var routes =xml.documentElement.getElementsByTagName("rte");
		for(r = 0; r<routes.length; r++){
		   var rr = routes[r];
		   var route = new Route();
		   route.loadGPX(rr);
		   routes.add(route);
		}
	}
	if(xml.documentElement.getElementsByTagName("trk") != undefined){
		var routes =xml.documentElement.getElementsByTagName("trk");
		for(t = 0; t<track.length; t++){
		   var tt = routes[t];
		   var track = new Track();
		   track.loadGPX(tt);
		   routes.add(track);
		}
	}
	
}
