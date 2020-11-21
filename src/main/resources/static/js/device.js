var dataOriginal;
var deviceNumberChecked = 0;
var deviceList = [];

$(document).ready(function () {
    getData();
    getCheckbox();
});

function getCheckbox() {
    $('#select_all').on('click', function () {
        if (this.checked) {
            $('.checkbox').each(function () {
                this.checked = true;
            });
        } else {
            $('.checkbox').each(function () {
                this.checked = false;
            });
        }
    });

    for (var i = 0; i < 30; i++) {
        var j = i + 1;
        $('#selectNumberPage').append($("<option>").val("" + j + "").text("" + j + ""));
        $('#selectNumberRecord').append($("<option>").val("" + j + "").text("" + j + ""));
    }

}

function getDeviceIdList() {
    if ($('#select_all').is(":checked")) {
        deviceList = [];
        for (var i = 0; i < dataOriginal.deviceStatistics.length; i++) {
            deviceList.push(dataOriginal.deviceStatistics[i].deviceId);
        }
    } else {
        deviceList = [];
    }
    if (deviceList.length != 0) {
        enableAction(deviceList.length);
    } else {
        disableAction();
    }
}

function getDeviceIdInRow(deviceId) {
    $("#select_all").prop("checked", false);
    if (!deviceList.includes(deviceId)) {
        deviceList.push(deviceId);
    } else {
        deviceList.remove(deviceId);
    }
    if (deviceList.length != 0) {
        enableAction(deviceList.length);
    } else {
        disableAction();
    }
}

function enableAction(number) {
    $("#restartDevice").removeClass("divDisabled");
    $("#turnOffDevice").removeClass("divDisabled");
    $("#turnOnDevice").removeClass("divDisabled");
    $("#runMultiScript").removeClass("divDisabled");
    $("#deleteDevice").removeClass("divDisabled");

    $("#restartDeviceNumber").text(number);
    $("#turnOffDeviceNumber").text(number);
    $("#turnOnDeviceNumber").text(number);
    $("#runScriptDeviceNumber").text(number);
    $("#deleteDeviceNumber").text(number);
}

function disableAction() {
    $("#restartDevice").addClass("divDisabled");
    $("#turnOffDevice").addClass("divDisabled");
    $("#turnOnDevice").addClass("divDisabled");
    $("#runMultiScript").addClass("divDisabled");
    $("#deleteDevice").addClass("divDisabled");

    $("#restartDeviceNumber").text('');
    $("#turnOffDeviceNumber").text('');
    $("#turnOnDeviceNumber").text('');
    $("#runScriptDeviceNumber").text('');
    $("#deleteDeviceNumber").text('');
}

Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

function getData() {
    $.ajax({
        type: "POST",
        url: "http://192.168.137.123:8082/api/manage_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        data: {
            "deviceId": $("#search_input").val().trim(),
            "page": 0,
            "size": 100
        },
        success: function (data) {
            dataOriginal = data;
            $("#deviceTotal").text(dataOriginal.deviceTotal);
            filter(dataOriginal);
            setTimeout(function () {
                getData();
            }, 5000);
        }
    });
}

function filter(dataOriginal) {
    $("#device_all").text(dataOriginal.deviceTotal);
    $("#device_on").text(dataOriginal.deviceActive);
    $("#device_off").text(dataOriginal.deviceTotal - dataOriginal.deviceActive);
    $("#cpu").text(dataOriginal.cpu);
    $("#ram").text(dataOriginal.ram);

    var rowList = [];
    var device_status = $("#device_status").text();
    if (device_status == 'all') {
        $("#device_status").text('all');
        showTable(dataOriginal.deviceStatistics);
    } else if (device_status == 'on') {
        $("#device_status").text('on');
        if (dataOriginal.deviceStatistics.length != 0) {
            for (var i = 0; i < dataOriginal.deviceStatistics.length; i++) {
                if (dataOriginal.deviceStatistics[i].isActive == true) {
                    rowList.push(dataOriginal.deviceStatistics[i]);
                }
            }
        }
        showTable(rowList);
    } else if (device_status == 'off') {
        $("#device_status").text('off');
        if (dataOriginal.deviceStatistics.length != 0) {
            for (var i = 0; i < dataOriginal.deviceStatistics.length; i++) {
                if (dataOriginal.deviceStatistics[i].isActive == false) {
                    rowList.push(dataOriginal.deviceStatistics[i]);
                }
            }
        }
        showTable(rowList);
    }
}

