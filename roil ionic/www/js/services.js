angular.module('starter.services', [])

.factory('APIService', function ($http) {
    var service = {};
    service.latestVals = latestVals;
    service.latestOverview = latestOverview;
    service.rigEverything = rigEverything;
    service.rigEverythingStart = rigEverythingStart;
    service.rigEverythingStartEnd = rigEverythingStartEnd;
    service.betweenTime = betweenTime;
    return service;

    function latestVals(Rigname) {
        return $http.get('http://roilapi.azurewebsites.net/api/latestVals?table='+Rigname+'&offset=30');        
    }
    
    function latestOverview(Rigname) {
        return $http.get('http://roilapi.azurewebsites.net/api/Overview?Rigname='+Rigname+'&NumberOfRows=500');
    }
    
    function rigEverything(Rigname) {
        return $http.get('https://roilapi.azurewebsites.net/api/Everything?Rig='+Rigname);
    }
    
    function rigEverythingStart(Rigname, Start) {
        return $http.get('https://roilapi.azurewebsites.net/api/Everything?Rig='+Rigname+'&Start='+Start);
    }
    
    function rigEverythingStartEnd(Rigname, Start, End) {
        return $http.get('https://roilapi.azurewebsites.net/api/Everything?Rig='+Rigname+'&Start='+Start+'&End='+End);
    }
    
    function betweenTime(Rigname, Start, End) {
        return $http.get("https://roilapi.azurewebsites.net/api/betweenTime?Rigname="+Rigname+"&NumberOfRows=500&StartTime=" + Start + "&EndTime=" + End);        
    }
});