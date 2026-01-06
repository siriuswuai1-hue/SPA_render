let mycity = []
$(function () {
    $.ajax({
        type: "GET",
        url: "js/json/CityCountyData.json",
        dataType: "json",
        success: showdata,
        error: function () {
            Swal.fire({
                title: "連線錯誤!",
                text: "js/json/CityCountyData.json",
                icon: "error"
            });
        }
    });

    $("#b_city").on("input", function () {
        $("#b_county").empty();
        $("#b_county").append(`<option value="" disabled selected>---所在地區---</option>`);
        mycity[$(this).val()].AreaList.forEach(function (item, key) {
            $("#b_county").append(`<option value="${key}">${item.AreaName}</option>`);
        });

    });

    // $("#b_county").on("input", function () {
    //     console.log(mycity[$("#b_city").val()].AreaList[$(this).val()]);
    // });


});

function showdata(data) {
    mycity = data;
    $("#b_city").empty();
    $("#b_city").append(`<option value="" disabled selected>---所在縣市---</option>`);
    data.forEach(function (item, key) {
        $("#b_city").append(`<option value="${key}">${item.CityName}</option>`);
    });
}