function showTab(type) {
    var rowList = [];
    var dataTable = dataOriginal.deviceStatistics;
    if (type == 'all') {
        showTable(dataTable);
        $("#device_status").text('all');
    } else if (type == 'on') {
        $("#device_status").text('on');
        if (dataTable.length != 0) {
            for (var i = 0; i < dataTable.length; i++) {
                if (dataTable[i].isActive == true) {
                    rowList.push(dataTable[i]);
                }
            }
        }
        showTable(rowList);
    } else if (type == 'off') {
        $("#device_status").text('off');
        if (dataTable.length != 0) {
            for (var i = 0; i < dataTable.length; i++) {
                if (dataTable[i].isActive == false) {
                    rowList.push(dataTable[i]);
                }
            }
        }
        showTable(rowList);
    }
}

function showAddDeviceModal() {
    $('#addDevice_popup').modal('show');
    $('#inputNumberDevice').val('');
    $("#overlay_spinner_1").hide();
}

function addDevice() {
    $('#addDevice_popup').modal('hide');
    var amount = $("#inputNumberDevice").val();
    if (amount != '') {
        $.ajax({
            type: "POST",
            url: "http://192.168.137.123:8082/api/add_device",
            cache: false,
            crossDomain: true,
            processData: true,
            dataType: "json",
            data: {
                "amount": amount,
                "deviceId": $("#search_input").val().trim(),
                "page": 0,
                "size": 100
            },
            success: function (data) {
                genToastSuccess(data.message);
                dataOriginal = data;
                filter(dataOriginal);
            }
        });
    }
}

function showTable(dataTable) {

    //reset number checked in 'Khay hành động'
    deviceNumberChecked = 0;

    $("#device_table_body").empty();
    if (dataTable.length != 0) {
        var contentString = "";
        for (var i = 0; i < dataTable.length; i++) {
            var row = dataTable[i];
            if (row.isActive == false) {
                contentString = contentString +
                    '<tr>' +
                    '<td>' + genCheckox(row.index, row.deviceId) + '</td>\n' +
                    '<td>' + row.deviceId + '</td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td>' + genButtonActionDevice(row.script, row.account, row.status, row.deviceId, row.isActive, row.isStarting) +
                    '</tr>';
            } else if (row.isActive == true) {
                if (row.script == "" || row.account == "") {
                    contentString = contentString +
                        '<tr>' +
                        '<td>' + genCheckox(row.index, row.deviceId) + '</td>\n' +
                        '<td>' + row.deviceId + '</td>\n' +
                        '<td>' + genStatus(row.status) + '</td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td>' + genButtonActionDevice(row.script, row.account, row.status, row.deviceId, row.isActive, row.isStarting) +
                        '</tr>';
                } else if (row.script != "" && row.account != "") {
                    contentString = contentString +
                        '<tr>' +
                        '<td>' + genCheckox(row.index, row.deviceId) + '</td>\n' +
                        '<td>' + row.deviceId + '</td>\n' +
                        '<td>' + genStatus(row.status) + '</td>\n' +
                        '<td><img src="' + row.appIcon + '" class="rounded-circle" width="20" height="20">\n' +
                        '<span class="ml-2">' + row.app + '</span></td>\n' +
                        '<td>' + row.account + '</td>\n' +
                        '<td>' + row.script + '</td>\n' +
                        '<td>' + genProgress(row.progress) + '</td>\n' +
                        '<td>' + row.action + '</td>\n' +
                        '<td>' + genButtonActionDevice(row.script, row.account, row.status, row.deviceId, row.isActive, row.isStarting) +
                        '</tr>';
                }
            }
        }
        $("#device_table_body").html(contentString);
    }

    if (deviceNumberChecked == 0) {
        disableAction(deviceNumberChecked);
    } else {
        enableAction(deviceNumberChecked);
    }

}

