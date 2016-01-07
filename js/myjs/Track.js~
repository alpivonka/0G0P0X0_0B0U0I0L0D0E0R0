fuction  Track(){
 this.inheritFrom = PointsCollection;
 this.inheritFrom();
 }
 
 Route.prototype.toGPX = function(){
  var sb = new StringBuffer();
  sb.append("<rte>");
  for(i = 0; i <points.length; i++){
     var point = points[i];
     sb.append("<rtept lat="+point.lat+" lon="+point.lon+">");
     sb.append("<name>"+point.name+"</name>");
     sb.append("</rtept>");
  }
  sb.append("</rte>");
  return sb.toString();
}
