//const dataHost = "localhost";
//const dataHost = "192.168.10.2";
//const dataHost = "10.201.171.105";
const dataHost = "flask-api-render-gj52.onrender.com";

// wowjs 初始化
new WOW().init();
// --- countup--
const counterUp = window.counterUp.default;
const callback = entries => {
    entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting && !el.classList.contains("is-visible")) {
            counterUp(el, {
                duration: 1500,
                delay: 16,
            });
            el.classList.add("is-visible");
        }
    });
};
const IO = new IntersectionObserver(callback, { threshold: 1 });
const el01 = document.querySelector(".counter01");
IO.observe(el01);
const el02 = document.querySelector(".counter02");
IO.observe(el02);
const el03 = document.querySelector(".counter03");
IO.observe(el03);
const el04 = document.querySelector(".counter04");
IO.observe(el04);

let flag_b_name = false,
    flag_b_date = false,
    flag_b_people = false,
    flag_b_phone = false,
    flag_b_room = false;

let flag_b_city = false,
    flag_b_county = false;

let flag_l_name = false,
    flag_l_pass = false;

let flag_r_name = false,
    flag_r_pass01 = false,
    flag_r_pass02 = false,
    flag_r_email = false,
    timer = null;

async function init() {
    await checkLoginStatus();
    await getTravelFoodItem();
    await getHotelData();
    //await getBarItem();
    //await getAllSongs();
    //檢查toekn是否存在和合法
}