function genCheckox(index, deviceId) {

    var checkbox = '';
    if (deviceList.length != 0) {
        if (deviceList.includes(deviceId)) {
            checkbox =
                '<input checked class="checkbox" type="checkbox" onclick="getDeviceIdInRow(\'' + deviceId + '\')">\n' +
                '<span class="ml-2">' + index + '</span>';

            //thay đổi số lượng trong khay hành động
            deviceNumberChecked++;
        } else {
            checkbox =
                '<input class="checkbox" type="checkbox" onclick="getDeviceIdInRow(\'' + deviceId + '\')">\n' +
                '<span class="ml-2">' + index + '</span>';
        }
    } else {
        checkbox =
            '<input class="checkbox" type="checkbox" onclick="getDeviceIdInRow(\'' + deviceId + '\')">\n' +
            '<span class="ml-2">' + index + '</span>';
    }
    return checkbox;
}

function genStatus(statusValue) {
    var status;
    if (statusValue == "") {
        status = '';
    } else if (statusValue == "free") {
        status = '<span class="badge bg-blue w-50">Free</span>';
    } else if (statusValue == "running") {
        status = '<span class="badge bg-purple w-50">Running</span>';
    } else if (statusValue == "complete") {
        status = '<span class="badge bg-success w-50">Complete</span>';
    } else if (statusValue == "fail") {
        status = '<span class="badge bg-danger w-50">Fail</span>';
    } else if (statusValue == "stopped") {
        status = '<span class="badge bg-warning w-50">Stopped</span>';
    }
    return status;
}

function genProgress(progressValue) {
    var progress = '';
    if (progressValue == 0) {
        progress =
            '   <div class="progress rounded-round" style=" height:0.8rem">\n' +
            '       <div class="progress-bar" style="width: ' + 100 + '%; background-color: #f2f2f2">\n' +
            '               <span class="text-grey">' + progressValue + '%</span>\n' +
            '       </div>\n' +
            '   </div>';
    } else if (progressValue < 100) {
        progress =
            '   <div class="progress rounded-round" style=" height:0.8rem">\n' +
            '       <div class="progress-bar bg-blue" style="width: ' + progressValue + '%;">\n' +
            '               <span>' + progressValue + '%</span>\n' +
            '       </div>\n' +
            '   </div>';
    } else if (progressValue == 100) {
        progress =
            '   <div class="progress rounded-round" style=" height:0.8rem">\n' +
            '       <div class="progress-bar bg-success" style="width: ' + progressValue + '%;">\n' +
            '               <span>' + progressValue + '%</span>\n' +
            '       </div>\n' +
            '   </div>';
    }
    return progress;
}

