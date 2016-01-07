
function show_popup(sID) {
    //alert("1 "+sID);
    if(sID!="about-box")    close_popup("about-box");
    if(sID!="xmlload-box")  close_popup("xmlload-box");
    if(sID!="xmlsave-box")  close_popup("xmlsave-box");
    if(sID!="wait-box")     close_popup("wait-box");
    if(sID!="gpxType-box")  close_popup("motd-box");
    //if(sID!="route-track-box")  close_popup("route-track-box");
    if(sID!="contact-us-box") close_popup("contact-us-box");
    
    if(document.layers) //NN4+
    {
       document.layers[sID].visibility = "show";
    }
    else if(document.getElementById)  //gecko(NN6) + IE 5+
    {
        var obj = document.getElementById(sID);
        obj.style.visibility = "visible";
        obj.style.display = "inline";
    }
    else if(document.all) // IE 4
    {
        document.all[sID].style.visibility = "visible";
    }
}
function close_popup(sID) {
	//alert("Close "+sID);
    if(document.layers) //NN4+
    {
       document.layers[sID].visibility = "hide";
    }
    else if(document.getElementById) //gecko(NN6) + IE 5+
    {
        var obj = document.getElementById(sID);
        obj.style.visibility = "hidden";
        obj.style.display = "none";
    }
    else if(document.all) // IE 4
    {
        document.all[sID].style.visibility = "hidden";
    }
}


function show_help(){
    show_popup("about-box");
    var obj = document.getElementById("aboutClose");
    obj.focus();
}

function show_load(){
    show_popup("xmlload-box");
    var obj = document.getElementById("loadTextArea");
    obj.focus();
}
function show_gpxType_box(){

//alert("popup");
    show_popup("gpxType-box");
    var obj = document.getElementById("optionsCloseButton");
    obj.focus();
}
function show_roadTypes(){
    //alert("popup");
    show_popup("roadType-box");
    var obj = document.getElementById("optionsCloseButton");
    obj.focus();
}
function show_menu(){
    show_popup("options-box");
    var obj = document.getElementById("optionsCloseButton");
    obj.focus();
}
function show_route_track(){
   //alert("show_route_track");
   show_popup("route-track-box");
   var obj = document.getElementById("optionsCloseButton");
    obj.focus();
}
function show_contact_box(){
	//alert("contact-us-box");
	show_popup("contact-us-box");
   var obj = document.getElementById("optionsCloseButton");
    obj.focus();
}

function saveMapPosition(){
    setCookie("mgoMapPosX",map.getCenter().x, 365);
    setCookie("mgoMapPosY",map.getCenter().y, 365);
    setCookie("mgoMapZoom",map.getZoom(), 365);
    alert("Position saved.");
    close_popup('options-box');
}
//39.828175, -98.5795

function goHome(){
    map.setCenter(new GLatLng(Number(getCookie('mgoMapPosY')||39.828175), Number(getCookie('mgoMapPosX')||-98.5795)), Number(getCookie('mgoMapZoom')||5));
}

function getCookie( name ) {
    var start = document.cookie.indexOf( name + "=" );
    var len = start + name.length + 1;
    if ((!start) && (name != document.cookie.substring(0, name.length))) {
        return null;
    }
    if ( start == -1 ) return null;
    var end = document.cookie.indexOf( ";", len );
    if ( end == -1 ) end = document.cookie.length;
    return unescape( document.cookie.substring( len, end ) );
}

function setCookie( name, value, expires, path, domain, secure ) {
    var today = new Date();
    today.setTime( today.getTime() );
    if ( expires ) {
        expires = expires * 1000 * 60 * 60 * 24;
    }
    var expires_date = new Date( today.getTime() + (expires) );
    document.cookie = name+"="+escape( value ) +
        ( ( expires ) ? ";expires="+expires_date.toGMTString() : "" ) + 
            ( ( path ) ? ";path=" + path : "" ) +
                ( ( domain ) ? ";domain=" + domain : "" ) +
                ( ( secure ) ? ";secure" : "" );
}
