"use strict";

// This example requires the Visualization library. Include the libraries=visualization
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=visualization">



var map, heatmap,
 gpoints = [];

function initMap() {
    add_info('-Start');
    map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: {lat: 58.006948, lng: 56.234773},
    mapTypeId: 'roadmap'
    });

    add_info('Successfully loaded');

    select_topic_clear();
    fetchApiAsync(location.origin+'/api/get_topics', {}).then((data) => {fill_topic(data.data) });
    
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: getPoints(),
        map: map
        });

    heatmap.set('radius', 20);
    changeGradient();

    // loadGeoData('Ямы, выбоины на дороге, тротуаре');


    map.addListener('click', function(data) {
        // 3 seconds after the center of the map has changed, pan back to the
        // marker.
        // window.setTimeout(function() {
        // map.panTo(marker.getPosition());
        // }, 3000);
        
        const putData = (data) => {
            // console.log('click on map',data);
            clearInfo();
            data=data||[];
            add_info_element(document.createTextNode(`Loaded - ${data.length}`));
            data.forEach(function(element) {
                // console.log(element);
                var newDiv = document.createElement("div");
            newDiv.innerHTML = `<div class="claim-panel">
                <a href="https://vmeste.permkrai.ru/messages/reports/${element.claim_id}" target="_blank"> ${element.claim_id}</a>
                <span> ${element.create_dt.substring(0, 10)}</span>
                <div class="tooltip"> Отв. <span class="tooltiptext"> ${element.executor} </span> </div>
                <div class="tooltip"> Адр. <span class="tooltiptext"> ${element.address}  </span> </div>
                <br>
                <span>${element.claim_text.substring(0, 50)}</span>
                </div>`;
                add_info_element(newDiv);
            });            
        };

        let pobj=get_current_topic_fts();
        pobj.lat=data.latLng.lat();
        pobj.lng=data.latLng.lng();
        if(document.getElementById('input_fts').value.length==0) {
            console.log(' Click %o ',pobj)
            getClaimsByGeo(pobj, (data) => putData(data));
            
        } else {
            
            console.log('FTS click - config %o ',pobj)
            getClaimsByGeoFTS(pobj, (data) => putData(data));
        }
        
        
    });

}

/*
claim_id: 24771,
executor: "Отдел благоустройства администрации Дзержинского района города Перми (ОИВ) Отдел содержания МКУ «Благоустройство Дзержинского района» города Перми Отд…154 more…",
address: "Вишерская улица",
topic: "Ямы, выбоины на дороге, тротуаре",
create_dt: "2019-06-29T19:25:00.000Z",
claim_text: 

*/

function get_current_topic() {
    var e = document.getElementById('select_topic'); 
    return (e.options[e.selectedIndex].value);
    
}
// функция формирования объекта конфигурации
function get_current_topic_fts() {
    let conf_obj= {topic:"", month:"", text:""};
    let e = document.getElementById('select_topic'); 
    conf_obj.topic = (e.options[e.selectedIndex].value);
    e = document.getElementById('select_month'); 
    conf_obj.month = (e.options[e.selectedIndex].value);
    e = document.getElementById('select_radius'); 
    conf_obj.radius = (e.options[e.selectedIndex].value);
    conf_obj.text = document.getElementById('input_fts').value;

    console.log("conf_obj %o",conf_obj);
    return conf_obj;

    
}

function loadSelectedTopic() {
    loadGeoData(get_current_topic());
}

function loadSelectedTopicFts() {
    loadGeoDataFts(get_current_topic_fts());
}



function loadGeoData(topic) {
    clearInfo();
    getGeoByTopic(topic,(data) => { 
        
        mapSetHeatMap(data);
        add_info('Тема-'+topic +'( '+gpoints.length + ' )');
        console.log('Ok'); 
    });
    
}

function loadGeoDataFts(pObject) {
    clearInfo();
    getGeoByTopicFts(pObject,(data) => { 
        mapSetHeatMap(data);
        add_info('loadGeoDataFts Тема-'+pObject.topic +'( '+gpoints.length + ' )');
        console.log('Ok'); 
    });
    
}


function mapSetHeatMap(data) {
    gpoints = data.map(x => (new google.maps.LatLng(x.latitude,x.longitude)));
    heatmap.setData(gpoints);
}

function getGeoByTopic(topic,callback) {
   fetchApi(location.origin+'/api/get_geo_by_topic', {'topic':topic},  (pData) => {callback(pData.data) }); 
}

function getGeoByTopicFts(object,callback) {
    fetchApi(location.origin+'/api/get_geo_by_topic_fts', object,  (pData) => {callback(pData.data) }); 
}

function getClaimsByGeo(object,callback) {
    fetchApi(location.origin+'/api/get_claims_by_geo', object,  (pData) => {
        callback(pData.data);
    }); 
    }
    
function getClaimsByGeoFTS(pobject,callback) {
        fetchApi(location.origin+'/api/get_claims_by_geo_fts', pobject,  (pData) => {
            callback(pData.data);
        }); 
        }    

function fill_topic(arr) {
        var select = document.getElementById("select_topic");
        var index;
        for(index in arr) {
            select.options[select.options.length] = new Option(arr[index]['tname'], arr[index]['topic']);
        }
        
}

function select_topic_clear() {
    var select = document.getElementById("select_topic");
    select.options.length = 0; 
}


function add_info(param) {
    var theDiv = document.getElementById("floating-panel-info");
    var content = document.createTextNode(param);
    theDiv.appendChild(content);
    theDiv.appendChild(document.createElement("br"));
}

function add_info_element(el) {
    var theDiv = document.getElementById("floating-panel-info");
    theDiv.appendChild(el);
}

function clearInfo() {
    document.getElementById("floating-panel-info").innerHTML='';
}

function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}

function changeGradient() {
    var gradient = [
    'rgba(0, 255, 255, 0)',
    'rgba(0, 255, 255, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(0, 127, 255, 1)',
    'rgba(0, 63, 255, 1)',
    'rgba(0, 0, 255, 1)',
    'rgba(0, 0, 223, 1)',
    'rgba(0, 0, 191, 1)',
    'rgba(0, 0, 159, 1)',
    'rgba(0, 0, 127, 1)',
    'rgba(63, 0, 91, 1)',
    'rgba(127, 0, 63, 1)',
    'rgba(191, 0, 31, 1)',
    'rgba(255, 0, 0, 1)'
    ]
    heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
}

function changeRadius() {
    heatmap.set('radius', heatmap.get('radius') ? null : 40);
}

function changeOpacity() {
    heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
}


function fetchApi(pUrl, params={}, callback) {
    var url = new URL(pUrl);
         //,params = {lat:35.696233, long:139.570431};
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    fetch(url,{method: 'GET', credentials: 'include'})
    .then(response => response.json())
    .then(data =>callback(data))    
}


async function fetchApiAsync(pUrl, params={}) {
    try {
        var url = new URL(pUrl);
            //,params = {lat:35.696233, long:139.570431};
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        const response = await fetch(url);
        var json;
        if(response.ok) {
            json = await  response.json();
            } else {
            throw Error(`Request rejected with status ${response.status}`);
            }
        return json;
    }
    catch(error){
        throw Error(error);
        /*return `{
            "status": "error",
            "error: ${error.toString()},
            "message": ${error.toString()}
            }`;
            */
        }
}





// Heatmap data: 500 Points
function getPoints() {
    return [   new google.maps.LatLng(57.973563, 56.169205)];
}