function genButtonActionDevice(script, account, status, deviceId, isActived, isStaring) {
    var button = '';
    if (isActived == false) {
        if (isStaring == true) {
            button =
                '<div id="overlay_spinner_1">\n' +
                '                                        <div class="cv-spinner">\n' +
                '                                            <span class="spinner"></span>\n' +
                '                                        </div>\n' +
                '                                    </div>';
        } else {
            button =
                ' <div class="list-icons">\n' +
                '                                        <div x-placement="bottom-start">\n' +
                '                                            <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình thiết bị" disabled>\n' +
                '                                                <i class="icon-mobile text-grey"></i>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="startScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy kịch bản" disabled>\n' +
                '                                                <i class="icon-play4 text-grey" style="font-size: 18px !important;"></i>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="stopScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng chạy kịch bản" disabled>\n' +
                '                                                <i class="icon-square text-grey font-size-sm"></i>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật thiết bị">\n' +
                '                                                <fa class="fa fa-power-off text-success"></fa>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="turnoffDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt thiết bị" style="display: none" >\n' +
                '                                                <fa class="fa fa-power-off text-danger"></fa>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="showModalRunOneScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Thiết lập kịch bản" disabled>\n' +
                '                                                <i class="icon-cog text-dark"></i>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="viewLog(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem log">\n' +
                '                                                <fa class="far fa-file-alt text-info"></fa>\n' +
                '                                            </button>\n' +
                '                                        </div>\n' +
                '                                    </div>';
        }
    } else {
        if ((script == '') || (account == '')) {
            button =
                ' <div class="list-icons">\n' +
                '                                        <div x-placement="bottom-start">\n' +
                '                                            <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình thiết bị">\n' +
                '                                                <i class="icon-mobile text-indigo"></i>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="startScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy kịch bản" disabled>\n' +
                '                                                <i class="icon-play4 text-grey" style="font-size: 18px !important;"></i>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="stopScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng chạy kịch bản" disabled>\n' +
                '                                                <i class="icon-square text-grey font-size-sm"></i>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật thiết bị" style="display: none">\n' +
                '                                                <fa class="fa fa-power-off text-success"></fa>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="turnoffDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt thiết bị">\n' +
                '                                                <fa class="fa fa-power-off text-danger"></fa>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="showModalRunOneScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Thiết lập kịch bản" >\n' +
                '                                                <i class="icon-cog text-dark"></i>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="viewLog(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem log">\n' +
                '                                                <fa class="far fa-file-alt text-info"></fa>\n' +
                '                                            </button>\n' +
                '                                        </div>\n' +
                '                                    </div>';

        } else if ((script != '') && (account != '')) {
            if (status == 'free') {
                button =
                    ' <div class="list-icons">\n' +
                    '                                        <div x-placement="bottom-start">\n' +
                    '                                            <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình thiết bị">\n' +
                    '                                                <i class="icon-mobile text-indigo"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="startScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy kịch bản" disabled>\n' +
                    '                                                <i class="icon-play4 text-grey" style="font-size: 18px !important;"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="stopScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng chạy kịch bản" disabled>\n' +
                    '                                                <i class="icon-square text-grey font-size-sm"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật thiết bị" style="display: none" >\n' +
                    '                                                <fa class="fa fa-power-off text-success"></fa>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="turnoffDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt thiết bị">\n' +
                    '                                                <fa class="fa fa-power-off text-danger"></fa>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="showModalRunOneScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Thiết lập kịch bản" >\n' +
                    '                                                <i class="icon-cog text-dark"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="viewLog(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem log">\n' +
                    '                                                <fa class="far fa-file-alt text-info"></fa>\n' +
                    '                                            </button>\n' +
                    '                                        </div>\n' +
                    '                                    </div>';
            } else if (status == 'running') {
                button =
                    ' <div class="list-icons">\n' +
                    '                                        <div x-placement="bottom-start">\n' +
                    '                                            <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình thiết bị">\n' +
                    '                                                <i class="icon-mobile text-indigo"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="startScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy kịch bản" disabled>\n' +
                    '                                                <i class="icon-play4 text-grey" style="font-size: 18px !important;"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="stopScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng chạy kịch bản">\n' +
                    '                                                <i class="icon-square text-warning font-size-sm"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật thiết bị"  style="display: none" >\n' +
                    '                                                <fa class="fa fa-power-off text-success"></fa>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="turnoffDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt thiết bị">\n' +
                    '                                                <fa class="fa fa-power-off text-danger"></fa>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="showModalRunOneScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Thiết lập kịch bản" >\n' +
                    '                                                <i class="icon-cog text-dark"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="viewLog(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem log">\n' +
                    '                                                <fa class="far fa-file-alt text-info"></fa>\n' +
                    '                                            </button>\n' +
                    '                                        </div>\n' +
                    '                                    </div>';
            } else if ((status == 'fail') || status == 'complete' || status == 'stopped') {
                button =
                    ' <div class="list-icons">\n' +
                    '                                        <div x-placement="bottom-start">\n' +
                    '                                            <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình thiết bị">\n' +
                    '                                                <i class="icon-mobile text-indigo"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="startScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy kịch bản">\n' +
                    '                                                <i class="icon-play4 text-success" style="font-size: 18px !important;"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="stopScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng chạy kịch bản" disabled>\n' +
                    '                                                <i class="icon-square text-grey font-size-sm"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật thiết bị" style="display: none" >\n' +
                    '                                                <fa class="fa fa-power-off text-success"></fa>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="turnoffDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt thiết bị">\n' +
                    '                                                <fa class="fa fa-power-off text-danger"></fa>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="showModalRunOneScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Thiết lập kịch bản" >\n' +
                    '                                                <i class="icon-cog text-dark"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="viewLog(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem log">\n' +
                    '                                                <fa class="far fa-file-alt text-info"></fa>\n' +
                    '                                            </button>\n' +
                    '                                        </div>\n' +
                    '                                    </div>';
            }
        }
    }
    return button;
}

