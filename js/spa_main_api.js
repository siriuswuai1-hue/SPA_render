//const dataHost = "localhost";
//const dataHost = "192.168.10.2";
//const dataHost = "10.201.171.105";
//const dataHost = "flask-api-render-gj52.onrender.com";
const dataHost = "web-production-85353.up.railway.app";

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
    //檢查toekn是否存在和合法
    await Promise.all([
        checkLoginStatus(),
        getTravelFoodItem(),
        getHotelData(),
        initMap()
    ]);

    // await checkLoginStatus();
    // await getTravelFoodItem();
    // await getHotelData();
    // await initMap();

    //移到 checkLoginStatus()
    // await getBarItem();
    // await getAllSongs();
}

//main function start
$(async function () {
    //inContent();
    //等待資料載完
    await init();
    S01Monitor(); //login logout monitor
    s09Monitor(); //地址和基本資料詢問
    s12Monitor(); //好吃報報
    s13Monitor(); //點歌排行與歌曲搜尋
    s14Monitor(); //上架餐飲管理
    s15Monitor(); //各地民宿介紹
});
//main function end


//s01 login logout monitor start
function S01Monitor() {
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
        flag_l_name = inputJudge("#l_name", "text", 2, 30);
        flag_l_pass = inputJudge("#l_pass", "text", 6, 30);
        console.log(flag_l_name, flag_l_pass);
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
        } else {
            alertSW("輸入錯誤!", "請檢查輸入欄位!");
        }
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
                        if (response.request.status == 200 || response.request.status == 201) {
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
}
//s01 login logout monitor end

//s09 monitor start 預約基本資料
function s09Monitor() {
    mapMonitor();

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
                    <div class="fw-900"><span class="h3">姓名: </span>${$("#b_name").val()}</div>
                    <div class="fw-900"><span class="h3">日期: </span>${$("#b_date").val()}</div>
                    <div class="fw-900"><span class="h3">人數: </span>${$("#b_people").val()}</div>
                    <div class="fw-900"><span class="h3">電話: </span>${$("#b_phone").val()}</div>
                    <div class="fw-900"><span class="h3">包廂: </span>${$("#b_room option:selected").text()}</div>
                    <div class="fw-900"><span class="h3">城市: </span>${$("#b_city option:selected").text()}</div>
                    <div class="fw-900"><span class="h3">地區: </span>${$("#b_county option:selected").text()}</div>
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
        if (selectedLayer) selectedLayer.setStyle(baseStyle);
        selectedLayer = null;
        $("#b_city, #b_county").val("");
        $("#b_county").prop("disabled", true);
        map.setView([23.7, 121], 7);
    });
}
//s09 monitor end

//s12 monitor start
function s12Monitor() {
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
}
//s12 monitor end

//s13 monitor start
function s13Monitor() {
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
}
//s13 monitor end