//main function start
$(async function () {
    initMap();
    //inContent();
    //等待資料載完
    await init();
    //login start
    //監聽 l_nameb_select01
    $("#l_name").on("input", function () {
        flag_l_name = inputJudge("#l_name", "text", 2, 30);
        //console.log($(this).val().length);
        // if ($(this).val().length > 1 && $(this).val().length < 30) {
    });

    //監聽 l_pass
    $("#l_pass").on("input", function () {
        flag_l_pass = inputJudge("#l_pass", "text", 6, 30);
    });

    //監聽 ok_btn_log
    $("#ok_btn_log").on("click", function () {
        // console.log($('#b_select01 option:selected').text());
        if (flag_l_name && flag_l_pass) {
            flag_l_name = flag_l_pass = false;

            //傳遞至後端執行登入驗證
            axios.post(`https://${dataHost}/api/login`, {
                username: $("#l_name").val(),
                password: $("#l_pass").val()
            })
                .then(function (response) {
                    if (response.data.status) {
                        Swal.fire({
                            title: response.data.message,
                            icon: "success",
                            confirmButtonText: "確認",
                        }).then((result) => {
                            if (result.isConfirmed) {
                                //登入驗證成功
                                //loginModal 關閉
                                bootstrap.Modal.getOrCreateInstance("#loginModal").hide();

                                //顯示登入後的UI畫面
                                setLoginUI(response.data.username);

                                //將token 寫入cookie
                                setCookie("uid", response.data.token, 7);

                                //寫入localstorage
                                localStorage.setItem("uid", response.data.token);
                            }
                        });
                    } else {
                        //登入驗證失敗
                        Swal.fire({
                            title: response.data.message,
                            confirmButtonText: "確認",
                        }).then((result) => {
                            if (result.isConfirmed) {
                                //loginModal 關閉
                                bootstrap.Modal.getOrCreateInstance("#loginModal").hide();
                                clearLoginUI();
                            }
                        });

                    }
                })
                .catch(function (error) {
                    alertSW("無法連上伺服器!", "請檢查網路連線!")
                })
                .finally(function () {
                    resetFormInpit("#l_name");
                    resetFormInpit("#l_pass");
                    $("#btn_l_show").html('顯示');
                    $("#l_pass").attr('type', 'password');
                    $('#loginModal').modal('hide');
                });
        } else alertSW("輸入錯誤!", "請檢查輸入欄位!")
    });

    $("#btn_l_show").on("click", function () {
        const pw = document.getElementById('l_pass');
        const btn = document.getElementById('btn_l_show');
        const isHidden = pw.type === 'password';
        pw.type = isHidden ? 'text' : 'password';
        btn.textContent = isHidden ? '隱藏' : '顯示';
        pw.focus();
    });
    //login end

    //登出按鈕監聽
    $("#logout-btn").on("click", function () {
        clearLoginUI();
        announceModal();
        //清除localstorage
        localStorage.removeItem("uid");
    });

    //控制台按鈕監聽
    $("#control-panel-btn").on("click", function () {
        window.location.href = "20251218-SPA-member-control-panel-api.html";

        //另開分頁
        //window.open("20251218-SPA-member-control-panel-api.html", "_blank");
    });

    //register start
    let r_switch = "";

    //監聽r_switch
    $("#r_switch").on("change", function () {
        r_switch = $(this).is(":checked") ? "同意" : "不同意";
        //console.log(r_switch);
        $(this).next().text(r_switch);
    });

    //監聽 r_name
    $("#r_name").on("input", function () {
        //防止多次連續觸發
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (inputJudge("#r_name", "text", 2, 30)) {
                let username = $(this).val();
                //傳遞至後端驗證帳號是否已存在
                axios.post(`https://${dataHost}/api/checkuni`, {
                    username: username
                })
                    .then(function (response) {
                        console.log(response);
                        if (response.data.status) {
                            $("#r_name-valid-feedback").text(response.data.message);
                            flag_r_name = true;
                        } else {
                            $("#r_name").removeClass("is-valid");
                            $("#r_name").addClass("is-invalid");
                            $("#r_name-invalid-feedback").text(response.data.message);
                            flag_r_name = false;
                        }
                    })
                    .catch(function (error) {
                        $("#r_name").removeClass("is-valid");
                        $("#r_name").addClass("is-invalid");
                        flag_r_name = false;
                        $("#r_name-invalid-feedback").text("請檢查網路連線!");
                        alertSW("無法連上伺服器!", "請檢查網路連線!");
                    })
                    .finally(function () {
                        // always executed
                    });
            } else {
                $("#r_name-invalid-feedback").text("帳號不符合規定!");
                flag_r_name = false;
            }
        }, 500);
    });

    //監聽 r_pass01
    $("#r_pass01").on("input", function () {
        flag_r_pass01 = inputJudge("#r_pass01", "text", 6, 30);
        inType = "text";
        if ($(this).val() != $("#r_pass02").val()) inType = "error";
        flag_r_pass02 = inputJudge("#r_pass02", inType, 8, 30);
    });

    //監聽btn_show01
    $("#btn_show01").on("click", function () {
        const pw = document.getElementById('r_pass01');
        const btn = document.getElementById('btn_show01');
        const isHidden = pw.type === 'password';
        pw.type = isHidden ? 'text' : 'password';
        btn.textContent = isHidden ? '隱藏' : '顯示';
        pw.focus();
    });

    //監聽 r_pass02
    $("#r_pass02").on("input", function () {
        inType = "text";
        if ($(this).val() != $("#r_pass01").val()) inType = "error";
        flag_r_pass02 = inputJudge("#r_pass02", inType, 6, 30);
    });

    $("#btn_show02").on("click", function () {
        const pw = document.getElementById('r_pass02');
        const btn = document.getElementById('btn_show02');
        const isHidden = pw.type === 'password';
        pw.type = isHidden ? 'text' : 'password';
        btn.textContent = isHidden ? '隱藏' : '顯示';
        pw.focus();
    });

    //監聽 r_email
    $("#r_email").on("input", function () {
        flag_r_email = inputJudge("#r_email", "email", 5, 30);
    });

    //監聽 ok_btn_reg
    $("#ok_btn_reg").on("click", function () {
        if (r_switch != "同意") alertSW("輸入錯誤!", "請閱讀會員守則並點選同意!");
        else {
            console.log(flag_r_name, flag_r_pass01, flag_r_pass02, flag_r_email);
            if (flag_r_name && flag_r_pass01 && flag_r_pass02 && flag_r_email) {
                //傳遞至後端執行註冊
                //整理傳遞給後端的json格式資料
                let jsonDATA = {
                    username: $("#r_name").val(),
                    password: $("#r_pass01").val()
                }
                axios.post(`https://${dataHost}/api/register`, jsonDATA)
                    .then(function (response) {
                        console.log(response);
                        if (response.request.status == 200) {
                            Swal.fire({
                                title: "註冊成功!",
                                confirmButtonText: "確認",
                                icon: "success"
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    //關閉modal所有的功能
                                    bootstrap.Modal.getOrCreateInstance("#registerModal").hide();
                                    //清空欄位 重新觸發驗證行為
                                    $("#r_name").val('').trigger('input');
                                    $("#r_pass01").val('').trigger('input');
                                    $("#r_pass02").val('');
                                }
                            });
                        }
                    })
                    .catch(function (error) {
                        alertSW("無法連上伺服器!", "請檢查網路連線!")
                    })
                    .finally(function () {
                        // always executed
                    });
                resetFormInpit("#r_name");
                resetFormInpit("#r_pass01");
                resetFormInpit("#r_pass02");
                resetFormInpit("#r_email");
                $("#btn_show01").html('顯示');
                $("#btn_show02").html('顯示');
                $("#r_pass01").attr('type', 'password');
                $("#r_pass02").attr('type', 'password');
                $("#r_switch").prop('checked', false);
                $("#r_switch").next().text("不同意");
                $('#registerModal').modal('hide');
            } else alertSW("輸入錯誤!", "請檢查輸入欄位!")
        }
    });
    //register end

    //s09 start預約基本資料
    //監聽 b_name
    $("#b_name").on("input", function () {
        flag_b_name = inputJudge("#b_name", "text", 2, 30)
    });

    $("#b_date").on("input", function () {
        flag_b_date = inputJudge("#b_date", "date", 10, 10)
    });

    $("#b_people").on("input", function () {
        flag_b_people = inputJudge("#b_people", "number", 1, 100);
    });

    $("#b_phone").on("input", function () {
        inType = "number";
        if ($(this).val().length != 10) inType = "error";
        flag_b_phone = inputJudge("#b_phone", inType, 900000000, 999999999);
    });

    $("#b_room").on("change", function () {
        flag_b_room = true;
    });
    $("#b_city").on("change", function () {
        flag_b_city = true;
    });
    $("#b_county").on("change", function () {
        flag_b_county = true;
    });

    //監聽 ok_btn_b_data
    $("#ok_btn_b_data").on("click", function () {
        if (
            flag_b_name &&
            flag_b_date &&
            flag_b_people &&
            flag_b_phone &&
            flag_b_room &&
            flag_b_city &&
            flag_b_county
        ) {
            $("#print_data_modal").modal("show");
            strHTML = `
                    <div class="fw-900"><span class="h3">姓名: </span>${$(
                "#b_name"
            ).val()}</div>
        <div class="fw-900"><span class="h3">日期: </span>${$(
                "#b_date"
            ).val()}</div>
                    <div class="fw-900"><span class="h3">人數: </span>${$(
                "#b_people"
            ).val()}</div>
                    <div class="fw-900"><span class="h3">電話: </span>${$(
                "#b_phone"
            ).val()}</div>
                    <div class="fw-900"><span class="h3">包廂: </span>${$(
                "#b_room option:selected"
            ).text()}</div>
                    <div class="fw-900"><span class="h3">城市: </span>${$(
                "#b_city option:selected"
            ).text()}</div>
                    <div class="fw-900"><span class="h3">地區: </span>${$(
                "#b_county option:selected"
            ).text()}</div>
                        `;
            $("#print_data").empty();
            $("#print_data").append(strHTML);
            $("#printModalLabel").empty();
            $("#printModalLabel").append("預約上傳資料");
        } else alertSW("輸入錯誤!", "請檢查輸入欄位!");
    });

    //監聽 clr_btn_b_data
    $("#clr_btn_b_data").on("click", function () {
        flag_b_name =
            flat_b_date =
            flag_b_people =
            flag_b_phone =
            flag_b_room =
            flag_b_city =
            flag_b_county =
            false;
        resetFormInpit("#b_name");
        resetFormInpit("#b_date");
        resetFormInpit("#b_people");
        resetFormInpit("#b_phone");
        $("#b_city").empty();
        $("#b_city").append(
            `<option value="" disabled selected>---所在縣市---</option>`
        );
        $("#b_county").empty();
        $("#b_county").append(
            `<option value="" disabled selected>---所在地區---</option>`
        );
    });
    //s09 end

    //start s12
    //產生縣市選單
    // //監聽選單cityFoodSelect
    $("#cityFoodSelect").on("change", function () {
        $("#food_tbody").empty();
        travelFoodData[$(this).val()].forEach((item) => {
            //擷取0-50字
            description = item.HostWords.substring(0, 50);
            let myName;
            if (item.Url == "") myName = item.Name;
            else myName = `<a href="${item.Url}" target="_blank" />${item.Name}`;
            let strHTML = `<tr>
                            <td data-th="編號">${item.ID}</td>
                            <td data-th="名稱">${myName}</td>
                            <td data-th="電話">${item.Tel}</td>
                            <td data-th="地址">${item.City}${item.Town}${item.Address}</td>
                            <td data-th="簡介"><span class="d-flex">${description}</span></td>
                        </tr>`;
            $("#food_tbody").append(strHTML)
        });
    })
    //end s12

    //s13 start
    //monitor #btn_search
    $("#btn_search").on("click", function () {
        //console.log($("#s_search").val());
        searchSong($("#s_search").val());
    });

    // Enter鍵按下時觸發
    $('#s_search').on('keypress', function (e) {
        if (e.which === 13) { // 13是Enter鍵
            e.preventDefault(); // 防止送出
            searchSong($("#s_search").val()); // 執行搜尋邏輯
        }
    });

    //monitor #btn_print_close
    $("#btn_print_close").on("click", function () {
        //document.getElementById("s01").focus();
        $("#print_data_modal>.modal-dialog").removeClass("modal-lg");
        $('#video_player').removeAttr('src');
        //document.getElementById("video_player").src = "";
    });

    //s13 end

    //s14 start
    //監聽 更新按鈕 #mybartbody.btn-update
    $("#mybartbody").on("click", ".btn-update", function () {
        flag_p_name = flag_p_dtime = flag_p_qty = flag_p_price = true;
        $("#update_ok_btn").removeClass("hideElement");
        $("#add_ok_btn").addClass("hideElement");

        //塞到Modal
        $("#p_id").val($(this).data("id"));
        $("#p_name").val($(this).data("name"));
        $("#p_price").val($(this).data("price"));
        $("#p_qty").val($(this).data("qty"));
        $("#p_dtime").val($(this).data("dtime"));
    });

    //監聽 刪除按鈕 #mybartbody.btn-delete
    $("#mybartbody").on("click", ".btn-delete", function () {
        //詢問確認刪除?
        Swal.fire({
            title: "確認刪除?",
            icon: "question",
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: "確認",
            denyButtonText: "取消"
        }).then((result) => {
            if (result.isConfirmed) {
                //執行刪除行為
                //console.log($(this).data("id"));
                let id = $(this).data("id");
                axios.delete(`https://${dataHost}:3002/barFoods/${id}`)
                    .then(function (response) {
                        //console.log(response);
                        if (response.status == 200) {
                            //刪除成功
                            Swal.fire({
                                title: "刪除成功",
                                icon: "success",
                                showDenyButton: false,
                                showCancelButton: false,
                                confirmButtonText: "確認",
                                denyButtonText: `Don't save`
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    // location.href = "product-20251128-table.html";
                                    getBarItem();
                                }
                            });
                        } else alertSW("刪除失敗")
                    })
                    .catch(function (error) {
                        console.log(error);
                    })
                    .finally(function () {
                        // always executed
                    });
            }
        });
    });

    //監聽 頁碼 myBarpagination
    $("#myBarPagination").on("click", ".page-link", function () {
        //console.log($(this).data("id"));
        //prev next
        if ($(this).data("id") == 10000 || $(this).data("id") == 20000) {
            if ($(this).data("id") == 10000 && currentBarPage > 0) currentBarPage--;
            if ($(this).data("id") == 20000 && currentBarPage < maxFoodPage) currentBarPage++;
        } else currentBarPage = $(this).data("id");
        //產生該頁碼的table資料
        renderBarTable(currentBarPage);
        renderBarPagination(currentBarPage)
    });

    //即時監聽#p_name
    $("#p_name").on("input", function () {
        flag_p_name = inputJudge("#p_name", "text", 1, 20);
    });

    //即時監聽#p_price
    $("#p_price").on("input", function () {
        flag_p_price = inputJudge("#p_price", "number", 1, 100);
    });

    //即時監聽#p_qty
    $("#p_qty").on("input", function () {
        flag_p_qty = inputJudge("#p_qty", "number", 1, 100);
    });

    //即時監聽#p_dtime
    $("#p_dtime").on("input", function () {
        flag_p_dtime = inputJudge("#p_dtime", "hourMimute", 5, 5);
    });

    //按鈕監聽 #add_btn
    $("#add_btn").on("click", function () {
        resetFormInpit("#p_id");
        resetFormInpit("#p_name");
        resetFormInpit("#p_price");
        resetFormInpit("#p_qty");
        resetFormInpit("#p_dtime");
        $("#updateModal").modal("show");
        $("#foodBarModalLabel").empty();
        $("#foodBarModalLabel").append("新增餐飲")
        $("#update_ok_btn").addClass("hideElement");
        $("#add_ok_btn").removeClass("hideElement");
    });

    // $('#cancel_btn').on('click', function () {
    //   $('#updateModal').modal('hide');
    // });

    //按鈕監聽 #add_ok_btn
    $("#add_ok_btn").on("click", function () {
        if (flag_p_name && flag_p_dtime && flag_p_qty && flag_p_price) {
            //內容都符合規定
            //收集資料並轉呈json格式
            let jsonDATA = {};
            jsonDATA["name"] = $("#p_name").val();
            jsonDATA["price"] = $("#p_price").val();
            jsonDATA["qty"] = $("#p_qty").val();
            jsonDATA["downTime"] = $("#p_dtime").val();
            //傳遞至後端API 執行新增
            axios.post(`https://${dataHost}:3002/barFoods`, JSON.stringify(jsonDATA))
                .then(function (response) {
                    if (response.status == 201) {
                        //新增成功
                        Swal.fire({
                            title: "新增成功!",
                            icon: "success",
                            showDenyButton: false,
                            showCancelButton: false,
                            confirmButtonText: "確認",
                            denyButtonText: `Don't save`
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // food;
                            }
                        });
                    } else alertSW(response.statusText)
                })
                .catch(function (error) {
                    console.log(error);
                })
                .finally(function () {
                    // always executed
                    flag_p_name = flag_p_dtime = flag_p_qty = flag_p_price = false;
                });
        } else alertSW("輸入錯誤!", "請檢查欄位!")
    });

    //按鈕監聽 #update_ok_btn
    $("#update_ok_btn").on("click", function () {
        if (flag_p_name && flag_p_price && flag_p_qty && flag_p_dtime) {
            //更新輸入符合規定
            //整理傳遞給後端API所需的資料
            let id = $("#p_id").val();
            let jsonDATA = {};
            jsonDATA["name"] = $("#p_name").val();
            jsonDATA["price"] = $("#p_price").val();
            jsonDATA["qty"] = $("#p_qty").val();
            jsonDATA["downTime"] = $("#p_dtime").val();

            //傳遞至後端API 執行更新
            axios.put(`https://${dataHost}:3002/barFoods/${id}`, JSON.stringify(jsonDATA))
                .then(function (response) {
                    //console.log(response);
                    if (response.status == 200) {
                        Swal.fire({
                            title: "更新成功",
                            icon: "success",
                            showDenyButton: false,
                            showCancelButton: false,
                            confirmButtonText: "確認",
                            denyButtonText: `Don't save`
                        }).then((result) => {
                            if (result.isConfirmed) {
                                //關閉modal所有的功能
                                // $('#updateModal').hide();
                                $('#updateModal').modal('hide');
                                //bootstrap.Modal.getOrCreateInstance("#updateModal").hide();
                                getBarItem();
                            }
                        });
                    } else alertSW("更新失敗");
                })
                .catch(function (error) {
                    console.log(error);
                })
                .finally(function () {
                    // always executed
                });

        } else alertSW("輸入錯誤!", "請檢查欄位!");
    });
    //s14 end

    //s15 start
    //產生縣市選單
    renderCityOption();
    //監聽選單citySelect
    $("#citySelect").on("change", function () {
        //console.log($(this).val());
        currentCity = $(this).val();
        const towns = Object.keys(regionData[currentCity]);
        renderTownOption(towns);
        $("#hotel_tbody").empty();
        const hotels = regionData[currentCity][currentTown];
        maxPage = hotels.length - 1;
        currentPage = 0;
    })

    //監聽選單townSelect
    $("#townSelect").on("change", function () {
        //console.log($(this).val());
        currentTown = $(this).val();
        currentPage = 0;
        const hotels = regionData[currentCity][currentTown];
        maxPage = hotels.length - 1;
        renderHotelTable(hotels[currentPage]);
        renderHotelPagination(currentTown, currentPage);
    })

    //監聽 頁碼 mypagination
    $("#mypagination").on("click", ".page-link", function () {
        //console.log($(this).data("id"));
        //prev next
        if ($(this).data("id") == 10000 || $(this).data("id") == 20000) {
            if ($(this).data("id") == 10000 && currentPage > 0) currentPage--;
            if ($(this).data("id") == 20000 && currentPage < maxPage) currentPage++;
        } else currentPage = $(this).data("id");
        //產生該頁碼的table資料
        renderHotelTable(regionData[currentCity][currentTown][currentPage]);
        renderHotelPagination(currentTown, currentPage);
    });
    //s15 end
});
//main function end