function viewDevice(deviceID) {
    console.log(deviceID);
}

function startScript(deviceID) {
    var deviceIdList = [];
    deviceIdList.push(deviceID);
    $.ajax({
        type: "POST",
        url: "http://192.168.137.123:8082/api/start_script",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(
            {
                "deviceIdList": deviceIdList
            }),
        success: function (deviceListOnResp) {
            if (deviceListOnResp.length != 0) {
                for (var i = 0; i < deviceListOnResp.length; i++) {
                    var newDeviceStatus = deviceListOnResp[i];
                    if (newDeviceStatus.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == newDeviceStatus.data.deviceId) {
                                    dataOriginal.deviceStatistics[j] = newDeviceStatus.data;
                                }
                            }
                        } else {
                            genToastError("Data null");
                        }
                    } else {
                        genToastError(newDeviceStatus.error);
                    }
                }
            }
            showTab($("#device_status").text());
        }

    })
}

function stopScript(deviceID) {
    var deviceIdList = [];
    deviceIdList.push(deviceID);
    $.ajax({
        type: "POST",
        url: "http://192.168.137.123:8082/api/stop_script",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(
            {
                "deviceIdList": deviceIdList
            }),
        success: function (deviceListOnResp) {
            if (deviceListOnResp.length != 0) {
                for (var i = 0; i < deviceListOnResp.length; i++) {
                    var newDeviceStatus = deviceListOnResp[i];
                    if (newDeviceStatus.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == newDeviceStatus.data.deviceId) {
                                    dataOriginal.deviceStatistics[j] = newDeviceStatus.data;
                                }
                            }
                        } else {
                            genToastError("Data null");
                        }
                    } else {
                        genToastError(newDeviceStatus.error);
                    }
                }
            }
            showTab($("#device_status").text());
        }

    })
}

function restartDevice() {
    $.ajax({
        type: "POST",
        url: "http://192.168.137.123:8082/api/restart_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(
            {
                "deviceIdList": deviceList
            }),
        success: function (deviceListOnResp) {
            if (deviceListOnResp.length != 0) {
                for (var i = 0; i < deviceListOnResp.length; i++) {
                    var deviceOn = deviceListOnResp[i];
                    if (deviceOn.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == deviceOn.data.deviceId) {
                                    dataOriginal.deviceStatistics[j].isStarting = true;
                                }
                            }
                        } else {
                            genToastError("Data null");
                        }
                    } else {
                        genToastError(deviceOff.error);
                    }
                }
            }
            showTab($("#device_status").text());
        }
    });
}

