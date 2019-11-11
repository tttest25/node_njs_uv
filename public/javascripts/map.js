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
    // move to new version
    // fetchApiAsync(location.origin+'/api/get_topics', {}).then((data) => {fill_topic(data.data) });

    getDataApi({func:"uvdata.api_get_topics",args:[]},(data) => { 
        fill_topic(data.data)
        console.log('Ok'); 
    });
    
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
        
        const putData = (pdata) => {
            // console.log('click on map',data);
            clearInfo();
            let data=pdata.data||[];
            add_info_element(document.createTextNode(`Loaded - ${data.length}`));
            data.forEach(function(element) {
                // console.log(element);
                var newDiv = document.createElement("div");
            newDiv.innerHTML = `<div class="claim-panel">
                <a href="https://vmeste.permkrai.ru/messages/reports/${element.claim_id}" target="_blank"> ${element.claim_id}</a>
                <span> ${element.create_dt.substring(0, 10)}</span>
                <span > Авт.  ${element.author} </span>
                <div class="tooltip"> Отв. <span class="tooltiptext"> ${element.executor} </span> </div>
                <div class="tooltip"> Адр. <span class="tooltiptext"> ${element.address}  </span> </div>
                <br>
                <span>${element.claim_text.substring(0, 50)}</span>
                </div>`;
                add_info_element(newDiv);
            });            
        };

        let pGeoPoint = `(${data.latLng.lat()},${data.latLng.lng()})`;
        console.log(' onClick %o ',pGeoPoint)
        loadGeoData(pGeoPoint, (data) => putData(data));
        // getClaimsByGeo(pobj, (data) => putData(data));
    });

}