//star s12
//read open data ODwsvTravelFood.json
let travelFoodData = [];
function getTravelFoodItem() {
    return $.ajax({
        type: "GET",
        url: "js/json/ODwsvTravelFood.json",
        dataType: "json",
        success: showdTravelFood,
        error: function () {
            console.log("連線錯誤! - js/json/ODwsvTravelFood.json");
        }
    });
}

//產生縣市選單
function renderFoodCityOption() {
    $("#cityFoodSelect").empty();
    $("#cityFoodSelect").append(`<option class="fw-500" value="" selected disabled>---選擇縣市名稱---</option>`);

    for (const item in travelFoodData) {
        var strHTML = `<option class="fw-500" value="${item}">${item}</option>`;
        $("#cityFoodSelect").append(strHTML);
    };
}

function groupFoodCity(ress) {
    const result = [];
    ress.forEach(res => {
        const city = res.City;
        // 初始化 City
        if (!result[city]) {
            result[city] = [];
        }
        // 放入最後一組
        result[city].push(res);
    });
    return result;
}

function showdTravelFood(data) {
    travelFoodData = groupFoodCity(data);
    //console.log(travelFoodData);
    renderFoodCityOption();
    item = [3];
    $("#picture-in").empty();
    data.forEach((item, i) => {
        //for (let i = 0; i < 20; i++) {
        if (i == 0) item[0] = data[$(data).length - 1];
        else item[0] = data[i - 1];
        item[1] = data[i];
        if (i == data.length - 1) item[2] = data[0];
        else item[2] = data[i + 1];
        let strHTML, tempHTML;
        if (i == 0) strHTML = `<div class="carousel-item active"> <div class="row g-3">`;
        else strHTML = `<div class="carousel-item"> <div class="row g-3">`;
        let
            myWords,
            myAdd,
            myTel,
            myImg,
            myUrl,
            myUrlT;

        for (let j = 0; j < 3; j++) {
            myWords = myAdd = myTel = myUrlT = '未提供';
            myUrl = "javascipt: void(0);";
            myBlank = "";
            myImg = 'images/未提供2.png';
            if (item[j].HostWords != "") myWords = item[j].HostWords;
            if (item[j].Address != "") myAdd = item[j].Address;
            if (item[j].Tel != "") myTel = item[j].Tel;
            if (item[j].PicURL != "") myImg = item[j].PicURL;
            if (item[j].Url != "") {
                myUrl = item[j].Url;
                myBlank = 'target="_blank"';
                myUrlT = '前往官網'
            } else {
                myUrl = 'javascript: void (0);" onclick="nothing()';
                myBlank = "";
                myUrlT += '網站';
            }
            if (j == 1) strHTML += `<div class="col-sm-12 col-md-6 roller-box-t mt-3">`;
            else strHTML += `<div class="col-md-3 d-none d-md-block roller-box-t mt-3">`;
            strHTML += `
                        <div class="roller">
                        <a href="${myUrl}" ${myBlank} class="btn btn-success"><span class="fw-900 mirror-b-text" style="font-size: 24px; color:tomato;">${myUrlT}</span></a>
                        </div>
                        <div class="fw-700 text-tomato h5 text-truncate bgb-text text-center">${item[j].Name}</div>
                        <div class="product-card">
                            <img src="${myImg}"人氣餐飲...." height=`
            if (j == 1) strHTML += '"360">';
            else strHTML += '"180">';
            strHTML += `
                        </div>
                        <div class="small text-darkgreen fw-500"><i class="fa-solid fa-phone"></i>電話: ${myTel}
                        </div>
                            <div class="small text-darkgreen fw-500"><i class="fa-solid fa-location-dot"></i></i>地址: ${myAdd}</div>
                    </div>`;
            if (j == 1) tempHTML = myWords;
        }
        strHTML += `</div><hr class="text-brown"><div class="text-light px-md-5 mx-md-5 mb-3 bgb-text">${tempHTML}</div> </div>`;
        $("#picture-in").append(strHTML);
    });
}
//ens s12

