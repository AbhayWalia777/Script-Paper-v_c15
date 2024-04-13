﻿$(document).ready(function () {
    $('.select2').select2();
    $("#scriptNameDiv").hide();
    GetBanScriptData(0);
});

$(document).on('change', '#cboScriptExchange', function () {
    $("#txtScript").val("");

    if ($('#cboScriptExchange option:selected').text() != 'Select')
        $("#scriptNameDiv").show();
    else
        $("#scriptNameDiv").hide();

});

$(document).on('change', '#UserIds', function () {
    if ($('#UserIds option:selected').text() != '--Select--') {
        var UserID = $('#UserIds').val();
        GetBanScriptData(UserID);
    } else {
        GetBanScriptData(0);
    }
});

function GetBanScriptData(UserID) {
    try {
        var input = "";
        input = { 'UserID': UserID };
        var request = $.ajax({
            url: "/Watchlist/GetBanScriptList",
            type: "GET",
            data: input,
            async: true,
            dataType: 'json',
            success: function (data) {
                SetResult(data);
            }
        });
    } catch (e) {
        alert("Error On SetBanScriptData.")
    }
}

function SetResult(item) {
    var results = JSON.parse(item);

    //#region Set data for Ban Script Table
    if (results != null) {
        var tblBanScriptList = $('#BanScriptList').DataTable();
        tblBanScriptList.clear().draw();
        tblBanScriptList.innerHTML = "";
        if (results.length > 0) {
            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                SetScripBanDetails(result);
            }
        }
    }
}
function SetScripBanDetails(item) {
    var deleteButton = '<button id="btnName' + item.Banscriptid + '" onclick="removeScript(' + item.Banscriptid + ')" type="button" class="btn btn-danger btn-sm btn-delete"><i class="fa fa fa-trash-o"></i></button> ';
    $('#BanScriptList').DataTable().row.add([
        item.Email,
        item.ScriptExchange,
        item.ScriptName,
        deleteButton
    ]).draw();
}
$("#txtScript").autocomplete({
    source: function (request, response) {
        _ScriptExchange = $('#cboScriptExchange').val();
        $.ajax({
            url: "/Watchlist/GetScriptListWithSegment",
            type: "GET",
            dataType: "json",
            data: { Search: request.term, ScriptExchange: _ScriptExchange, Scriptsegment: "", Scriptexpiry: "", ScriptStrike: "", ScriptPair: "", ForexScriptPair: "" },
            success: function (_data) {
                response($.map(_data, function (item) {
                    return { label: item.ScriptTradingSymbol, value: item.ScriptTradingSymbol }
                }));
            }
        });
    },
    minLength: 2,
    select: function (event, ui) {
        $(this).val(ui.item.value);
    }
});



function removeScript(Banscriptid) {
    var result = confirm("Are you sure you want to delete?");
    if (result && Banscriptid > 0) {
        var request = $.ajax({
            url: "/Watchlist/DeleteBanScript",
            type: "POST",
            data: { Banscriptid: Banscriptid },
            dataType: 'json',
            traditional: true,
            success: function (data) {
                var results = JSON.parse(data);

                if (results.IsError) {
                    toastr.error('SomeThing Went Wrong');
                    return false;
                }
                else {
                    toastr.success('Script Deleted Successfully.');

                    if ($('#UserIds option:selected').text() != '--Select--') {
                        var UserID = $('#UserIds').val();
                        var Username = $('#UserIds option:selected').text();
                        GetBanScriptData(UserID);
                    }
                    else {
                        GetBanScriptData(0);
                    }
                    return false;
                }

            }
        });
    }
}

$('#BtnBanWishList').on('click', function () {
    insertScript();
});

$('#chkAllUsers').on('click', function () {
    var checkalluser = document.getElementById('chkAllUsers');
    if (checkalluser.checked == true) {
        $('#DivSelectUsers').css('display', 'none');
    }
    else {
        $('#DivSelectUsers').css('display', 'block');
    }
});

function insertScript() {
    var checkalluser = document.getElementById('chkAllUsers');
    var _ScriptExchange = $('#cboScriptExchange').val();
    var txtScriptData = $('#txtScript').val();
    if ($('#UserIds option:selected').text() != '--Select--' && $('#cboScriptExchange option:selected').text() != 'Select' && txtScriptData != '' || checkalluser.checked == true) {
        var UserID = $('#UserIds').val();

        if (checkalluser.checked == true) {
            UserID = 0;
        }
        var result = confirm("Are you sure you want to Ban this Script?");
        if (result) {
            var request = $.ajax({
                url: "/Watchlist/InsertBanList",
                type: "POST",
                data: { ScriptExchange: _ScriptExchange, ScriptName: txtScriptData, UserID: UserID },
                dataType: 'json',
                traditional: true,
                success: function (data) {
                    var results = JSON.parse(data);
                    if (results == 1) {
                        toastr.success('Script Inserted Successfully.');

                        if ($('#UserIds option:selected').text() != '--Select--') {
                            var UserID = $('#UserIds').val();
                            var Username = $('#UserIds option:selected').text();
                            GetBanScriptData(UserID);
                        }
                        else {
                            GetBanScriptData(0);
                        }
                        return false;
                    }
                    if (results == 0) {
                        toastr.error('Duplicate Record !!');
                    }
                    if (results == 3) {
                        toastr.error('Please Select Script Details Carefully !!');
                    }
                }
            });
        }
    }
    else {
        toastr.error('Please Fill All Required Details !!');
    }
}