//s14 monitor start
function s14Monitor() {
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
        const id = $(this).data("id");

        // 確認刪除
        Swal.fire({
            title: "確認刪除？",
            text: "此操作無法復原！",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "確定刪除",
            cancelButtonText: "取消",
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                // 執行刪除
                const token = localStorage.getItem("uid");

                axios.delete(`https://${dataHost}/api/barfoods/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                    .then(() => {
                        Swal.fire({
                            title: "已刪除！",
                            icon: "success",
                            timer: 2000
                        }).then(() => {
                            getBarItem(); // 重新取得列表
                        });
                    })
                    .catch(error => {
                        console.error("Delete error:", error); // 先印出來看！

                        let msg = "刪除失敗，請稍後再試";
                        if (error.response) {
                            // 檢查 response.data 的實際結構
                            const data = error.response.data;
                            msg = data?.error || data?.message || data?.msg || msg;
                        }
                        Swal.fire("錯誤", msg, "error");
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

    //按鈕監聽 #add_ok_btn
    $("#add_ok_btn").on("click", function () {
        if (flag_p_name && flag_p_dtime && flag_p_qty && flag_p_price) {
            console.log(flag_p_name, flag_p_dtime, flag_p_qty, flag_p_price);
            //內容都符合規定
            //收集資料並轉呈json格式
            let jsonDATA = {};
            jsonDATA["name"] = $("#p_name").val();
            jsonDATA["price"] = $("#p_price").val();
            jsonDATA["qty"] = $("#p_qty").val();
            jsonDATA["downtime"] = $("#p_dtime").val();
            //傳遞至後端API 執行新增
            const token = localStorage.getItem("uid");
            return axios.post(`https://${dataHost}/api/barfoods/add`, jsonDATA,
                { headers: { Authorization: `Bearer ${token}` } })
                // axios.post(`https://${dataHost}:3002/barFoods`, JSON.stringify(jsonDATA))
                .then(function (response) {
                    if (response.status == 201 || response.status == 200) {
                        //新增成功
                        Swal.fire({
                            title: "新增成功!",
                            icon: "success",
                            confirmButtonText: "確認",
                        }).then((result) => {
                            if (result.isConfirmed) {
                                getBarItem(); // 重新取得列表
                            }
                        });
                    } else alertSW("狀態不明", response.status)
                    console.log(response);
                })
                .catch(function (error) {
                    console.error("API Error:", error);
                    Swal.fire({
                        title: "網路錯誤",
                        text: error.response?.data?.message || error.message,
                        icon: "error"
                    });
                })
                .finally(function () {
                    // always executed
                });
        } else alertSW("輸入錯誤!", "請檢查欄位!")
    });

    //按鈕監聽 #update_ok_btn
    $("#update_ok_btn").on("click", function () {
        if (flag_p_name && flag_p_price && flag_p_qty && flag_p_dtime) {
            //更新輸入符合規定
            //整理傳遞給後端API所需的資料
            const id = $("#p_id").val();
            let jsonDATA = {};
            jsonDATA["name"] = $("#p_name").val();
            jsonDATA["price"] = $("#p_price").val();
            jsonDATA["qty"] = $("#p_qty").val();
            jsonDATA["downtime"] = $("#p_dtime").val();

            //傳遞至後端API 執行更新
            //axios.put(`https://${dataHost}:3002/barFoods/${id}`, JSON.stringify(jsonDATA))
            let token = localStorage.getItem("uid");
            return axios.put(`https://${dataHost}/api/barfoods/${id}`, jsonDATA,
                { headers: { Authorization: `Bearer ${token}` } })
                .then(function (response) {
                    //console.log(response);
                    if (response.status == 200 || response.status == 201) {
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
}
//s15 monitor end

//s15 monitor start
function s15Monitor() {
    //產生縣市選單
    showOptionData("#citySelect", Object.keys(regionData), "選擇縣市名稱");
    //監聽選單citySelect
    $("#citySelect").on("change", function () {
        //console.log($(this).val());
        currentCity = $(this).val();
        const towns = Object.keys(regionData[currentCity]);
        //產生區域選單
        showOptionData("#townSelect", towns, "選擇區域名稱");
        currentTown = towns[0];
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
}
//s15 monitor end

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
    //產生縣市選單
    showOptionData("#cityFoodSelect", Object.keys(travelFoodData), "選擇縣市名稱");
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
function getAllSongs() {
    let token = localStorage.getItem("uid");

    // 若無 token，直接中止
    if (!token) {
        return Promise.resolve(); // 保持回傳 Promise 的一致性
    }

    return axios.get(`https://${dataHost}/api/songs/list`, {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(function (response) {
            // 確保 data 存在且為陣列
            songData = Array.isArray(response.data?.data) ? response.data.data : [];
            sortSong("點歌次數"); // 資料重構
        })
        .catch(function (error) {
            // 合併錯誤訊息為單一字串（符合 alertSW 預期）
            const errorMsg = error.response?.data?.message || error.message || "未知錯誤";
            alertSW("獲取歌曲列表失敗", errorMsg);
        })
        .finally(function () {
            // always executed
        });
}

let songRanking = new Map;
function sortSong(sortWay) {
    // 取出 songs
    // 依歌曲名稱排序（localeCompare 支援中文）
    switch (sortWay) {
        case "編號":
            songData.sort((a, b) => a.no - b.no);
            break;
        case "點歌次數":
            songData.sort((a, b) => b.singed_imes - a.singed_times);
            songRanking.clear();
            songData.forEach(function (item, key) {
                songRanking.set(item.no, key);
            })
            break;
        case "演唱者":
            songData.sort((a, b) => a.singer_name.localeCompare(b.singer_name, 'zh-TW'));
            break;
        case "歌名":
            songData.sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'));
            break;
        case "語種":
            songData.sort((a, b) => a.language.localeCompare(b.language, 'zh-TW'));
            break;
    }
    //產生table
    $("#mysongtbody").empty();
    songData.forEach((item) => {
        let strHTML = `
                  <tr class="fw-500">
                    <td data-th="排行">${songRanking.get(item.no) + 1}</td>
                    <td data-th="歌曲編號">${item.no}</td>
                    <td data-th="歌曲名稱">${item.name}</td>
                    <td data-th="演唱者">${item.singer_name}</td>
                    <td data-th="語種">${item.language}</td>
                    <td data-th="點歌次數">${item.singed_times}</td>
                    <td data-th="試聽"><button class="btn btn-success text-nowrap p-0" title="歡迎試聽!" style="font-size:14px;" onclick="openVideoModal('${item.location}')">試聽點</button>
                    </td>
                  </tr>`;
        $("#mysongtbody").append(strHTML);
    });
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
                    <td>${item.singer_name}</td>
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
    let token = localStorage.getItem("uid");
    // 若無 token，直接中止
    if (!token) {
        return Promise.resolve(); // 保持回傳 Promise 的一致性
    }
    return axios.get(`https://${dataHost}/api/barfoods/list`, {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(function (response) {
            //資料重構
            foodsData = [];
            response.data.data.forEach((item, key) => {
                if (key % 10 == 0) {
                    foodsData.push([]);
                }
                page = parseInt(key / 10);
                foodsData[page].push(item);
            });
            maxFoodPage = foodsData.length - 1;
            if (currentBarPage > maxFoodPage) currentBarPage = maxFoodPage;
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
                        <td data-th="下架時間">${item.downtime}</td>
                        <td data-th="操作">
                            <button class="btn btn-warning btn-update" data-bs-toggle="modal"
                                data-bs-target="#updateModal" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-qty="${item.qty}" data-dtime="${item.downtime}">更新</button>
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
    $(id).empty();
    $(id).append(`<option value="" disabled selected>---${def}---</option>`);
    data.forEach(function (item) {
        $(id).append(`<option value="${item}">${item}</option>`);
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

async function setLoginUI(username) {
    await Promise.all([
        getBarItem(),
        getAllSongs()
    ]);
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

//產生地圖
// let map; //儲存地圖
// function initMap() {
//     map = L.map('map').setView([24.171425, 120.609670], 13);

//     L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//     }).addTo(map);

//     L.marker([24.171425, 120.609670]).addTo(map)
//         .bindPopup('中分署')
//         .openPopup();

//     L.marker([24.1809457, 120.6016879]).addTo(map)
//         .bindPopup('東海大學體育館')
//         .openPopup();
// }

let map, geoLayer;
let taiwanData = {};
let selectedLayer = null;

/* 樣式 */
const baseStyle = {
    color: "#333",          // 邊框顏色
    weight: 1,              // 邊框寬度
    fillOpacity: 0.3,       // 填充透明度
    fillColor: "#000"    // 填充顏色為灰色
};

const activeStyle = {
    color: "transparent",   // 邊框顏色為透明
    weight: 3,              // 邊框寬度
    fillOpacity: 0          // 填充透明度設為 0，使選中的區域無填充色
};

// 解析 GeoJSON 資料並填充選單
let cities = {};
let cityCenters = {}; // 存儲縣市中心緯度
let districtCenters = {}; // 存儲鄉鎮區中心緯度
async function initMap() {
    /* 初始化地圖 */
    map = L.map("map").setView([23.7, 121], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    /* 載入行政區 GeoJSON */
    await $.getJSON("js/json/twTown1982.geo.json", geo => {
        geoLayer = L.geoJSON(geo, {
            style: baseStyle,  // 預設樣式為灰色填充
            onEachFeature: (feature, layer) => {
                layer.on("click", () => {
                    // 點擊區域時切換樣式
                    selectArea(
                        feature.properties.COUNTYNAME,
                        feature.properties.TOWNNAME,
                        layer
                    );

                    // 點擊後，將該區域樣式切換為 activeStyle
                    layer.setStyle(activeStyle);

                    // 在選中的區域，再次點擊則恢復為預設樣式
                    layer.on("dblclick", () => {
                        layer.setStyle(baseStyle);
                    });
                });
            }
        }).addTo(map);

        geo.features.forEach(feature => {
            let city = feature.properties.COUNTYNAME;
            let district = feature.properties.TOWNNAME;

            if (!cities[city]) cities[city] = [];
            if (!cities[city].includes(district)) {
                cities[city].push(district);

                // 計算並存儲中心點
                let bounds = L.geoJSON(feature).getBounds();
                let center = bounds.getCenter();

                // 存儲縣市中心點（取平均緯度）
                if (!cityCenters[city]) {
                    cityCenters[city] = { lat: 0, count: 0 };
                }
                cityCenters[city].lat += center.lat;
                cityCenters[city].count++;

                // 存儲鄉鎮區中心點
                if (!districtCenters[city]) districtCenters[city] = {};
                districtCenters[city][district] = center.lat;
            }
        });
    });
    // 計算縣市平均緯度
    for (let city in cityCenters) {
        cityCenters[city].avgLat = cityCenters[city].lat / cityCenters[city].count;
    }

    // 按縣市緯度（由北到南，緯度由高到低）排序
    const sortedCities = Object.keys(cities).sort((a, b) => {
        return cityCenters[b].avgLat - cityCenters[a].avgLat; // 由高到低排序（北到南）
    });

    //填充縣市選單
    showOptionData("#b_city", sortedCities, "所在縣市");
    // $("#b_city").append(`<option value="" disabled selected>-- 請選擇縣市 --</option>`);
    // sortedCities.forEach(city => {
    //     $("#b_city").append(`<option value="${city}">${city}</option>`);
    // });
}

function mapMonitor() {
    // 監聽縣市選擇，更新鄉鎮區選單
    $("#b_city").on("change", function () {
        flag_b_city = true;
        const city = this.value;
        $("#b_county").prop("disabled", false);
        if (!city) return;

        // 按鄉鎮區緯度（由北到南，緯度由高到低）排序
        const sortedDistricts = cities[city].sort((a, b) => {
            return districtCenters[city][b] - districtCenters[city][a]; // 由高到低排序（北到南）
        });

        showOptionData("#b_county", sortedDistricts, "所在地區");
    });

    /* 縣市選擇 */
    $("#b_county").on("change", function () {
        flag_b_county = true;
        selectArea($("#b_city").val(), this.value);
    });

    /* 清除 */
    // $("#clearBtn").on("click", () => {
    //     if (selectedLayer) selectedLayer.setStyle(baseStyle);
    //     selectedLayer = null;
    //     $("#b_city, #b_county").val("");
    //     $("#b_county").prop("disabled", true);
    //     map.setView([23.7, 121], 7);
    // });
}

/* 核心：選取行政區（地圖 / 選單 共用） */
function selectArea(city, district, layerFromMap) {
    if (!city || !district) return;

    // reset
    if (selectedLayer) selectedLayer.setStyle(baseStyle);

    geoLayer.eachLayer(l => {
        const p = l.feature.properties;
        if (p.COUNTYNAME === city && p.TOWNNAME === district) {
            selectedLayer = l;
        }
    });

    if (!selectedLayer) return;

    selectedLayer.setStyle(activeStyle);
    map.fitBounds(selectedLayer.getBounds(), { padding: [30, 30] });

    // 同步選單
    $("#b_city").val(city).trigger("change");
    $("#b_county").val(district);
}