//start s13
//取得songs.json所有資料
let songData = [];
let songRanking = new Map;
function getAllSongs() {
    return axios.get(`https://${dataHost}:3001/songs`)
        .then(function (response) {
            songData = response.data;
            sortSong("點歌次數");
        })
        .catch(function (error) {
            console.log(error);
        })
        .finally(function () {
            // always executed
        });
}

function sortSong(sortWay) {
    // 取出 songs
    // 依歌曲名稱排序（localeCompare 支援中文）
    switch (sortWay) {
        case "編號":
            songData.sort((a, b) => a.no - b.no);
            break;
        case "點歌次數":
            songData.sort((a, b) => b.singedTimes - a.singedTimes);
            songRanking.clear();
            songData.forEach(function (item, key) {
                songRanking.set(item.no, key);
            })
            break;
        case "演唱者":
            songData.sort((a, b) => a.singerName.localeCompare(b.singerName, 'zh-TW'));
            break;
        case "歌名":
            songData.sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'));
            break;
        case "語種":
            songData.sort((a, b) => a.language.localeCompare(b.language, 'zh-TW'));
            break;
    }
    //把排序後資料塞回 data
    renderSongTable();
}

//搜尋歌名
function searchSong(name) {
    if (name == "") return;
    const filteredSongs = songData.filter(song =>
        song.name.toLowerCase().includes(name.toLowerCase()));
    if (filteredSongs.length > 0) {
        $("#print_data_modal>.modal-dialog").removeClass("modal-lg");
        $("#print_data_modal").modal("show");
        $("#print_data").empty();
        strHTML = `
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col">排行</th>
                    <th scope="col">編號</th>
                    <th scope="col">歌名</th>
                    <th scope="col">演唱者</th>
                    <th scope="col">語種</th>
                    <th scope="col">試聽</th>
                  </tr>
                </thead>
                <tbody class="fw-400" id="mysongtbodys">
                `;
        filteredSongs.forEach((item) => {
            strHTML += `
                  <tr>
                    <td>${songRanking.get(item.no) + 1}</td>
                    <td>${item.no}</td>
                    <td>${item.name}</td>
                    <td>${item.singerName}</td>
                    <td>${item.language}</td>
                    <td>
                      <button class="btn btn-success text-nowrap p-0" title="歡迎試聽!" style="font-size:14px;" type="button" onclick="openVideoModal('${item.location}')">試聽點</button>
                    </td>
                  </tr>
                         `;
        });
        strHTML += `
                </tbody>
              </table>`;
        $("#print_data").append(strHTML);
        $("#printModalLabel").empty();
        $("#printModalLabel").append("歌曲搜尋結果");
    } else {
        //此筆名稱不存在, 可以使用
        alertSW("查無歌名相近歌曲!");
    }
}