function goToLoadData() {
    window.location.assign("/app/uvdatain/load");
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

// функция формирования объекта конфигурации
function get_params_json(pClick = null) {
    let conf_obj= {};
    let e = document.getElementById('select_topic'); 
    conf_obj.p_topic = (e.options[e.selectedIndex].value);
    e = document.getElementById('select_month'); 
    let p_month = e.options[e.selectedIndex].value
    if(p_month.length===10) { conf_obj.p_month = (p_month);}
    e = document.getElementById('select_radius'); 
    conf_obj.radius = (e.options[e.selectedIndex].value);
    if(pClick){conf_obj.p_point = `(${pClick},${conf_obj.radius})`;}
    let fts = document.getElementById('input_fts').value;
    if(fts.length>3) { conf_obj.p_text = fts; }

    console.log("get_params_json - %o",conf_obj);
    return conf_obj;

    
}

function loadPrevWeek(pWeek=0) {
    getClaimsWeek(pWeek);
}

/** Get claims by week pWeek ago */
function getClaimsWeek(pWeek) {
        clearInfo();
        getDataApi({func:"public.get_claims_week",args:[pWeek]},(data) => { 
            mapSetHeatMap(data.data||[]);
            add_info('getClaimsWeek Тема-'+'get_claims_week' +'( '+gpoints.length + ' )');
            console.log('Ok'); 
        });
    
}

/** Get claims by topic */
function loadGeoData(pClick = null,callback) {
    clearInfo();
    loadGeoDataApi(pClick, (data) => { 
        mapSetHeatMap(data.data||[]);
        add_info('Тема-'+ data.cfg['p_topic'] +'( '+gpoints.length + ' )');
        console.log('Ok loadGeoData %o',data.cfg); 
        if (callback) callback(data);
        if(data.cfg['p_topic']=='prev-1' && !data.cfg.hasOwnProperty('p_point')){loadTextInfo(data.cfg);}
    });
}

/** Get claims by topic */
function loadGeoDataApi(pClick = null,callback) {
    let pCfg =get_params_json(pClick);
    getDataApi({func:"uvdata.api_get_claims",args:pCfg},(data) => { 
        console.log('Load api success %o',{func:"uvdata.api_get_claims",args:pCfg}); 
        data.cfg = pCfg;
        callback(data);
    });
    
}

/** Get claims by topic with fts 
   SELECT latitude, longitude from public.get_claims_by_topic_fts($1,	$2, $3),[req.query.topic,req.query.text,req.query.month] );
*/
function loadGeoDataFts(pObject) {
    clearInfo();
    getDataApi({func:"public.get_claims_by_topic_fts",args:[`'${pObject.topic}'`,`'${pObject.text}'`,`'${pObject.month}'`]},(data) => { 
    // getGeoByTopicFts(pObject,(data) => { 
        mapSetHeatMap(data.data||[]);
        add_info('loadGeoDataFts Тема-'+pObject.topic +'( '+gpoints.length + ' )');
        console.log('Ok'); 
    });
    
}


function retFormat(par1,par2) {
   return `<td class="${(par1-par2>0)?'red':''}">${par1}</td>`;
}

/**
 * format Table String
 * @pObj {object} 
 */
function retTD(pObj) {
    let vResult,cnt_w0,cnt_w1,cnt_w2,cnt_w3,cnt_w4,cnt_w5,cnt_w6,cnt_w7;
    cnt_w0=pObj.cnt_w0||0;
    cnt_w1=pObj.cnt_w1||0;
    cnt_w2=pObj.cnt_w2||0;
    cnt_w3=pObj.cnt_w3||0;
    cnt_w4=pObj.cnt_w4||0;
    cnt_w5=pObj.cnt_w5||0;
    cnt_w6=pObj.cnt_w6||0;
    cnt_w7=pObj.cnt_w7||0;
    
    vResult=`<tr><td>${pObj.dist}</td><td>${pObj.topic}</td>`;
    vResult+=retFormat(cnt_w0,cnt_w1);
    vResult+=retFormat(cnt_w1,cnt_w2);
    vResult+=retFormat(cnt_w2,cnt_w3);
    vResult+=retFormat(cnt_w3,cnt_w4);
    vResult+=retFormat(cnt_w4,cnt_w5);
    vResult+=retFormat(cnt_w5,cnt_w6);
    vResult+=retFormat(cnt_w6,cnt_w7);
    vResult+=retFormat(cnt_w7,10000);
   
    vResult+='</tr>';
    return vResult;
}

/** Get info in text form UV
*/
function loadTextInfo(pObject) {
    pObject=pObject||{};
    clearInfo();
    getDataApi({func:"uvdata.api_get_text_info",args:pObject},(data) => { 
    // getGeoByTopicFts(pObject,(data) => { 
        
        var iHtml='';
        data=data||{data:[]};
        data=data.data;
        iHtml='api_get_text_info data <br> - <table cellspacing="0" cellpadding="0" class="claim-panel"><tr><th>Район</th><th>Тема</th><th>Нед1</th><th>Нед2</th><th>Нед3</th><th>Нед4</th><th>Нед5</th><th>Нед6</th><th>Нед7</th><th>Нед8</th></tr>';
        data.forEach(function(element) {
            iHtml+=retTD(element);
           /* `<tr><td>${element.dist}</td><td>${element.topic}</td>
            <td>${element.cnt_w1}</td><td>${element.cnt_w2}</td><td>${element.cnt_w3}</td><td>${element.cnt_w4}</td><td>${element.cnt_w5}</td><td>${element.cnt_w6}</td><td>${element.cnt_w7}</td><td>${element.cnt_w8}</td></tr>`;*/
        });

        iHtml+='</table>';
        var newDiv = document.createElement("div");
        newDiv.innerHTML=iHtml;
        add_info_element(newDiv);
        console.log('loadTextInfo - Ok'); 
    });
    
}

/** Click on map without FTS */
function getClaimsByGeo(pobject,callback) {
    getDataApi({func:"public.get_claims_by_geo",args:[`'((${pobject.lat}, ${pobject.lng}), ${pobject.radius})'`,`'${pobject.topic}'`]},(pData) => { 
    // fetchApi(location.origin+'/api/get_claims_by_geo', object,  (pData) => {
        callback(pData.data);
    }); 
    }
    
function getClaimsByGeoFTS(pobject,callback) {
    getDataApi({func:"public.get_claims_by_geo_fts",args:[`'((${pobject.lat}, ${pobject.lng}), ${pobject.radius})'`,`'${pobject.topic}'`,`'${pobject.text}'`,`'${pobject.month}'`]},(pData) => {     
    // fetchApi(location.origin+'/api/get_claims_by_geo_fts', pobject,  (pData) => {
            callback(pData.data);
        }); 
        }   






/** Network */

/** Main function to get data */
function getDataApi(object,callback) {
    fetchApiPost(location.origin+'/api/webapi', object,  (pData) => {callback(pData) }); 
}


// Interface Function


function loadSelectedTopic() {
    loadGeoData();
}

function loadSelectedTopicFts() {
    loadGeoDataFts(get_current_topic_fts());
}


function mapSetHeatMap(data) {
    gpoints = data.map(x => (new google.maps.LatLng(x.latitude,x.longitude)));
    heatmap.setData(gpoints);
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
    fetch(url,{ credentials: 'include'})
    .then(response => response.json())
    .then(data =>callback(data))    
}

function fetchApiPost(pUrl, params={}, callback) {
    var url = new URL(pUrl);
        //,params = {lat:35.696233, long:139.570431};
    // Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    fetch(url,{ method: 'POST', credentials: 'include',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        }, body: JSON.stringify(params)})
    .then(response => response.json())
    .then(data =>callback(data))
    .catch(error => alert(error));
}

async function fetchApiAsync(pUrl, params={}) {
    try {
        var url = new URL(pUrl);
            //,params = {lat:35.696233, long:139.570431};
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        const response = await fetch(url,{ credentials: 'include'});
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