function turnOnMultiDevice() {
    $.ajax({
        type: "POST",
        url: "http://192.168.137.123:8082/api/turnon_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(
            {
                "deviceIdList": deviceList
            }),
        success: function (deviceListOnResp) {
            if (deviceListOnResp.length != 0) {
                for (var i = 0; i < deviceListOnResp.length; i++) {
                    var deviceOn = deviceListOnResp[i];
                    if (deviceOn.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == deviceOn.data.deviceId) {
                                    dataOriginal.deviceStatistics[j].isStarting = true;
                                }
                            }
                        } else {
                            genToastError("Data null");
                        }
                    } else {
                        genToastError(deviceOn.error);
                    }
                }
            }
            showTab($("#device_status").text());
        }
    });
}

function turnonDevice(deviceID) {
    var deviceIdList = [];
    deviceIdList.push(deviceID);
    $.ajax({
        type: "POST",
        url: "http://192.168.137.123:8082/api/turnon_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(
            {
                "deviceIdList": deviceIdList
            }),
        success: function (deviceListOnResp) {
            if (deviceListOnResp.length != 0) {
                for (var i = 0; i < deviceListOnResp.length; i++) {
                    var deviceOn = deviceListOnResp[i];
                    if (deviceOn.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == deviceOn.data.deviceId) {
                                    dataOriginal.deviceStatistics[j].isStarting = true;
                                }
                            }
                        } else {
                            genToastError("Data null");
                        }
                    } else {
                        genToastError(deviceOn.error);
                    }
                }
            }
            showTab($("#device_status").text());
        }
    });
}

function turnoffMultiDevice() {
    $.ajax({
        type: "POST",
        url: "http://192.168.137.123:8082/api/turnoff_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(
            {
                "deviceIdList": deviceList
            }),
        success: function (deviceListOffResp) {
            if (deviceListOffResp.length != 0) {
                for (var i = 0; i < deviceListOffResp.length; i++) {
                    var deviceOff = deviceListOffResp[i];
                    if (deviceOff.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == deviceOff.data.deviceId) {
                                    dataOriginal.deviceStatistics[j].isActive = false;
                                }
                            }
                        } else {
                            genToastError("Data null");
                        }
                    } else {
                        genToastError(deviceOff.error);
                    }
                }
            }
            showTab($("#device_status").text());
        }
    });
}

function turnoffDevice(deviceID) {
    var deviceIdList = [];
    deviceIdList.push(deviceID);
    $.ajax({
        type: "POST",
        url: "http://192.168.137.123:8082/api/turnoff_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(
            {
                "deviceIdList": deviceIdList
            }),
        success: function (deviceListOffResp) {
            if (deviceListOffResp.length != 0) {
                for (var i = 0; i < deviceListOffResp.length; i++) {
                    var deviceOff = deviceListOffResp[i];
                    if (deviceOff.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == deviceOff.data.deviceId) {
                                    dataOriginal.deviceStatistics[j].isActive = false;
                                }
                            }
                        } else {
                            genToastError("Data null");
                        }
                    } else {
                        genToastError(deviceOff.error);
                    }
                }
            }
            showTab($("#device_status").text());
        }
    });
}

// chạy kịch bản 1 thiết bị
var deviceIDTmp = '';
var scriptMap = new Map();
var scriptIDTmp = '';

var scriptInfo = {
    "accountId": 0,
    "deviceId": '',
    "scriptId": 0
};