function renderSongTable() {
    //產生table
    $("#mysongtbody").empty();
    songData.forEach((item) => {
        let strHTML = `
                  <tr class="fw-500">
                    <td data-th="排行">${songRanking.get(item.no) + 1}</td>
                    <td data-th="歌曲編號">${item.no}</td>
                    <td data-th="歌曲名稱">${item.name}</td>
                    <td data-th="演唱者">${item.singerName}</td>
                    <td data-th="語種">${item.language}</td>
                    <td data-th="點歌次數">${item.singedTimes}</td>
                    <td data-th="試聽"><button class="btn btn-success text-nowrap p-0" title="歡迎試聽!" style="font-size:14px;" onclick="openVideoModal('${item.location}')">試聽點</button>
                    </td>
                  </tr>`;
        $("#mysongtbody").append(strHTML);
    });
}
//end s13

//start s15
let regionData = {};
let currentCity;
let currentTown;
let currentPage;
let maxPage;
//取得旅館民宿 - 觀光資訊資料庫 and 資料重構
function getHotelData() {
    return axios.get('js/json/HotelList.json')
        .then(function (response) {

            const hotels = response.data.Hotels;
            regionData = groupByCityTownAndChunk(hotels, 30);
        })
        .catch(function (error) {
            console.log(error);
        })
        .finally(function () {
            // always executed
        });
};

