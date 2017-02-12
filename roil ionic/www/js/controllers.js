var rig = 'Savanna_801_4_ii'
    , overView, reloadEverythingTimer, chart, showDataLabels = false
    , center, currentVisibleObject, windowInSeconds, spread, timeSliderPosition, updateCounter = 0
    , missedCounter = 0
    , retrieveCurrentWindowObject, playSpeed = 1
    , startTime, endtime, historicPlayTImer, historicCallTimer, lastUpdatedTime, arrayOfWindowObjects = []
    , canvasContainer, canvasInner;
angular.module('starter.controllers', []).controller('AuthCtrl', function ($scope, $rootScope, $state, $ionicHistory, $ionicSideMenuDelegate, $timeout, $window) {
    $ionicHistory.nextViewOptions({
        disableBack: true
    });
    $scope.authorization = {};
    $scope.signIn = function (form, user) {
        $state.go('home');
    };
    $scope.register = {
        fullname: ''
        , email: ''
        , gender: ''
        , username: ''
        , password: ''
    };
    $scope.forgotpassword = {
        email: ''
    };
    // disabled swipe menu
    $ionicSideMenuDelegate.canDragContent(false);
}).controller('HomeCtrl', function ($scope, $rootScope) {}).controller('RigsCtrl', function ($scope, $rootScope, $state, APIService, $cordovaToast, ERROR_CONNECTING, $q) {
    $scope.RigDetails = function (Rigname) {
        $rootScope.Rigname = Rigname;
        document.getElementById("api-loader").style.display = "block";
        /******************************* OVERVIEW DATA *******************************/
        var promise1 = APIService.latestOverview(Rigname);
        promise1.then(function (response) {
            $rootScope.storeOverviewValues = response.data;
        }, function (error) {
            document.getElementById("api-loader").style.display = "none";
            $cordovaToast.show(ERROR_CONNECTING, 'long', 'center').then(function (success) {}, function (error) {});
        });
        /******************************* OVERVIEW DATA *******************************/
        /******************************* LIVE DATA *******************************/
        var promise2 = APIService.latestVals(Rigname);
        promise2.then(function (response) {
            $rootScope.storeLatestValues = response.data;
        }, function (error) {
            document.getElementById("api-loader").style.display = "none";
            $cordovaToast.show(ERROR_CONNECTING, 'long', 'center').then(function (success) {}, function (error) {});
        });
        /******************************* LIVE DATA *******************************/
        $q.all([promise1, promise2]).then(function () {
            document.getElementById("api-loader").style.display = "none";
            $state.go('rig-details');
        });
    };
}).controller('RigDetailCtrl', function ($scope, $rootScope, $stateParams, APIService) {}).controller('SurveysCtrl', function ($scope, $rootScope, $cordovaFile, $cordovaFileTransfer, $window, $cordovaFileOpener2, ERROR_CONNECTING, ERROR_OPENING, $cordovaToast) {
    $scope.openPDF = function (pdf) {
        document.getElementById("api-loader").style.display = "block";
        var url = "http://cwcdemo.com/docs/" + pdf;
        var targetPath = $window.cordova.file.externalApplicationStorageDirectory + pdf;
        var trustHosts = true;
        var options = {};
        $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
            window.open($window.cordova.file.externalApplicationStorageDirectory + pdf, '_system', 'location=yes');
            document.getElementById("api-loader").style.display = "none";
        }, function (err) {
            document.getElementById("api-loader").style.display = "none";
            $cordovaToast.show(ERROR_CONNECTING, 'long', 'center').then(function (success) {}, function (error) {});
        }, function (progress) {});
    };
}).controller('GammaLogsCtrl', function ($scope, $rootScope, $cordovaFileTransfer, $cordovaFileOpener2, ERROR_CONNECTING, ERROR_OPENING) {
    $scope.openPDF = function (pdf) {
        document.getElementById("api-loader").style.display = "block";
        var url = "http://cwcdemo.com/docs/" + pdf;
        var targetPath = cordova.file.externalApplicationStorageDirectory + pdf;
        var trustHosts = true;
        var options = {};
        $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
            $cordovaFileOpener2.open(targetPath, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').then(function () {
                // Success!
            }, function (err) {
                document.getElementById("api-loader").style.display = "none";
                $cordovaToast.show(ERROR_OPENING, 'long', 'center').then(function (success) {}, function (error) {});
            });
            document.getElementById("api-loader").style.display = "none";
        }, function (err) {
            document.getElementById("api-loader").style.display = "none";
            $cordovaToast.show(ERROR_CONNECTING, 'long', 'center').then(function (success) {}, function (error) {});
        }, function (progress) {});
    };
}).controller('RigLiveDataCtrl', function ($scope, $rootScope, APIService, $interval, $ionicHistory) {
    $scope.Backout = function () {
        $ionicHistory.goBack();
    };
    var latestValues, nextVal = 0
        , stopEverySecond, stopEveryFiveSecond, lastTrack;
    $scope.$on('$ionicView.loaded', function () {
        $scope.live_data = true;
        $scope.overview_data = false;
        $scope.buttonClass = 'live-data-icon-green-new';
        $scope.nextVal = nextVal;
        $scope.latestValues = latestValues = JSON.parse($rootScope.storeLatestValues);
        var endtime = parseInt(latestValues.DateTime.Dates[0].replace(/\D/g, ''));
        $scope.endtime = moment(endtime).format("MMM Do YYYY, hh:mm:ss A");
        /******************************* LIVE DATA *******************************/
        var everySecond = function () {
            nextVal++;
            if (nextVal >= 28) return;
            $scope.nextVal = nextVal;
            $scope.latestValues = latestValues;
            var endtime = parseInt(latestValues.DateTime.Dates[nextVal].replace(/\D/g, ''));
            lastTrack = latestValues.DateTime.Dates[nextVal];
            $scope.endtime = moment(endtime).format("MMM Do YYYY, hh:mm:ss A");
        };
        var everyFiveSecond = function () {
            fetchLatestValues();
        };
        var fetchLatestValues = function () {
            var promise = APIService.latestVals($rootScope.Rigname);
            promise.then(function (response) {
                latestValues = JSON.parse(response.data);
                nextVal = latestValues.DateTime.Dates.indexOf(lastTrack);
                if (nextVal == -1) nextVal = 0;
            }, function (error) {});
        };
        stopEverySecond = $interval(everySecond, 1000);
        stopEveryFiveSecond = $interval(everyFiveSecond, 15000);
        /******************************* LIVE DATA *******************************/
        $scope.changeView = function (whichView) {
            if (whichView == 'live-data-icon-green-new') {
                $scope.live_data = false;
                $scope.overview_data = true;
                $scope.buttonClass = 'live-data-icon-white-new';
            }
            else {
                $scope.live_data = true;
                $scope.overview_data = false;
                $scope.buttonClass = 'live-data-icon-green-new';
            }
        };
        /******************************* OVERVIEW DATA *******************************/
        var slider = document.getElementById('live-data');
        slider.style.height = '430px';
        slider.style.margin = '0 auto 0px';
        $scope.onextVal = 0;
        $scope.overviewValues = JSON.parse($rootScope.storeOverviewValues);
        var oendtime = parseInt($scope.overviewValues.DateTime.Dates[0].replace(/\D/g, ''));
        $scope.oendtime = moment(oendtime).format("MMM Do YYYY, hh:mm:ss A");
        noUiSlider.create(slider, {
            start: 0, // 4 handles, starting at...
            //direction: 'rtl', // Put '0' at the bottom of the slider
            orientation: 'vertical', // Orient the slider vertically
            behaviour: 'tap-drag', // Move handle on tap, bar is draggable
            //tooltips: true,
            step: 1
            , format: wNumb({
                decimals: 0
            })
            , range: {
                'min': 1
                , 'max': 499
            }
        });
        slider.noUiSlider.on('slide', function (values, handle, unencoded, tap, positions) {
            $scope.onextVal = values[0];
            var oendtime = parseInt($scope.overviewValues.DateTime.Dates[values[0]].replace(/\D/g, ''));
            $scope.oendtime = moment(oendtime).format("MMM Do YYYY, hh:mm:ss A");
            $scope.$apply();
        });
        /******************************* OVERVIEW DATA *******************************/
    });
    $scope.$on("$ionicView.leave", function (event, data) {
        $interval.cancel(stopEverySecond);
        $interval.cancel(stopEveryFiveSecond);
    });
}).controller('LogsHistoricLiveCtrl', function ($scope, $rootScope, APIService, $ionicModal, $ionicHistory) {
    $scope.Backout = function () {
        $ionicHistory.goBack();
    };
    $scope.live_log = true;
    $scope.buttonClass = 'live-data-icon-green-new';
    $scope.changeView = function (whichView) {
        if (whichView == 'live-data-icon-green-new') {
            $scope.live_log = false;
            $scope.buttonClass = 'live-data-icon-white-new';
        }
        else {
            $scope.live_log = true;
            $scope.buttonClass = 'live-data-icon-green-new';
        }
    };
    $rootScope.HandleTrackClick = function (index, status) { //Build Modal on track click
        if (status) $rootScope.trackOnOff[index] = {
            "On": "on_txt"
            , "Off": "off_txt"
        };
        else $rootScope.trackOnOff[index] = {
            "On": "off_txt"
            , "Off": "on_txt"
        };
        toggle_activate(index, status);
    };
    $scope.initOnOff = function (obj) {
        for (i = 0; i < obj.Tracks.length; i++) $rootScope.trackOnOff[i] = {
            "On": "off_txt"
            , "Off": "off_txt"
        };
    };
    var load_Everything = function (success_callback) {
        if (overView === undefined || overView.CurrentWindow === undefined || overView.CurrentWindow.SetStart === undefined) {
            var promise = APIService.rigEverything(rig);
            promise.then(function (response) {
                var tempO = JSON.parse(response.data);
                $scope.initOnOff(tempO);
                ConvertingDatesANDGeneratingCoordinates(tempO);
                overView = tempO;
                if (success_callback !== undefined) {
                    success_callback(overView);
                }
            }, function (error) {});
        }
        else {
            if (overView.CurrentWindow.SetEnd === undefined) {
                var promise = APIService.rigEverythingStart(rig, overView.CurrentWindow.SetStart);
                promise.then(function (response) {
                    var tempO = JSON.parse(response.data);
                    $scope.initOnOff(tempO);
                    ConvertingDatesANDGeneratingCoordinates(tempO);
                    overView = tempO;
                    if (success_callback !== undefined) {
                        success_callback(overView);
                    }
                }, function (error) {});
            }
            else {
                var promise = APIService.rigEverythingStartEnd(rig, overView.CurrentWindow.SetStart, overView.CurrentWindow.SetEnd);
                promise.then(function (response) {
                    var tempO = JSON.parse(response.data);
                    $scope.initOnOff(tempO);
                    ConvertingDatesANDGeneratingCoordinates(tempO);
                    overView = tempO;
                    if (success_callback !== undefined) {
                        success_callback(overView);
                    }
                }, function (error) {});
            }
        }
    };
    retrieveCurrentWindowObject = function (startt, endt, successCallback) {
        var startTimeUrl = yCoordinateToDateTimeURL(startt);
        var endTimeUrl = yCoordinateToDateTimeURL(endt);
        var promise = APIService.betweenTime(rig, startTimeUrl, endTimeUrl);
        promise.then(function (response) {
            var tempO = JSON.parse(response.data);
            convertDates(tempO);
            generate_coordinates(tempO);
            successCallback(tempO);
        }, function (error) {});
    };
    $scope.goTimespanSelect = function () {
        chart.options.data[overView.Tracks.length].dataPoints = [];
        arrayOfWindowObjects = [];
        chart.render();
        retrieveCurrentWindowObject(startTime, endtime, function (CW) {
            CW.newinterval = true;
            overView.CurrentWindow = CW;
            changeLogObject(overView.CurrentWindow);
            //            callHistoricTimerTick(); //calls the next object for the backup array
            historicCallTimer = setInterval(callHistoricTimerTick, 5000);
            $('ul#speed').html(generateSpeedTags(Math.abs(endtime - startTime)));
        });
        $scope.timespanModal.hide();
    };
    $scope.$on('$ionicView.loaded', function () {
        /******** TRACKS POPUP *********/
        $ionicModal.fromTemplateUrl('templates/tracks-modal.html', {
            scope: $scope
            , animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.trackModal = modal;
        });
        $scope.openTrackModal = function () {
            $scope.latestValues = JSON.parse($rootScope.storeLatestValues);
            $scope.trackModal.show();
        };
        $scope.closeTrackModal = function () {
            $scope.trackModal.hide();
        };
        // Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.trackModal.remove();
        });
        /******** TRACKS POPUP *********/
        /******** RANGE SLIDER POPUP *********/
        $ionicModal.fromTemplateUrl('templates/track-depth-modal.html', {
            scope: $scope
            , animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.rangeModal = modal;
        });
        $scope.openRangeModal = function (trackIndex) {
            $scope.trackModal.hide();
            $scope.rangeModal.show();
            $scope.TrackName = $scope.latestValues.Tracks[trackIndex].Name;
            colorSlider(trackIndex);
            zoomSlider(trackIndex);
            offsetSlider(trackIndex);
        };
        $scope.closeRangeModal = function () {
            $scope.rangeModal.hide();
        };
        // Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.rangeModal.remove();
        });
        /******** RANGE SLIDER POPUP *********/
        /******** TIME SPAN POPUP *********/
        $ionicModal.fromTemplateUrl('templates/time-span-modal.html', {
            scope: $scope
            , animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.timespanModal = modal;
        });
        $scope.openTimeSpanModal = function () {
            $scope.timespanModal.show();
            overView.newinterval = true;
            changeLogObject(overView);
            load_timeSpan_slider();
            load_timeSpan_slider2();
        };
        $scope.closeTimeSpanModal = function () {
            $scope.timespanModal.hide();
        };
        // Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.timespanModal.remove();
        });
        /******** TIME SPAN POPUP *********/
        load_Everything(load_Everything_callback);
    });
    $scope.$on('$ionicView.leave', function () {});
}).controller('LogsHistoricOfflineCtrl', function ($scope, $rootScope, $ionicModal, $ionicHistory) {
    $scope.Backout = function () {
        $ionicHistory.goBack();
    };
    $scope.$on('$ionicView.loaded', function () {
        $scope.buttonClass = 'live-data-icon-green';
    });
}).controller('WellsCtrl', function ($scope, $rootScope, $ionicHistory) {}).controller('ChartCtrl', function ($scope, $rootScope, APIService) {
    var promise = APIService.latestVals();
    promise.then(function (response) {
        console.log(response);
    }, function (error) {});
}).controller('LogoutCtrl', function ($scope, $rootScope, $state, $window, $ionicHistory) {
    $ionicHistory.clearCache().then(function () {
        //now you can clear history or goto another state if you need
        $ionicHistory.clearHistory();
        $ionicHistory.nextViewOptions({
            disableBack: true
            , historyRoot: true
        });
        $state.go('login');
    });
});
/****************************************** OUT OF CONTEXT ******************************************/
var makeChartFullWidth = function () {
    var elements = document.getElementsByClassName("canvasjs-chart-canvas")
    for (i = 0; i < elements.length; i++) {
        elements[i].style.width = "110%";
        elements[i].style.left = "-10px"
    }
}
var load_Everything_callback = function () {
    currentVisibleObject = overView;
    load_chart();
    adjustChartHeight(60, 10);
    makeChartFullWidth()
        //adjustChart(60, 7);
};
var ConvertingDatesANDGeneratingCoordinates = function (tempO) {
    convertDates(tempO);
    generate_coordinates(tempO);
    convertDates(tempO.Latest);
    generate_coordinates(tempO.Latest);
    convertDates(tempO.CurrentWindow);
    generate_coordinates(tempO.CurrentWindow);
};
var convertDates = function (obj) {
    var realDates = [];
    var i = 0;
    obj.DateTime.Dates.forEach(function (JSONdate) {
        realDates[i] = parseJsonDate(JSONdate);
        i++;
    });
    obj.RealDates = realDates;
    obj.RealStartTime = parseJsonDate(obj.starttime);
    obj.RealEndTime = parseJsonDate(obj.endtime);
};
var parseJsonDate = function (jsonDateString) {
    return parseInt(jsonDateString.replace('/Date(', '')) * -1;
};
var generate_coordinates = function (obj) {
    for (i = 0; i < obj.Tracks.length; i++) {
        if (overView === undefined) {
            obj.Tracks[i].colorposition = Math.random() + 0.27;
            obj.Tracks[i].status = 0;
        }
        else {
            obj.Tracks[i].colorposition = overView.Tracks[i].colorposition;
            obj.Tracks[i].status = overView.Tracks[i].status;
        }
        var coordinates = combine_x_y(obj.Tracks[i].Values, obj.RealDates);
        obj.Tracks[i].coordinates = coordinates;
    }
};
var combine_x_y = function (arr_x, arr_y) { // created coordinates for tracks - called by load_tracks
    var array = [];
    $(arr_x).each(function (index) {
        var x = arr_x[index];
        var y = arr_y[index];
        array.push({
            x: x
            , y: y
        });
    });
    return array;
};
var setup_axis_x_options = function (t) { //function to set up the axis scales - called by load_chart
    var axisOptions = [];
    for (var i = 0; i < t.length; i++) {
        axisOptions[i] = {
            minimum: t[i].xAxisStart
            , maximum: t[i].xAxisEnd
            , valueFormatString: " ", //  <- no labels on x
            tickLength: 0
            , labelFontSize: 0
            , lineThickness: 0
            , tickThickness: 0
        };
    };
    axisOptions[t.length] = { /*This Data Series is for the selection*/
        minimum: 0
        , maximum: 100
        , valueFormatString: " ", //  <- no labels on x
        tickLength: 0
        , labelFontSize: 0
        , lineThickness: 0
        , tickThickness: 0
    };
    return axisOptions;
};
var setup_chart_options = function (t) { //function to put all the data in chart  - called by load_chart
    // collect data
    var data = [];
    for (var i = 0; i < t.length; i++) {
        data[i] = {
            label: t[i].Name
            , color: colorposition_tocolor(t[i].colorposition)
            , type: "line"
            , axisXIndex: i
        };
        if (t[i].status != 0) {
            data[i].dataPoints = t[i].coordinates;
        }
        data[t.length] = { /*This Data Series is for the selection*/
            label: 'Selection'
            , color: 'rgb(200,255 ,0)'
            , type: "rangeArea"
            , axisXIndex: t.length
            , dataPoints: [
                /*  // Y: [Low, High]
                             {x: 5, y:[overView.RealStartTime, overView.RealEndTime]},
                             {x: 95, y:[overView.RealStartTime, overView.RealEndTime]}
                             */
                ]
        };
    }
    return data;
};
var turnTrackOn = function (i) {
    overView.Tracks[i].status = 1;
    chart.options.data[i].dataPoints = currentVisibleObject.Tracks[i].coordinates;
    chart.options.data[i].legendText = overView.Tracks[i].Name;
    chart.options.data[i].showInLegend = showDataLabels;
};
var turnTrackOff = function (i) {
    overView.Tracks[i].status = 0;
    chart.options.data[i].dataPoints = [];
    chart.options.data[i].showInLegend = false;
};
var colorposition_tocolor = function (x) {
    var red = Math.round(Math.abs(Math.sin(x)) * 255);
    var blue = Math.round(Math.abs(Math.sin(3 * x)) * 255);
    var green = Math.round(Math.abs(Math.sin(9 * x)) * 255);
    var color = 'rgb(' + red + ',' + blue + ' ,' + green + ')';
    return color;
};
var toggle_activate = function (index, status) { // This is the button to turn tracks on and off
    if (status == 1) turnTrackOn(index);
    else turnTrackOff(index);
    chart.render();
};
var adjustChartHeight = function (spaceForUI, pc) { // function when window viewport is changed
    canvasContainer = $(document.getElementsByClassName("canvasjs-chart-container")[0]);
    canvasInner = $(document.getElementsByClassName("canvasjs-chart-canvas")[0]);
    var deviceHeight = $(window).height();
    var offset = overView.Tracks.length * pc;
    $('#drewschart').height(deviceHeight + offset - spaceForUI);
    var container_height = deviceHeight - spaceForUI;
    $("#chart_container").css({
        'max-height': container_height + 'px'
        , 'height': container_height + 'px'
        , 'overflow': 'hidden'
    });
    chart.render();
};
var adjustChart = function (spaceForUI, pc) {
    canvasContainer = $(document.getElementsByClassName("canvasjs-chart-container")[0]);
    canvasInner = $(document.getElementsByClassName("canvasjs-chart-canvas")[0]);
    var deviceHeight = $(window).height();
    var offset = overView.Tracks.length * pc
    canvasInner.height(deviceHeight + offset - spaceForUI);
    var container_height = deviceHeight - spaceForUI;
    $(canvasContainer).css({
        'max-height': container_height + 'px'
        , 'height': container_height + 'px'
        , 'overflow': 'hidden'
    });
    chart.render();
}
var colorSlider = function (trackIndex) {
    var color_slider = document.getElementById('color_slider');
    if ($("div#color_slider").hasClass("noUi-target")) color_slider.noUiSlider.destroy();
    noUiSlider.create(color_slider, { // creation of the color slider
        start: overView.Tracks[trackIndex].colorposition
        , connect: true
        , range: {
            'min': 0
            , 'max': 1.57079632679
        }
    });
    color_slider.noUiSlider.on('update', function (values, handle) { // event for the color slider
        var target = this.target;
        var x = values[0];
        var color = colorposition_tocolor(x);
        overView.Tracks[trackIndex].colorposition = x;
        document.getElementById("setcolor").style.background = color;
        chart.options.data[trackIndex].color = color;
        chart.render();
    });
    $("#track_depth_modal").parent().parent().css("z-index", 11);
};
var zoomSlider = function (trackIndex) {
    var zoom_slider = document.getElementById('zoom_slider');
    if ($("div#zoom_slider").hasClass("noUi-target")) zoom_slider.noUiSlider.destroy();
    noUiSlider.create(zoom_slider, { // this is the creation of the x axis scale slider
        start: 80
        , range: {
            'min': 0
            , 'max': 100
        }
    });
    zoom_slider.noUiSlider.on('update', function (values, handle) { // this is the event when x axis scale slider is moved
        var value1 = (100 - values[0]);
        var range = (overView.Tracks[trackIndex].farRightXAxis - overView.Tracks[trackIndex].farLeftXAxis) * 2;
        center = (((overView.Tracks[trackIndex].xAxisEnd - overView.Tracks[trackIndex].xAxisStart) / 2) + overView.Tracks[trackIndex].xAxisStart * 1);
        overView.Tracks[trackIndex].xAxisStart = (center - (range * value1) / 100);
        overView.Tracks[trackIndex].xAxisEnd = (center + (range * value1) / 100);
        $('#left_scale_value').html(Math.round(overView.Tracks[trackIndex].xAxisStart * 100) / 100);
        $('#right_scale_value').html(Math.round(overView.Tracks[trackIndex].xAxisEnd * 100) / 100);
        chart.options.axisX[trackIndex].minimum = overView.Tracks[trackIndex].xAxisStart;
        chart.options.axisX[trackIndex].maximum = overView.Tracks[trackIndex].xAxisEnd;
        chart.render();
    });
};
var offsetSlider = function (trackIndex) {
    var offset_slider = document.getElementById('offset_slider');
    if ($("div#offset_slider").hasClass("noUi-target")) offset_slider.noUiSlider.destroy();
    noUiSlider.create(offset_slider, { // this is the creation of the x axis scale slider
        start: 0
        , range: {
            'min': -50
            , 'max': 50
        }
    });
    offset_slider.noUiSlider.on('update', function (values, handle) { // this is the event when x axis scale slider is moved
        var value1 = (values[0] * -1);
        var range = (overView.Tracks[trackIndex].xAxisEnd - overView.Tracks[trackIndex].xAxisStart);
        overView.Tracks[trackIndex].xAxisStart = (center - range / 2) + (value1 * range / 100);
        overView.Tracks[trackIndex].xAxisEnd = (center + range / 2) + (value1 * range / 100);
        $('#left_scale_value').html(Math.round(overView.Tracks[trackIndex].xAxisStart * 100) / 100);
        $('#right_scale_value').html(Math.round(overView.Tracks[trackIndex].xAxisEnd * 100) / 100);
        chart.options.axisX[trackIndex].minimum = overView.Tracks[trackIndex].xAxisStart;
        chart.options.axisX[trackIndex].maximum = overView.Tracks[trackIndex].xAxisEnd;
        chart.render();
    });
};
var load_timeSpan_slider = function () { // This created the Time Span slider bar
    var timeSlider = document.getElementById('time-span-1');
    timeSlider.style.height = '400px';
    timeSlider.style.margin = '0 auto 0px';
    var fifteenMin = (1000 * 60 * 15); /* 15 minutes */
    spread = Math.abs(overView.RealEndTime - overView.RealStartTime);
    //if($("div#time-span-1").hasClass("noUi-target"))
    //  timeSlider.noUiSlider.destroy();
    noUiSlider.create(timeSlider, {
        start: spread
        , orientation: "vertical"
        , connect: true
        , range: {
            'min': 0
            , '20%': Math.floor((spread * .04))
            , '40%': Math.floor((spread * .14))
            , '60%': Math.floor((spread * .34))
            , '80%': Math.floor((spread * .60))
            , 'max': spread
        }
    });
    timeSlider.noUiSlider.on('update', function (values, handle) { // event for the Time Span slider
        windowInSeconds = (((spread - values[0]) + fifteenMin) / 1000);
        var Minutes = Math.floor(windowInSeconds / (60)) % 60;
        var Hours = Math.floor(windowInSeconds / (60 * 60)) % 24;
        var Days = Math.floor(windowInSeconds / (60 * 60 * 24));
        if (Days > 0) $('#timeLabel').html(Days + " days <br>" + Hours + " hours");
        else if (Hours > 0) $('#timeLabel').html(Hours + " hours <br>" + Minutes + " minutes");
        else $('#timeLabel').html(Minutes + " minutes");
        updateStartTime();
    });
};
var updateStartTime = function () {
    var windowInMili = windowInSeconds * 1000;
    var range = spread - windowInMili;
    startTime = (overView.RealEndTime * -1) - Math.floor(range * timeSliderPosition + windowInMili);
    endtime = startTime + windowInMili;
    endtime *= -1;
    startTime *= -1;
    $('#locationLabel, #spanStartTime').html(chopDate(new Date(startTime)));
    chart.options.data[overView.Tracks.length].dataPoints = [
        {
            x: 0
            , y: [startTime, endtime]
        }
        , {
            x: 100
            , y: [startTime, endtime]
        }
    ]; // Y: [Low, High]
    chart.render();
};
var load_timeSpan_slider2 = function () { // This created the Time Span slider bar
    var dateSlider = document.getElementById('time-span-2');
    dateSlider.style.height = '400px';
    dateSlider.style.margin = '0 auto 0px';
    //if($("div#time-span-2").hasClass("noUi-target"))
    //  dateSlider.noUiSlider.destroy();
    noUiSlider.create(dateSlider, {
        start: 1
        , orientation: "vertical"
        , connect: true
        , range: {
            'min': 0
            , 'max': 1
        }
    });
    dateSlider.noUiSlider.on('update', function (values, handle) { // event for the Time Span slider
        timeSliderPosition = 1 - values[0];
        updateStartTime();
    });
};
var chopDate = function (date) {
    var str = date + ""; //conversion to string
    return str.slice(4, 24);
};
var changeLogObject = function (obj) {
    currentVisibleObject = obj;
    for (i = 0; i < overView.Tracks.length; i++) {
        if (overView.Tracks[i].status === 1) {
            chart.options.data[i].dataPoints = obj.Tracks[i].coordinates;
        }
    }
    chart.options.axisY.minimum = obj.RealEndTime;
    chart.options.axisY.maximum = obj.RealStartTime;
    if (obj.newinterval === true) {
        chart.options.axisY.interval = chooseInterval(obj);
        obj.newinterval = false;
    }
    chart.render();
};
var chooseInterval = function (obj) {
    if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (30 * 60 * 1000)) {
        return (5 * 60 * 1000);
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (60 * 60 * 1000)) {
        return (10 * 60 * 1000);
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (90 * 60 * 1000)) {
        return (15 * 60 * 1000);
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (3 * 60 * 60 * 1000)) {
        return (30 * 60 * 1000);
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (6 * 60 * 60 * 1000)) {
        return (1 * 60 * 60 * 1000);
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (12 * 60 * 60 * 1000)) {
        return (2 * 60 * 60 * 1000);
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (1 * 24 * 60 * 60 * 1000)) {
        return (4 * 60 * 60 * 1000);
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (2 * 24 * 60 * 60 * 1000)) {
        return (8 * 60 * 60 * 1000);
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (3 * 24 * 60 * 60 * 1000)) {
        return (12 * 60 * 60 * 1000);
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (6 * 24 * 60 * 60 * 1000)) {
        return (1 * 24 * 60 * 60 * 1000);
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (12 * 24 * 60 * 60 * 1000)) {
        return (2 * 24 * 60 * 60 * 1000);
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (24 * 24 * 60 * 60 * 1000)) {
        return (4 * 24 * 60 * 60 * 1000);
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (48 * 24 * 60 * 60 * 1000)) {
        return (16 * 24 * 60 * 60 * 1000);
    }
};
var incrementLog = function (obj) {
    var LastTime = currentVisibleObject.RealDates[currentVisibleObject.RealDates.length - 1];
    var newObj;
    for (i = 0; i < obj.RealDates.length; i++) {
        if (obj.RealDates[i] > LastTime) {
            for (a = 1; a < obj.RealDates.length; a++) {
                newObj.RealDates[a - 1] = obj.RealDates[a];
                for (trackNum = 0; trackNum < obj.Tracks.length; trackNum++) {
                    newObj.Tracks[trackNum].coordinates[a - 1] = obj.Tracks[trackNum].coordinates[a];
                }
            }
            newObj.RealDates[obj.RealDates.length - 1] = obj.RealDates[i];
            currentVisibleObject = newObj;
        }
    }
};
var liveTimerTick = function () {
    changeLogObject(overView.CurrentWindow);
};
var dateTimeToUrlString = function (dateT) {
    var DateString = "";
    DateString += dateT.getFullYear();
    DateString += "-";
    DateString += (dateT.getMonth() + 1);
    DateString += "-";
    DateString += (dateT.getDate());
    DateString += "-";
    DateString += dateT.getHours();
    DateString += "-";
    DateString += dateT.getMinutes();
    DateString += "-";
    DateString += dateT.getSeconds();
    return DateString;
};
var yCoordinateToDate = function (y) {
    return new Date(parseInt(y) * -1);
};
var yCoordinateToDateTimeURL = function (y) {
    return dateTimeToUrlString(yCoordinateToDate(y));
};
var missedPercent = function () {
    return (missedCounter / (missedCounter + updateCounter)) * 100;
};
var stopGraph = function () {
    $("img#stopGraphButton").hide();
    $("img#playGraphButton").show();
    clearInterval(historicPlayTImer);
};
var playGraph = function () {
    $("img#playGraphButton").hide();
    $("img#stopGraphButton").show();
    lastUpdatedTime = Date.now();
    historicPlayTImer = setInterval(playHistoricTimerTick, 100);
};
var playHistoricTimerTick = function () {
    dropUneccessaryArrayObject();
    var updatedBool = false;
    var timechange = (Date.now() - lastUpdatedTime) * playSpeed;
    var desiredEndTime = LastTimeInWindow() - timechange;
    for (var ii = 0; ii < arrayOfWindowObjects.length; ii++) {
        if (arrayOfWindowObjects[ii].RealStartTime < desiredEndTime) {
            continue;
        }
        for (var i2 = 0; i2 < arrayOfWindowObjects[ii].RealDates.length; i2++) {
            if (arrayOfWindowObjects[ii].RealDates[i2] < desiredEndTime) {
                break;
            }
            if (arrayOfWindowObjects[ii].RealDates[i2] < LastTimeInWindow()) {
                updatedBool = true;
                overView.CurrentWindow.RealDates.shift();
                overView.CurrentWindow.RealDates.push(arrayOfWindowObjects[ii].RealDates[i2]);
                overView.CurrentWindow.RealStartTime = overView.CurrentWindow.RealDates[0];
                overView.CurrentWindow.RealEndTime = overView.CurrentWindow.RealDates[overView.CurrentWindow.RealDates.length - 1];
                for (var i3 = 0; i3 < overView.CurrentWindow.Tracks.length; i3++) {
                    overView.CurrentWindow.Tracks[i3].coordinates.shift();
                    overView.CurrentWindow.Tracks[i3].coordinates.push(arrayOfWindowObjects[ii].Tracks[i3].coordinates[i2]);
                }
            }
        }
    }
    if (updatedBool === true) {
        lastUpdatedTime = Date.now();
        changeLogObject(overView.CurrentWindow);
        updateCounter += 1;
    }
    else {
        missedCounter += 1;
    }
};
var dropUneccessaryArrayObject = function () {
    for (var i = arrayOfWindowObjects.length - 1; i >= 0; i--) {
        if (arrayOfWindowObjects[i].RealEndTime > LastTimeInWindow()) {
            arrayOfWindowObjects.splice(i, 1);
        }
    }
};
var callHistoricTimerTick = function () {
    dropUneccessaryArrayObject();
    if (arrayOfWindowObjects.length < 10) {
        var startt = LastTimeInArray();
        var endt = startt + CurrentWindowSpan();
        retrieveCurrentWindowObject(startt, endt, function (CW) {
            arrayOfWindowObjects.push(CW);
        });
    }
};
var startTimeinWindow = function () {
    return overView.CurrentWindow.RealStartTime;
};
var LastTimeInWindow = function () {
    return overView.CurrentWindow.RealEndTime;
};
var CurrentWindowSpan = function () {
    return (LastTimeInWindow() - startTimeinWindow());
};
var LastTimeInArray = function () {
    var lastTime = LastTimeInWindow();
    for (var i = arrayOfWindowObjects.length - 1; i >= 0; i--) {
        if (arrayOfWindowObjects[i].RealEndTime < lastTime) {
            lastTime = arrayOfWindowObjects[i].RealEndTime;
        }
    }
    return lastTime;
};
var changeSpeed = function (sp) {
    //$(speed).html(sp + 'x');    
    playSpeed = (sp * 1);
};
var generateSpeedTags = function (windowSize) {
    var speedTagsHTML = '';
    var secondsInWindow = windowSize / 1000;
    var maxRetrieval = secondsInWindow * (1 / 5);
    var onePercentOfMax = maxRetrieval / 100;
    speedTagsHTML += newSpeedTag(5 * onePercentOfMax, '1x');
    speedTagsHTML += newSpeedTag(10 * onePercentOfMax, '2x');
    speedTagsHTML += newSpeedTag(20 * onePercentOfMax, '3x');
    speedTagsHTML += newSpeedTag(40 * onePercentOfMax, '4x');
    speedTagsHTML += newSpeedTag(80 * onePercentOfMax, '5x');
    return speedTagsHTML;
};
var newSpeedTag = function (number, symbol) {
    var prettyNumber = toStringWithSignificantDigits(number, 2);
    var NewSpeedTag = '<li><a href="javascript:;" onclick="changeSpeed(' + prettyNumber + ')" data-speed="' + symbol + '">' + symbol + '</a></li>';
    return NewSpeedTag;
};
var toStringWithSignificantDigits = function (x, len) {
    if (x == 0) return x.toFixed(len - 1); // makes little sense for 0
    var numDigits = Math.ceil(Math.log10(Math.abs(x)));
    var rounded = Math.round(x * Math.pow(10, len - numDigits)) * Math.pow(10, numDigits - len);
    return rounded.toFixed(Math.max(len - numDigits, 0));
};
var load_chart = function () {
    chart = new CanvasJS.Chart("drewschart", {
        backgroundColor: "transparent"
        , toolTip: {
            shared: true
        }
        , legend: {
            dockInsidePlotArea: true
            , verticalAlign: "center"
            , horizontalAlign: "right"
        }
        , axisY: {
            lineThickness: 0
            , tickThickness: 0
            , valueFormatString: " ", //space
            minimum: overView.RealEndTime
            , maximum: overView.RealStartTime
            , labelFormatter: function (e) {
                return '';
            }
            , tickLength: 0
            , interval: ((overView.RealEndTime * -1) - (overView.RealStartTime * -1)) / 5
            , labelWrap: true
            , interlacedColor: "rgba(233, 234, 235, 0.7)"
                //gridColor: "transparent" 
                /*labelMaxWidth: 80, */
        }
        , axisX: setup_axis_x_options(overView.Tracks)
        , /*axisX: {
                                                                                                                                   lineThickness:0,
                                                                                                                                   tickThickness:0,
                                                                                                                                   valueFormatString:" ",//space
                                                                                                                               },*/
        data: setup_chart_options(overView.Tracks)
    });
    chart.render();
    $('#spanStartTime').html(chopDate(new Date(overView.RealEndTime)));
    $('#spanEndTime').html(chopDate(new Date(overView.RealStartTime)));
};
/****************************************** OUT OF CONTEXT ******************************************/