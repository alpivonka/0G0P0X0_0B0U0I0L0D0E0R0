fuction  Track(){
  this.inheritFrom = Collection;
  this.inheritFrom();
 }
 
 Track.prototype.toGPX = function(){
  var sb = new StringBuffer();
  sb.append("<trk>");
  for(i = 0; i <collection.length; i++){
     var segment = collection[i];
     sb.append(segment.toGPX());
  }
  sb.append("</trk>");
  return sb.toString();
}

Track.prototype.loadGPX = function(gpx){
	for(x = 0; x < gpx.length; x++){
		var track = gpx[i];
		var seg = var routes =xml.documentElement.getElementsByTagName("trkseg");
		for(s = 0; s < seg.length; s++){
			var trackseg = new TrackSeg();
			trackseg.loadGPX(seg);
			this.add(trackseg);
		}
		
	}
	
}