function groupByCityTownAndChunk(hotels, chunkSize = 20) {
    const result = {};

    hotels.forEach(hotel => {
        const city = hotel.PostalAddress.City;
        const town = hotel.PostalAddress.Town;

        // 初始化 City
        if (!result[city]) {
            result[city] = {};
        }

        // 初始化 Town
        if (!result[city][town]) {
            result[city][town] = [];
        }

        // 若尚未建立第一組，或最後一組已滿 chunkSize，就新增新組
        if (
            result[city][town].length === 0 ||
            result[city][town][result[city][town].length - 1].length >= chunkSize
        ) {
            result[city][town].push([]);
        }

        // 放入最後一組
        result[city][town][result[city][town].length - 1].push(hotel);
    });

    return result;
}

//產生縣市選單
function renderCityOption() {
    $("#citySelect").empty();
    $("#citySelect").append(`<option class="fw-900" value="" selected disabled>---選擇縣市名稱---</option>`);

    for (const item in regionData) {
        var strHTML = `<option class="fw-900" value="${item}">${item}</option>`;
        $("#citySelect").append(strHTML);
    };

    // regionTitle.forEach((item) => {
    //     var strHTML = `<option value="${item}">${item}</option>`;
    //     $("#citySelect").append(strHTML);
    // });
}