function showModalRunOneScript(deviceID) {
    $('#run_script_one_device_title').html(deviceID);
    $('#script_select').find('option')
        .remove()
        .end()
        .append('<option disabled selected>Chọn kịch bản</option>');
    $('#account_select').find('option')
        .remove()
        .end();
    $("#error_account").hide();
    scriptMap = new Map();
    deviceIDTmp = deviceID;
    $('#run_script').modal('show');
    $.ajax({
        type: "GET",
        url: "http://192.168.137.123:8082/api/get_all_script",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        success: function (data) {
            if (data.length != 0) {
                for (var i = 0; i < data.length; i++) {
                    $('#script_select').append($("<option>").val("" + data[i].app + "").text("" + data[i].name + ""));
                    scriptMap.set(data[i].id, data[i].app);
                }
            }
        }
    });
}

function getAccountByScript() {
    $('#account_select').find('option')
        .remove()
        .end();
    let scriptSelect = $("#script_select").val();
    let scriptId =
        [...scriptMap.entries()]
            .filter(({1: v}) => v === scriptSelect)
            .map(([k]) => k)[0];

    scriptIDTmp = scriptId;

    $.ajax({
        type: "POST",
        url: "http://192.168.137.123:8082/api/find_account",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        data: {
            "appName": scriptSelect
        },
        success: function (data) {
            if (data != 0) {
                $("#error_account").hide();
                $("#account_select").removeAttr("disabled");
                for (var i = 0; i < data.length; i++) {
                    $('#account_select').append($("<option>").val("" + data[i].id + "").text("" + data[i].username + ""));
                }
            } else {
                $("#error_account").show();
                $("#account_select").prop('disabled', 'disabled');
                $("#account_select").val("");
                $("#btn_runOneScript").prop("disabled", true);
            }
        }
    });

    if (scriptIDTmp != '' && $("#account_select").val() != '') {
        $("#btn_runOneScript").prop("disabled", false);
    }
}

function runOneScript() {

    var scriptInfoList = [];
    scriptInfoList.push({
        "accountId": parseInt($("#account_select").val()),
        "deviceId": deviceIDTmp,
        "scriptId": scriptIDTmp
    });

    $('#run_script').modal('hide');

    $.ajax({
        type: "POST",
        url: "http://192.168.137.123:8082/api/run_script_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
            "list": scriptInfoList
        }),
        success: function (deviceListOffResp) {
            if (deviceListOffResp.length != 0) {
                for (var i = 0; i < deviceListOffResp.length; i++) {
                    var newDeviceStatus = deviceListOffResp[i];
                    if (newDeviceStatus.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == newDeviceStatus.data.deviceId) {
                                    dataOriginal.deviceStatistics[j] = newDeviceStatus.data;
                                }
                            }
                        } else {
                            genToastError("Data null");
                        }
                    } else {
                        genToastError(deviceOff.error);
                    }
                }
            }
            showTab($("#device_status").text());
        }
    });
}

function showModalMultiScript() {
    $('#multi_script_select').find('option').remove().end().append('<option disabled selected>Chọn kịch bản</option>');
    $("#run_multi_script").modal('show');
    $.ajax({
        type: "GET",
        url: "http://192.168.137.123:8082/api/get_all_script",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        success: function (data) {
            if (data.length != 0) {
                for (var i = 0; i < data.length; i++) {
                    $('#multi_script_select').append($("<option>").val("" + data[i].app + "").text("" + data[i].name + ""));
                }
            }
        }
    });
}