//產生區域選單
function renderTownOption(towns) {
    $("#townSelect").empty();
    $("#townSelect").append(`<option class="fw-900" value="" selected disabled>---選擇區域名稱---</option>`);
    towns.forEach((item) => {
        var strHTML = `<option class="fw-900" value="${item}">${item}</option>`;
        $("#townSelect").append(strHTML);
    });
    currentTown = towns[0];
}

function renderHotelTable(hotels) {
    $("#hotel_tbody").empty();
    hotels.forEach((item) => {
        //擷取0-30字
        description = item.Description.substring(0, 50);
        const number = item.HotelID.substring(item.HotelID.length - 6, item.HotelID.length);
        let myName;
        if (item.WebsiteURL == "") myName = item.HotelName;
        else myName = `<a href="${item.WebsiteURL}" target="_blank" />${item.HotelName}`;
        let strHTML = `<tr>
                            <td data-th="編號">${number}</td>
                            <td data-th="名稱">${myName}</td>
                            <td data-th="電話">${item.Telephones[0].Tel}</td>
                            <td data-th="地址">${item.PostalAddress.City}${item.PostalAddress.Town}${item.PostalAddress.StreetAddress}</td>
                            <td data-th="簡介"><span class="d-flex">${description}</span></td>
                        </tr>`;
        $("#hotel_tbody").append(strHTML)
    });
}

function renderHotelPagination(town, page = 0) {
    $("#mypagination").empty();
    $("#mypagination").append(`<li class="page-item"><a class="page-link" data-id="10000"><</a></li>`);
    regionData[currentCity][town].forEach((item, key) => {
        let strHTML = `<li class="page-item"><a class="page-link `;
        if (key == page) strHTML += `active`;
        strHTML += `" href="javascript:void(0);" onclick="nothing()" data-id="${key}">${key + 1}</a></li>`;
        $("#mypagination").append(strHTML);
    });
    $("#mypagination").append(`<li class="page-item"><a class="page-link" data-id="20000">></a></li>`);
}
//end s15

//start s14
let FoodsData = [];
let flag_p_name = false;
let flag_p_price = false;
let flag_p_qty = false;
let flag_p_dtime = false;
let currentBarPage = 0;
let maxFoodPage = 0;
//取得所有資料
function getBarItem() {
    return axios.get(`https://${dataHost}:3002/barFoods`)
        .then(function (response) {
            //資料重構
            foodsData = [];
            response.data.forEach((item, key) => {
                if (key % 10 == 0) {
                    foodsData.push([]);
                }
                page = parseInt(key / 10);
                foodsData[page].push(item);
            });
            maxFoodPage = foodsData.length - 1;
            renderBarTable(currentBarPage);
            renderBarPagination(currentBarPage);
        })
        .catch(function (error) {
            console.log(error);
        })
        .finally(function () {
            // always executed
        });
}

function renderBarTable(page = 0) {
    //產生table
    $("#mybartbody").empty();
    foodsData[page].forEach((item) => {
        let strHTML = `
                      <tr class="fw-400">
                        <td data-th="編號">${item.id}</td>
                        <td data-th="名稱">${item.name}</td>
                        <td data-th="價格">${item.price}</td>
                        <td data-th="數量">${item.qty}</td>
                        <td data-th="下架時間">${item.downTime}</td>
                        <td data-th="操作">
                            <button class="btn btn-warning btn-update" data-bs-toggle="modal"
                                data-bs-target="#updateModal" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-qty="${item.qty}" data-dtime="${item.downTime}">更新</button>
                            <button class="btn btn-danger btn-delete" data-id="${item.id}">刪除</button>
                        </td>
                      </tr>`;
        $("#mybartbody").append(strHTML);
    });
}

function renderBarPagination(page = 0) {
    $("#myBarPagination").empty();
    $("#myBarPagination").append(`<li class="page-item"><a class="page-link" data-id="10000"><</a></li>`);
    foodsData.forEach((item, key) => {
        let strHTML = `<li class="page-item"><a class="page-link `
        if (key == page) strHTML += `active`;
        strHTML += `"  href="javascript:void(0);" onclick="nothing()" data-id="${key}">${key + 1}</a></li>`;
        $("#myBarPagination").append(strHTML);
    });
    $("#myBarPagination").append(`<li class="page-item"><a class="page-link" data-id="20000">></a></li>`);
}
//end s14

//公用函式
function nothing() { };

function reloadPage() {
    // 等於按下瀏覽器的重新整理
    location.reload();
}
function resetFormInpit(id) {
    $(id).val($(id).default);
    $(id).removeClass("is-valid");
    $(id).removeClass("is-invalid");
}

function alertSW(msg = "有錯誤!", txt = "請檢查!", showicon = "error", clr = "red") {
    Swal.fire({
        title: msg,
        text: txt,
        icon: showicon,
        color: clr,
        confirmButtonText: "確認",
    })
}