function viewLog(deviceID) {
    $('#log_device_title').html(deviceID);
    $.ajax({
        type: "POST",
        url: "http://192.168.137.123:8082/api/device_log",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        data: {
            "deviceId": deviceID
        },
        success: function (data) {
            $('#viewLog_popup').modal('show');
            var content = "";
            if (data.success == true) {
                if (data.data != null) {
                    for (var i = 0; i < data.data.length; i++) {
                        var row = data.data[i];
                        if (row.isActive == false) {
                            content = content +
                                '<tr>' +
                                '<td>' + timeConverter(row.time) + '</td>\n' +
                                '<td>' + genActive(row.isActive) + '</td>\n' +
                                '<td></td>\n' +
                                '<td></td>\n' +
                                '<td></td>\n' +
                                '<td></td>\n' +
                                '<td></td>\n' +
                                '<td></td>\n' +
                                '<td></td>\n' +
                                '<td></td>\n' +
                                '</tr>';
                        } else {
                            if (row.script == "" || row.account == "") {
                                content = content +
                                    '<tr>' +
                                    '<td>' + timeConverter(row.time) + '</td>\n' +
                                    '<td>' + genActive(row.isActive) + '</td>\n' +
                                    '<td>' + genStatus(row.status) + '</td>\n' +
                                    '<td></td>\n' +
                                    '<td></td>\n' +
                                    '<td></td>\n' +
                                    '<td></td>\n' +
                                    '<td></td>\n' +
                                    '<td></td>\n' +
                                    '<td></td>\n' +
                                    '</tr>';
                            } else {
                                content = content +
                                    '<tr>' +
                                    '<td>' + timeConverter(row.time) + '</td>\n' +
                                    '<td>' + genActive(row.isActive) + '</td>\n' +
                                    '<td>' + genStatus(row.status) + '</td>\n' +
                                    '<td><img src="' + row.appIcon + '" class="rounded-circle" width="20" height="20">\n' +
                                    '<span class="ml-2">' + row.app + '</span></td>\n' +
                                    '<td>' + row.account + '</td>\n' +
                                    '<td>' + row.script + '</td>\n' +
                                    '<td>' + row.simId + '</td>\n' +
                                    '<td>' + genProgress(row.progress) + '</td>\n' +
                                    '<td>' + row.action + '</td>\n' +
                                    '<td>' + row.info + '</td>\n' +
                                    '</tr>';
                            }
                        }
                    }
                }
            }
            $('#log_table_body').html(content);
        }
    });
}

function genActive(isActive) {
    var content = '';
    if (isActive) {
        content = '<fa class="fa fa-circle text-success" title="Bật" style="font-size:12px !important"></fa>';
    } else {
        content = '<fa class="fa fa-circle text-danger" title="Tắt" style="font-size:12px !important"></fa>';
    }
    return content;
}

function deleteDevice() {
    $.ajax({
        type: "POST",
        url: "http://192.168.137.123:8082/api/delete_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
            "deviceIdList": deviceList,
            "filterDeviceId": $("#search_input").val().trim(),
            "page": 0,
            "size": 100
        }),
        success: function (data) {
            disableAction();
            genToastSuccess(data.message);
            dataOriginal = data;
            filter(dataOriginal);
        }
    });
}

function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp);
    var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = hour + ':' + min + ':' + sec + ' ' + date + '/' + month + '/' + year;
    return time;
//    return new Date(UNIX_timestamp).toISOString().slice(0, 19).replace('T', ' ');
}

function genToastSuccess(message) {
    $.toast({
        text: message,
        icon: 'success',
        showHideTransition: 'plain',
        allowToastClose: true,
        hideAfter: 3000,
        stack: 5,
        position: 'bottom-left',
        textAlign: 'left',
        loader: true,
        loaderBg: '#00f920',
    });
}

function genToastError(message) {
    $.toast({
        text: message,
        heading: 'Note', // Optional heading to be shown on the toast
        icon: 'error', // Type of toast icon
        showHideTransition: 'plain', // fade, slide or plain
        allowToastClose: true, // Boolean value true or false
        hideAfter: 3000, // false to make it sticky or number representing the miliseconds as time after which toast needs to be hidden
        stack: 5, // false if there should be only one toast at a time or a number representing the maximum number of toasts to be shown at a time
        position: 'bottom-left', // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values
        textAlign: 'left',  // Text alignment i.e. left, right or center
        loader: true,  // Whether to show loader or not. True by default
        loaderBg: '#9EC600',  // Background color of the toast loader
    });
}