function getToday() {
    // 取得今天 YYYY-MM-DD
    let todayObj = new Date();
    let yyyy = todayObj.getFullYear();
    let mm = String(todayObj.getMonth() + 1).padStart(2, "0");
    let dd = String(todayObj.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function inputJudge(idText, inputType, min, max) {
    let value,
        emailFormat = true,
        timeFormat = true,
        dateFormat = true;
    switch (inputType) {
        case "number":
            value = $(idText).val();
            break;
        case "text":
            value = $(idText).val().length;
            break;
        case "email":
            emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
            value = $(idText).val().length;
            emailFormat = $(idText).val().search(emailRule) != -1;
            break;
        case "hourMimute":
            timeRule = /(none)|((0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]))/;
            value = $(idText).val() == "none" ? 5 : $(idText).val().length;
            timeFormat = $(idText).val().search(timeRule) != -1;
            break;
        case "date":
            let inputDate = $(idText).val();
            //let todayStr = getToday();
            //$(idText).attr("min", todayStr);
            // 判斷是否大於今天
            dateFormat = inputDate && inputDate >= getToday();
            value = $(idText).val().length;
            break;
        default:
            emailFormat = false;
            break;
    }
    if (value <= max && value >= min && emailFormat && timeFormat && dateFormat) {
        $(idText).addClass("is-valid").removeClass("is-invalid");
        return true;
    }
    else {
        $(idText).addClass("is-invalid").removeClass("is-valid");
        return false;
    }
}

function showTime() {
    const now = new Date();
    $("#showTime").text(now.toLocaleString());
    // Formats time based on user's locale
}
setInterval(showTime, 1000); // Update every second
showTime(); // Initial call

function openVideoModal(link) {
    $("#print_data_modal>.modal-dialog").addClass("modal-lg");
    $("#print_data_modal").modal("show");
    $("#printModalLabel").empty();
    $("#printModalLabel").append("歌曲試聽");
    //塞到Modal       
    $("#print_data").empty();
    $("#print_data").append(`
        <div class="ratio ratio-16x9">
          <iframe width="1024" height="576" src="${link}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" id="video_player"  referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>`);
}

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})

function showOptionData(id, data, def) {
    console.log(data);

    $(id).empty();
    $(id).append(`<option value="" disabled selected>---${def}---</option>`);
    data.forEach(function (item) {
        console.log(item.CityName);

        let strHTML = `<option value="">${item.CityName}</option>`;
        $(id).append(strHTML);
    });
}

//API
async function checkLoginStatus() {
    let token = localStorage.getItem("uid");
    if (!token) {
        //console.log("沒有token!");
        clearLoginUI();
        announceModal();
    } else {
        axios.get(`https://${dataHost}/api/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(function (response) {
                //console.log(response);
                //token驗證成功
                setLoginUI(response.data.username);
            })
            .catch(function (error) {
                clearLoginUI();
                announceModal();
                //console.log(error);
            })
            .finally(function () {
                // always executed
            });
    }

}

function setLoginUI(username) {
    // s02 登入與註冊按鈕消失
    $("#login-btn").addClass("d-none");
    $("#register-btn").addClass("d-none");

    //顯示登入會員訊息
    $("#member-span").removeClass("d-none");
    $("#member-span").html(`會員: <span class="text-light fw-900 h5">${username}</span>`);

    //顯示登出按鈕
    $("#logout-btn").removeClass("d-none");
    //顯示控制台按鈕
    $("#control-panel-btn").removeClass("d-none");

    //顯示內頁區塊
    $("#s09").removeClass("d-none");
    // $("#s10").removeClass("d-none");
    // $("#s11").removeClass("d-none");
    $("#s12").removeClass("d-none");
    $("#s13").removeClass("d-none");
    $("#s14").removeClass("d-none");
    $("#s15").removeClass("d-none");
    $("#s16").removeClass("d-none");
}

function clearLoginUI() {
    // s02 登入與註冊按鈕顯示
    $("#login-btn").removeClass("d-none");
    $("#register-btn").removeClass("d-none");

    //取消登入會員訊息
    $("#member-span").addClass("d-none");

    //取消登出按鈕
    $("#logout-btn").addClass("d-none");

    //取消控制台按鈕
    $("#control-panel-btn").addClass("d-none");

    //在鎖回去
    $("#s09").addClass("d-none");
    // $("#s10").addClass("d-none");
    // $("#s11").addClass("d-none");
    $("#s12").addClass("d-none");
    $("#s13").addClass("d-none");
    $("#s14").addClass("d-none");
    $("#s15").addClass("d-none");
    $("#s16").addClass("d-none");
}

//w3c
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function announceModal() {
    strHTML = `
            <div class="fw-900"><span class="h4">可使用帳號/密碼:</div>
            <h5>admin/123456(所有功能)<br/>
                user001/123456(部分功能)<br/>
                ...
            </h5>
                    `;
    $("#print_data").empty();
    $("#print_data").append(strHTML);
    $("#printModalLabel").empty();
    $("#printModalLabel").append("登入可使用進階功能");
    $("#print_data_modal").modal("show");

}

function inContent() {
    const template = document.querySelector('#my-ccontent');
    const clone = template.content.cloneNode(true);
    document.getElementById('containerShow').appendChild(clone);
}

//產生地圖
let map; //儲存地圖
function initMap() {
    map = L.map('map').setView([24.171425, 120.609670], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([24.171425, 120.609670]).addTo(map)
        .bindPopup('中分署')
        .openPopup();

    L.marker([24.1809457, 120.6016879]).addTo(map)
        .bindPopup('東海大學體育館')
        .openPopup();
}