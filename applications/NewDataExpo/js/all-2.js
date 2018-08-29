// load app interface from model viewer.
// json file input definition:
//
// {
//  "name" : <input variable name>,
//  "transformation" : <available transformatio>,
//  "type": [<An array types of input variable. *(checkbox, binary, continuous)>
//  "default": <An object

/**
 *
 * jquery.binarytransport.js
 *
 * @description. jQuery ajax transport for making binary data type requests.
 * @version 1.0
 * @author Henry Algus <henryalgus@gmail.com>
 *
 */

// use this transport for "binary" data type
$.ajaxTransport("+binary", function(options, originalOptions, jqXHR) {
    // check for conditions and support for blob / arraybuffer response type
    if (
        window.FormData &&
        ((options.dataType && options.dataType == "binary") ||
            (options.data &&
                ((window.ArrayBuffer && options.data instanceof ArrayBuffer) ||
                    (window.Blob && options.data instanceof Blob))))
    ) {
        return {
            // create new XMLHttpRequest
            send: function(headers, callback) {
                // setup all variables
                var xhr = new XMLHttpRequest(),
                    url = options.url,
                    type = options.type,
                    async = options.async || true,
                    // blob or arraybuffer. Default is blob
                    dataType = options.responseType || "blob",
                    data = options.data || null,
                    username = options.username || null,
                    password = options.password || null

                xhr.addEventListener("load", function() {
                    var data = {}
                    data[options.dataType] = xhr.response
                    // make callback and send data
                    callback(
                        xhr.status,
                        xhr.statusText,
                        data,
                        xhr.getAllResponseHeaders()
                    )
                })

                xhr.open(type, url, async, username, password)

                // setup custom headers
                for (var i in headers) {
                    xhr.setRequestHeader(i, headers[i])
                }

                xhr.responseType = dataType
                xhr.send(data)
            },
            abort: function() {
                jqXHR.abort()
            },
        }
    }
})

var json = ""

var scatter_output_json = ""
var line_output_json = ""
var statistics_output_json = ""

var model = model_name
var analysis_names = []
var om = insert_ontology_modal()
var window_width = jQuery(window).width()
var predefined_gr_list = [
    "race.ethnicity",
    "sex",
    "high.educ",
    "household.income",
    "married",
    "interview_age",
]
var agreenment_text =
    "Access to data is granted under the ABCD/NDA Data Use Agreement. For more information please consult abcdstudy.org and https://data-archive.nimh.nih.gov/abcd."

function load_interface_from_json(model_address) {
    var run_on_json = false
    var default_path =
        "../ModelBuilder/viewer/recipes/" + model + ".json?_" + Math.random()
    if (model_address == "loaded-json") {
        model_address = default_path
        run_on_json = true
    }
    //destroy the input penel if a saved model is loaded
    if (model_address) {
        jQuery(".tutorial-mode")
            .insertAfter("body")
            .hide()
        jQuery(".content").html("")
        jQuery("#scatter").html("")
        jQuery(window).unbind("resize")
        jQuery("#save-model").unbind("click")
        jQuery("#load-model").unbind("click")
    }
    if (!model_address) model_address = default_path
    //Test file path used here, change when launching the real application
    file = jQuery.get(model_address, function(data) {
        if (!run_on_json) {
            json = data

            var setter = JSON.parse(get_value)
            for (setter_it in setter) {
                if (setter_it != "model") {
                    var setter_it_temp = setter_it.split("__DOT__").join(".")
                    setVarByID(setter_it_temp, setter[setter_it])
                }
            }
        } else {
            data = json
        }

        //load title
        jQuery("title").html(json.name)
        jQuery(".brand").html(json.name)
        arr_measure_all = []
        arr_measure_catagorical = []
        arr_measure_catagorical_single = []
        arr_measure_binary = []
        arr_measure_binary_single = []
        arr_measure_fixed = []
        arr_measure_all_single = []

        for (index in data["nodes"]) {
            if (index == "shuffle") continue
            node = data["nodes"][index]
            if (node.name == "Measure All (multi)") {
                arr_measure_all.push(node)
            }
            if (node.name == "Measure Fixed") {
                arr_measure_fixed.push(node)
            }
            if (node.name == "Measure All (single)") {
                arr_measure_all_single.push(node)
            }
            if (node.name == "GAMM4" || node.name == "GAMM4-WD") {
                editor = ace.edit("editor")
                editor.setOptions({
                    autoScrollEditorIntoView: true,
                })
                editor.setTheme("ace/theme/monokai")

                editor.session.setMode("ace/mode/r")
                editor.setOption("autoScrollEditorIntoView", true)
                editor.setShowPrintMargin(false)
                editor.setSelectionStyle("text")
                editor.session.setValue(
                    json["nodes"][getExpertNodeNum()]["state"][0].value
                )
            }
        }

        //insert_update_pannel();
        //TODO: Order of the user interface should be defined in Model builder.
        for (node in arr_measure_all_single) {
            if (node == "shuffle") continue
            if (
                arr_measure_all_single[node].state[0].value == "indepvar" ||
                arr_measure_all_single[node].state[0].value == "depvar"
            ) {
                insert_mutiple_input(arr_measure_all_single[node], true)
            } else if (arr_measure_all_single[node].state[0].value == "grvar") {
                insert_single_select(arr_measure_all_single[node])
            } else if (
                arr_measure_all_single[node]["state"][0]["value"] == "fl.var"
            ) {
                insert_filter_select(arr_measure_all_single[node])
            } else {
                insert_single_input(arr_measure_all_single[node])
            }
        }
        for (node in arr_measure_all) {
            if (node == "shuffle") continue
            if (arr_measure_all[node]["state"][0]["value"] == "smo.var") {
                //Stop using this old smooth term UI, enable again by uncomment
                //insert_mutiple_input_smooth(arr_measure_all[node]);
            } else if (arr_measure_all[node]["state"][0]["value"] == "log.var") {
                //Stop using this old log term UI, enable again by uncomment
                //insert_mutiple_input_log(arr_measure_all[node]);
            } else if (arr_measure_all[node]["state"][0]["value"] == "int.var") {
                //Stop using this old interaction term UI, enable again by uncomment
                //insert_mutiple_input_interaction(arr_measure_all[node]);
            } else if (arr_measure_all[node]["state"][0]["value"] == "sq.var") {
            } else if (arr_measure_all[node]["state"][0]["value"] == "ws.var") {
            } else {
                insert_mutiple_input(arr_measure_all[node], false)
            }
        }

        makeDragable("#handle", "#moveable")
        $("#handle").dblclick(function(){
            if($("#floating-list").height() != 0){
                $("#floating-list").height(0);
                $("#moveable")
                    .height(28)
                    .css("top", $(window).height() - 30);
                
            }else{
                $("#floating-list").height(460);
                $("#moveable").height(500);
                if(parseInt($("#moveable").css("top")) > $(window).height() -500){
                    $("#moveable").css("top",  (parseInt($("#moveable").css("top")) - 470)+"px");
                }
            }
        });
        insert_checkbox(arr_measure_fixed)
        //insert_formula_pannel();
        insert_expert_toggle()
        if (jQuery("#load-list-pannel").length == 0) insert_load_list_pannel()
        if (jQuery("#model-operations").length == 0) insert_save_tabs()
        //if(jQuery("#load-pannel").length == 0) insert_model_load_pannel();
        if (jQuery("#save-pannel").length == 0) insert_model_save_pannel()
        $("body").on("click", function() {
            $(".floating-menu").trigger("contentchanged")
        })
        $(".floating-menu").bind("contentchanged", function() {
            // do something after the div content has changed
            setTimeout(function() {
                showing_nothing = true
                $.each($("#floating-list").find("ul"), function(i, d) {
                    if (!$(d).html() == "") {
                        $.each($(d).find("li"), function(index, li) {
                            if (
                                $(li)
                                .find("div")
                                .attr("hiding-list") == "false" ||
                                !$(li)
                                .find("div")
                                .attr("hiding-list")
                            )
                                showing_nothing = false
                        })
                    }
                })
                showing_nothing
                    ? $(".floating-menu").hide()
                    : $(".floating-menu").show()
            }, 100)
        })
        $(".floating-menu").trigger("contentchanged")
        $("#floating-list").on("resize", function() {
            $(".floating-menu").height(+$("#floating-list").height() + 40)
        })
        $("div[contenteditable]").keypress(function(evt) {
            var keycode = evt.charCode || evt.keyCode
            if (keycode == 13) {
                //Enter key's keycode
                return false
            }
        })
    })
}

function removeDuplicates(arr) {
    var unique_array = []
    for (var i = 0; i < arr.length; i++) {
        if (unique_array.indexOf(arr[i]) == -1) {
            unique_array.push(arr[i])
        }
    }
    return unique_array
}

function insert_filter_select(item_input) {
    var class_type = item_input.id
    var name = ""
    var id = ""
    var default_value = ""
    for (index in item_input.state) {
        state = item_input.state[index]
        if (state.name == "name") {
            name = state.value
        }
        if (state.name == "id") {
            id = state.value
        }
        if (state.name == "value") {
            default_value = state.value
        }
    }
    var div = jQuery("<div>").appendTo(jQuery(".content"))
    div.attr("class", "form-group")
    var label = jQuery("<label>").appendTo(div)
    label.html(name)
    label.attr("for", class_type + "-" + id)
    label.attr("class", "col-md-10 col-form-label span3")
    label.css("line-height", 1.1)
    var d2 = jQuery('<div class="col-md-6">')
        .css("margin-left", 0)
        .css("margin-top", 0)
        .css("font-size", "16px")
        .appendTo(div)
    var input = jQuery("<select>")
    input.attr("id", class_type + "-" + id).appendTo(d2)
    input
        .addClass("selectpickerS")
        .addClass("existingFilters")
        .attr("data-live-search", "true")
        .attr("data-size", "10")
    input.attr(
        "style",
        "font-size:16px;width:100%;margin-left:2px;margin-top: 2px; background-color: rgb(255, 255, 255);"
    )
    temp_val = input.val()
    input.html("")
    //input.append(jQuery("<option>").text("")); // default empty option
    getAllFilters(default_value)

    input.change(function() {
        var v = input.val()
        for (index in item_input.state) {
            state = item_input.state[index]
            if (state.name == "value") {
                state.value = v
                console.log("JSON has been updated.")
                console.log(state)
                jQuery("#formula").html(get_formula())
            }
        }
    })

    console.log(default_value)
}

function insert_single_select(item_input) {
    var class_type = item_input.id
    var name = ""
    var id = ""
    var default_value = ""
    for (index in item_input.state) {
        state = item_input.state[index]
        if (state.name == "name") {
            name = state.value
        }
        if (state.name == "id") {
            id = state.value
        }
        if (state.name == "value") {
            default_value = state.value
        }
    }
    var div = jQuery("<div>")
    div.attr("class", "form-group")
    var label = jQuery("<label>")
    label.html(name)
    label.attr("for", class_type + "-" + id)
    label.attr("class", "col-md-10 col-form-label span3")
    label.css("line-height", 1.1)
    var d2 = jQuery('<div class="col-md-6">')
        .css("margin-left", 0)
        .css("margin-top", 0)
        .css("font-size", "16px")
    var input = jQuery("<select>")
    input.attr("id", class_type + "-" + id)
    input.attr("class", "dropdown-select")
    input.attr(
        "style",
        "font-size:16px;width:100%;margin-left:2px;margin-top: 2px; background-color: rgb(255, 255, 255);"
    )
    input.val(default_value)
    temp_val = input.val()
    input.html("")
    input.append(jQuery("<option>").text("")) // default empty option
    jQuery.each(
        removeDuplicates(predefined_gr_list)
        .filter(function(value) {
            return value != "" && value != "Site" && value != "FamilyID" && value
        })
        .sort(),
        function(index, value) {
            if (value != "interview_age")
                input.append(
                    jQuery("<option>")
                    .html(value)
                    .attr("value", value)
                )
        }
    )
    input.append(
        jQuery("<option>")
        .html("No Grouping")
        .attr("value", "No Grouping")
    )
    input.val(default_value)

    input.change(function() {
        var v = input.val() == "No Grouping" ? "" : input.val()
        for (index in item_input.state) {
            state = item_input.state[index]
            if (state.name == "value") {
                state.value = v
                console.log("JSON has been updated.")
                console.log(state)
                jQuery("#formula").html(get_formula())
            }
        }
    })
    div.append(label)
    d2.append(input)
    div.append(d2)
    jQuery(".content").append(div)
    //setTimeout(function() { jQuery('.dropdown-select').select2(); }, 200);
    jQuery(input).select2({
        placeholder: "",
        allowClear: false,
    })
}

//TODO: a formula pennel to view the formula.
function insert_formula_pannel() {
    var div = jQuery(
        "<textarea readonly id = 'formula' style='margin-top:10px;margin-left:5px;height:75px;width:100%;max-width:100%'></textarea>"
    )

    div.html(get_formula())
    jQuery(".content").append(div)
}
//establish saved model pannel
function insert_load_list_pannel() {
    var name = "Load model:"
    var id = ""
    var div = jQuery("<div>")
        .attr("class", "form-group")
        .attr("id", "load-list-pannel")
        .appendTo(jQuery("#mySidenav"))

    var label = jQuery("<label>")
        .html(name)
        .attr("class", "col-sm-6 col-form-label span3")
        .css("line-height", 1.1)
        .css("margin-top", 8)
        .appendTo(div)

    var $ul = jQuery("<div>")
        .attr("class", "list-group row-fluid")
        .attr("style", "padding-left:10px; padding-right:10px; overflow-y: auto")
        .css("height", jQuery(window).height() - 275)
        .appendTo(div)

    var pass_post = {
        action: "loadModelList",
    }
    jQuery.post("./run.php", pass_post).done(function(data) {
        var d = JSON.parse(data)
        for (list_key in d) {
            if (
                user_name == "admin" ||
                list_key.includes("[Public]") ||
                list_key.includes(user_name)
            ) {
                var $value = IsJsonString(d[list_key])
                    ? JSON.parse(d[list_key])
                    : d[list_key]
                if (typeof $value != "string") {
                    var $a = jQuery(
                        '<li href="#" class="list-group-item list-group-item-action flex-column align-items-start">'
                    ).appendTo($ul)
                    var $title_wrap = jQuery(
                        '<div class="d-flex w-100 justify-content-between">'
                    ).appendTo($a)

                    var $h = jQuery('<h6 class="mb-1">')
                        .html(list_key)
                        .appendTo($title_wrap)
                    var $dates = jQuery("<small style = 'font-size:50%'>")
                        .html(moment($value["last-edit-time"]).fromNow())
                        .appendTo($title_wrap)
                    var $p = jQuery('<p class="mb-1" style="font-size:0.7rem">')
                        .html(
                            getVarNameByID("depvar", JSON.parse($value.json)) +
                            " ~ " +
                            getVarNameByID("indepvar", JSON.parse($value.json))
                        )
                        .appendTo($a)
                    var $small = jQuery(
                        '<small class="text-muted" style = "font-size:50%">'
                    ).appendTo($a)
                } else {
                    var $a = jQuery(
                        '<li href="#" class="list-group-item list-group-item-action flex-column align-items-start">'
                    ).appendTo($ul)
                    var $title_wrap = jQuery(
                        '<div class="d-flex w-100 justify-content-between">'
                    ).appendTo($a)
                    var $h = jQuery('<h6 class="mb-1">')
                        .html(list_key)
                        .appendTo($title_wrap)
                    var $dates = jQuery("<small>")
                        .html("past")
                        .appendTo($title_wrap)
                    var $p = jQuery('<p class="mb-1" style="font-size:0.7rem">')
                        .html("")
                        .appendTo($a)
                    var $small = jQuery('<small class="text-muted">').appendTo($a)
                }
                $a.attr("value", JSON.stringify(d[list_key]))
                $a.attr(
                    "result-code",
                    d[list_key]["result-code"] ? d[list_key]["result-code"] : undefined
                )
                $a.attr("title", list_key)
                $a.click(function() {
                    jQuery(this)
                        .parent()
                        .addClass("disabledbutton")
                    $("html").animate(
                        {
                            scrollTop: 0,
                        },
                        "fast"
                    )

                    jQuery(this)
                        .parent()
                        .children()
                        .removeClass("active")
                    jQuery(this).addClass("active")
                    var $title_name = jQuery(this).attr("title")
                    var $status = jQuery(this)
                        .attr("title")
                        .includes("[Public]")
                        ? "Public"
                        : "private"
                    var $title_name_user = $title_name
                        .replace("[Public]", "")
                        .split("-")
                        .slice(1)
                        .join("-")
                    jQuery("#save-pannel")
                        .find("input")
                        .each(function(i, d) {
                            if (jQuery(d).attr("type") != "checkbox") {
                                jQuery(d).val($title_name_user)
                            } else {
                                $status == "private"
                                    ? jQuery(d).prop("checked", true)
                                    : jQuery(d).prop("checked", false)
                            }
                        })
                    $val = JSON.parse(jQuery(this).attr("value"))
                    if (typeof $val == "string") {
                        load_interface_from_json($val)

                        jQuery("#load-list-pannel .list-group").removeClass(
                            "disabledbutton"
                        )
                    } else {
                        json = JSON.parse($val.json)
                        random = $val["result-code"]
                        load_interface_from_json("loaded-json")
                        if (jQuery(this).attr("result-code")) {
                            var pass_post = {
                                code: jQuery(this).attr("result-code"),
                                action: "read",
                                time: 60,
                            }
                            jQuery.post("./run.php", pass_post).done(function(data) {
                                display = data
                                if (display != "Not found") {
                                    timeout_check = false
                                    clearDisplayCheck(0)
                                }
                                if (data !== "Not found") console.log(data)
                            })
                        } else {
                            jQuery("#load-list-pannel .list-group").removeClass(
                                "disabledbutton"
                            )
                        }
                    }
                })
            }
        }
    })
}

function insert_model_load_pannel() {
    var icon = jQuery("#load-model")

    var name = "Load model:"
    var id = ""
    var div = jQuery("<div>")
    div.attr("class", "form-group").attr("id", "load-pannel")
    var label = jQuery("<label>")
    label.html(name)
    label.attr("class", "col-sm-6 col-form-label span3")
    label.css("line-height", 1.1)
    label.css("margin-top", 8)

    var d2 = jQuery('<div class="col-md-10 span9">')
    var input = jQuery("<select>")
    input.attr("class", "form-control-sm dropdown-select")
    input.attr(
        "style",
        "width: 100%; margin-top: 2px; background-color: rgb(255, 255, 255);"
    )

    var pass_post = {
        action: "loadModelList",
    }

    jQuery.post("./run.php", pass_post).done(function(data) {
        console.log(data)
        input.html("")
        var d = JSON.parse(data)
        input.append("<option>None selected</option>")
        for (list_key in d) {
            if (
                user_name == "admin" ||
                list_key.includes("[public]") ||
                list_key.includes(user_name)
            )
                input.append(
                    jQuery("<option>")
                    .html(list_key)
                    .attr("value", JSON.stringify(d[list_key]))
                )
        }
        jQuery(".dropdown-select").select2()
    })
    input.change(function() {
        console.log(jQuery(this).attr("value"))
        $("#main").animate(
            {
                scrollTop: 0,
            },
            "fast"
        )
        $val = JSON.parse(jQuery(this).val())
        if (typeof $val == "string") {
            load_interface_from_json($val)
        } else {
            json = JSON.parse($val.json)
            load_interface_from_json("loaded-json")
        }
    })

    div.append(label)
    d2.append(input)
    div.append(d2)
    jQuery("#mySidenav").append(div)
}

function update_load_list_pannel() {
    var pass_post = {
        action: "loadModelList",
    }
    jQuery.post("./run.php", pass_post).done(function(data) {
        var $ul = jQuery("#load-list-pannel .list-group")
        var d = JSON.parse(data)
        for (list_key in d) {
            if (
                user_name == "admin" ||
                list_key.includes("[public]") ||
                list_key.includes(user_name)
            ) {
                var $value = IsJsonString(d[list_key])
                    ? JSON.parse(d[list_key])
                    : d[list_key]
                var need_update = true
                $ul.find("li").each(function(i, ele) {
                    if (
                        jQuery(ele)
                        .find("h6")
                        .html() == list_key
                    ) {
                        need_update = false
                        if (JSON.stringify(d[list_key]) != jQuery(ele).attr("value")) {
                            jQuery(ele).attr("value", JSON.stringify(d[list_key]))
                            jQuery(ele).attr(
                                "result-code",
                                d[list_key]["result-code"]
                                ? d[list_key]["result-code"]
                                : undefined
                            )
                        }
                    }
                })
                if (!need_update) continue
                if (typeof $value != "string") {
                    var $a = jQuery(
                        '<li href="#" class="list-group-item list-group-item-action flex-column align-items-start">'
                    ).appendTo($ul)
                    var $title_wrap = jQuery(
                        '<div class="d-flex w-100 justify-content-between">'
                    ).appendTo($a)

                    var $h = jQuery('<h6 class="mb-1">')
                        .html(list_key)
                        .appendTo($title_wrap)
                    var $dates = jQuery("<small>")
                        .html(moment($value["last-edit-time"]).fromNow())
                        .appendTo($title_wrap)
                    var $p = jQuery('<p class="mb-1" style="font-size:0.7rem">')
                        .html("We need user defined description.")
                        .appendTo($a)
                    var $small = jQuery('<small class="text-muted">').appendTo($a)
                } else {
                    var $a = jQuery(
                        '<li href="#" class="list-group-item list-group-item-action flex-column align-items-start">'
                    ).appendTo($ul)
                    var $title_wrap = jQuery(
                        '<div class="d-flex w-100 justify-content-between">'
                    ).appendTo($a)
                    var $h = jQuery('<h6 class="mb-1">')
                        .html(list_key)
                        .appendTo($title_wrap)
                    var $dates = jQuery("<small>")
                        .html("past")
                        .appendTo($title_wrap)
                    var $p = jQuery('<p class="mb-1" style="font-size:0.7rem">')
                        .html("We need user defined description.")
                        .appendTo($a)
                    var $small = jQuery('<small class="text-muted">').appendTo($a)
                }
                $a.attr("value", JSON.stringify(d[list_key]))
                $a.attr(
                    "result-code",
                    d[list_key]["result-code"] ? d[list_key]["result-code"] : undefined
                )
                $a.attr("title", list_key)
                $a.click(function() {
                    jQuery(this)
                        .parent()
                        .addClass("disabledbutton")
                    $("html").animate(
                        {
                            scrollTop: 0,
                        },
                        "fast"
                    )

                    jQuery(this)
                        .parent()
                        .children()
                        .removeClass("active")
                    jQuery(this).addClass("active")
                    var $title_name = jQuery(this).attr("title")
                    var $status = jQuery(this)
                        .attr("title")
                        .includes("[Public]")
                        ? "Public"
                        : "private"
                    var $title_name_user = $title_name
                        .replace("[Public]", "")
                        .split("-")
                        .slice(1)
                        .join("-")
                    console.log($title_name_user)
                    jQuery("#save-pannel")
                        .find("input")
                        .each(function(i, d) {
                            if (jQuery(d).attr("type") != "checkbox") {
                                console.log($title_name_user)
                                jQuery(d).val($title_name_user)
                            } else {
                                $status == "private"
                                    ? jQuery(d).prop("checked", true)
                                    : jQuery(d).prop("checked", false)
                            }
                        })
                    $val = JSON.parse(jQuery(this).attr("value"))
                    if (typeof $val == "string") {
                        load_interface_from_json($val)
                        jQuery("#load-list-pannel .list-group").removeClass(
                            "disabledbutton"
                        )
                    } else {
                        json = JSON.parse($val.json)
                        random = $val["result-code"]
                        load_interface_from_json("loaded-json")
                        if (jQuery(this).attr("result-code")) {
                            var pass_post = {
                                code: jQuery(this).attr("result-code"),
                                action: "read",
                                time: 60,
                            }
                            jQuery.post("./run.php", pass_post).done(function(data) {
                                console.log(e)
                                display = data
                                if (display != "Not found") {
                                    timeout_check = false
                                    clearDisplayCheck()
                                }
                                if (data == "Not found") console.log(data)
                            })
                        } else {
                            jQuery("#load-list-pannel .list-group").removeClass(
                                "disabledbutton"
                            )
                        }
                    }
                })
            }
        }
    })
}

function insert_save_tabs() {
    $ul = jQuery('<ul id = "model-operations" class="nav">')
        .css("padding-left", 13)
        .css("padding-top", 5)
    $li_save = jQuery(
        '<li role="presentation" class="active"><button type="button" class="btn btn-primary" ><i class="far fa-save"></i></button></li>'
    )
        .css("margin", 2)
        .appendTo($ul)
    $li_download = jQuery(
        '<li role="presentation" class="active"><button type="button" class="btn btn-success" ><i class="fas fa-download"></i></button></li>'
    )
        .css("margin", 2)
        .appendTo($ul)
    $li_upload = jQuery(
        '<li role="presentation" class="active"><button type="button" class="btn btn-success" data-toggle="modal" data-target=".bd-example-modal-lg" ><i class="fas fa-upload"></i></button></li>'
    )
        .css("margin", 2)
        .appendTo($ul)
    $li_share = jQuery(
        '<li role="presentation" class="active"><button type="button" class="btn btn-warning" data-toggle="modal" data-target=".bd-example-modal-lg-share" ><i class="fas fa-share"></i></button></li>'
    )
        .css("margin", 2)
        .appendTo($ul)
    //$li_twitter = jQuery('<li role="presentation" class="active"><button type="button" class="btn btn-info" ><i class="fab fa-twitter-square"></i></button></li>').css("margin",2).appendTo($ul);
    $li_trash = jQuery(
        '<li role="presentation" class="active"><button type="button" class="btn btn-danger" ><i class="fas fa-trash-alt"></i></button></li>'
    )
        .css("margin", 2)
        .appendTo($ul)

    //upload functionality
    jQuery("body").append(
        '<div class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">' +
        '<div class="modal-dialog modal-lg">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<h5 class="modal-title" id="exampleModalLongTitle">Modal title</h5>' +
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
        '<span aria-hidden="true">&times;</span>' +
        "</button>" +
        "</div>" +
        '<div class="modal-body">' +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>"
    )

    //share functionality
    jQuery("body").append(
        '<div class="modal fade bd-example-modal-lg-share" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">' +
        '<div class="modal-dialog modal-lg">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<h5 class="modal-title" id="exampleModalLongTitle">Share</h5>' +
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
        '<span aria-hidden="true">&times;</span>' +
        "</button>" +
        "</div>" +
        '<div class="modal-body modal-body-share">' +
        '<div class="input-group mb-3">' +
        '<input id = "url-input" type="text" class="form-control" placeholder="" aria-label="" aria-describedby="basic-addon2">' +
        '<div class="input-group-append">' +
        '<button id = "copy-url-button" class="btn btn-primary" type="button">Copy URL</button>' +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>"
    )

    jQuery("#mySidenav").append($ul)
    document.addEventListener("copy", function(e) {
        if (e.currentTarget.activeElement.id == "copy-url-button") {
            e.clipboardData.setData("text/plain", $("#url-input").val())
        }
        if (
            e.currentTarget.activeElement.id == "copy-url-button" ||
            e.currentTarget.activeElement.classList.value == "ace_text-input"
        )
            e.preventDefault() // default behaviour is to copy any selected text
    })
    jQuery("#copy-url-button").on("click", function() {
        document.execCommand("copy")
    })

    $li_share.on("click", function() {
        var url_front = window.location.href
        if (window.location.href.charAt(window.location.href.length - 1) == "#") {
            url_front = url_front.substring(0, url_front.length - 1)
        }
        $("#url-input").val(url_front + "&" + generateQueryString(getListofID()))
    })
    //delete functionality
    $li_trash.click(function() {
        if (jQuery("#load-list-pannel .list-group").find(".active").length > 0) {
            var act_list = jQuery("#load-list-pannel .list-group").find(".active")
            var model_tag = act_list.find("h6").html()
            if (!model_tag.includes(user_name)) {
                alert("You don't have the permission to modify this model.")
                return
            }
            if (
                confirm("Plase confirm you want to delete model " + model_tag + "?")
            ) {
                var pass_post = {
                    action: "deleteModel",
                    nameTag: model_tag,
                }
                jQuery.post("./run.php", pass_post).done(function(data) {
                    if (data == "deleted") {
                        jQuery("#load-list-pannel .list-group")
                            .find(".active")
                            .fadeOut()
                    }
                })
            }
        } else {
            alert("Select a saved model before deleting it.")
        }
    })
    //save functionality
    $li_save.click(function() {
        if (jQuery("#load-list-pannel .list-group").find(".active").length > 0) {
            var act_list = jQuery("#load-list-pannel .list-group").find(".active")
            var model_tag = act_list.find("h6").html()
            var intermidiate = model_tag.split("-").slice(1)

            var small_tag = intermidiate.join("-")
            if (!model_tag.includes(user_name)) {
                alert(
                    "You don't have the permission to modify this model. Try to save it as a new model."
                )
                return
            }
            var pass_post = {
                sharing_status: model_tag.includes("[Public]") ? "public" : "private",
                action: "saveModel",
                json_code: JSON.stringify(json),
                nameTag: small_tag,
            }
            jQuery.post("./run.php", pass_post).done(function(data) {
                update_load_list_pannel()
            })
        } else {
            alert("Select a saved model before overwriting it.")
        }
    })
    //load functionality
    $li_download.click(function() {
        if(random == ""){
            alert("Please run a new model or select a saved model first.");
            $li_download
                .find("button")
                .html('<i class="fas fa-download"></i>')
            return false;
        }
        $li_download
            .find("button")
            .html('<i class="fas fa-spinner fa-spin" style="font-size:24px"></i>')
        var zip = new JSZip()
        var stat = zip.folder("statistics")
        var data_folder = zip.folder("data")
        var plot = zip.folder("plots")
        //data usage agreement
        var current_time = "Download time: " + moment().format()
        var current_url = "Download url: " + window.location.href
        var current_complete_agreement = [
            current_time,
            current_url,
            agreenment_text,
        ].join("\n")
        var current_dua = new Blob([current_complete_agreement], {
            type: "plain/text",
        })
        zip.file("dataUsageAgreement.txt", current_dua)
        var cssList = []
        for (i = 0; i < document.styleSheets.length; i++) {
            if (document.styleSheets[i].cssRules)
                for (j = 0; j < document.styleSheets[i].cssRules.length; j++) {
                    cssList.push(document.styleSheets[i].cssRules[j].cssText)
                }
        }
        //stat
        var bl = new Blob(
            [
                "<style>" + cssList.join("") + "</style>" + $(".content").html(),
                $("#scatter").html(),
            ],
            {
                type: "text/html",
            }
        )
        stat.file("model.html", bl)
        //plot data
        var scatter_output_json_string = JSON.stringify(scatter_output_json)
        var bl = new Blob([scatter_output_json_string], {
            type: "application/json",
        })
        plot.file("plot.json", bl)
        var line_output_json_string = JSON.stringify(line_output_json)
        var bl = new Blob([line_output_json_string], {
            type: "application/json",
        })
        plot.file("line.json", bl)
        var statistics_output_json_string = JSON.stringify(statistics_output_json)
        var bl = new Blob([statistics_output_json], {
            type: "application/json",
        })
        stat.file("stat.json", bl)
        var htmlsvg = ""
        var plot_id = ""

        function createSVG(resolve, reject) {
            if (d3.select("." + plot_id)[0][0]) {
                svgAsDataUri(d3.select("." + plot_id).node(), {}, function(uri) {
                    htmlsvg = dataURItoBlob(uri)
                    plot.file(plot_id + ".svg", htmlsvg)
                    resolve(plot_id)
                })
            } else {
                resolve(plot_id)
            }
        }
        var p1 = Promise.resolve("foo")
            .then(function() {})
            .then(function() {
                plot_id = "plot-1"
                return new Promise(createSVG)
            })
            .then(function() {
                plot_id = "plot-2"
                return new Promise(createSVG)
            })
            .then(function() {
                plot_id = "plot-3"
                return new Promise(createSVG)
            })
            .then(function() {
                plot_id = "plot-4"
                return new Promise(createSVG)
            })
            .then(function() {
                plot_id = "plot-5"
                return new Promise(createSVG)
            })
            .then(function() {
                plot_id = "plot-6"
                return new Promise(createSVG)
            })
            .then(function() {
                var pass_post = {
                    action: "getDownloadList",
                    code: random,
                }
                var dataDownloadList = {}
                /*
                    //A more clean structure for chain promise 
        $.when(
                $.ajax("/first/call"),
            $.ajax("/second/call"),
            $.ajax("/third/call")
            )
            */
                jQuery
                    .post("./run.php", pass_post)
                    .done(function(data) {
                        dataDownloadList = JSON.parse(data)
                    })
                    .then(function() {
                        return $.getJSON(dataDownloadList["data"], function(tunnel) {
                            var bl = new Blob([JSON.stringify(tunnel)], {
                                type: "application/json",
                            })
                            data_folder.file("data.json", bl)
                        })
                    })
                    .then(function() {
                        return $.get(dataDownloadList["r-code"], function(tunnel) {
                            var bl = new Blob([tunnel], {
                                type: "plain/text",
                            })
                            data_folder.file("gamm4.R", bl)
                        })
                    })
                    .then(function() {
                        return $.ajax({
                            url: "../../NDA_Data_Use_Certification_NoSignatures.pdf",
                            dataType: "binary",
                            success: function(tunnel) {
                                bl = new Blob([tunnel], {
                                    type: "application/pdf",
                                })
                                zip.file("NDA_Data_Use_Certification_NoSignatures.pdf", bl)
                            },
                        })
                    })
                    .then(function() {
                        //model specification
                        var jsonse = JSON.stringify(json)
                        var bl = new Blob([jsonse], {
                            type: "application/json",
                        })
                        zip.file("model_specification.json", bl)

                        zip
                            .generateAsync({
                                type: "blob",
                            })
                            .then(function(content) {
                                // see FileSaver.js
                                saveAs(content, "GAMM4.zip")

                                $li_download
                                    .find("button")
                                    .html('<i class="fas fa-download"></i>')
                            })
                    })
            })

        /*
    var deferred = $.Deferred();
        deferred
            .then(
        svgAsDataUri(d3.select('.plot-3').node(), {}, function(uri) {
                    htmlsvg = dataURItoBlob(uri);
                    plot.file("hist1.svg",htmlsvg);
        })
        ).then(function() {
                svgAsDataUri(d3.select('.plot-0').node(), {}, function(uri) {
                    htmlsvg = dataURItoBlob(uri);
                    plot.file("hist1.svg",htmlsvg);
                });
            }).then(function() {
                svgAsDataUri(d3.select('.plot-1').node(), {}, function(uri) {
                    htmlsvg = dataURItoBlob(uri);
                    plot.file("hist1.svg",htmlsvg);
                });
            }).then(function() {
                svgAsDataUri(d3.select('.plot-2').node(), {}, function(uri) {
                    htmlsvg = dataURItoBlob(uri);
                    plot.file("hist1.svg",htmlsvg);
                });
            }).then(function(){
        //model specification
            var jsonse = JSON.stringify(json);
            var bl = new Blob([jsonse], {type: "application/json"});
        zip.file("model_specification.json",bl);

        zip.generateAsync({type:"blob"})
           .then(function(content) {
        // see FileSaver.js
                       saveAs(content, "example.zip");
           });
        });
        deferred.resolve()

*/
    })
}

function insert_model_save_pannel() {
    var icon = jQuery("#save-model")

    var name = "Save new model:"
    var id = ""
    var div = jQuery("<div>")
    div.attr("class", "form-group").attr("id", "save-pannel")
    //var $p = jQuery("<p>").html("Model save functionality works only after clicking on the submit button:").css("padding", "10").appendTo(div)
    var label = jQuery("<label>")
    label.html(name)
    label.attr("class", "col-sm-8 col-form-label")
    label.css("line-height", 1.1)
    label.css("margin-top", 2)

    var d2 = jQuery('<div class="input-group mb-3 col-sm-12">').css(
        "height",
        "35px"
    )
    var d3 = jQuery('<div class="input-group mb-3 col-sm-12">')
    var derror = jQuery('<div class="input-group mb-3 col-sm-12">').css(
        "color",
        "#B51020"
    )
    var input = jQuery("<input>").attr("placeholder", "model tag")
    input.attr("class", "form-control input-sm")
    var d_append = jQuery('<div class="input-group-append">')

    var public_check = jQuery(
        '<label class="radio-inline col-md-4"><input type="checkbox" name="private" value = "private"> Private </label>'
    )
    //var private_check = jQuery('<label class="radio-inline col-md-4"><input type="radio" name="private" value = "private" checked> Private </label>')

    var d1 = jQuery('<div class="input-group mb-3 col-sm-12">')
    //var comment = jQuery('<textarea class="form-control" rows="4" placeholder = "Description of your model...."  id="comment-save"></textarea>')

    var button = jQuery("<button>")
        .attr("class", "btn-sm btn btn-primary")
        .html('<i class="far fa-save"></i>')
    button.click(function() {
        var input_name_tag = input.val()
        var check_status = public_check.find("input").is(":checked")
            ? "private"
            : "public"

        usercovArray()
        var pass_post = {
            nameTag: input_name_tag,
            sharing_status: check_status,
            action: "saveModel",
            json_code: JSON.stringify(json),
        }
        jQuery.post("./run.php", pass_post).done(function(data) {
            console.log("Nodes processing: " + data)
            console.log(random)
            if (data == "success") {
                derror.html("Model saved")
            } else {
                derror.html(data)
            }
            update_load_list_pannel()
        })
        derror.html("")
    })

    div.append(label)
    //div.append(d1.append(comment));
    d2.append(input)
    d2.append(d_append)
    div.append(public_check)
    d_append.append(button)
    div.append(d2)
    div.append(derror)
    jQuery("#mySidenav").append(div)
}

function insert_update_pannel() {
    var div = jQuery(
        "<div style = 'border-radius: 10px;background: #e6f5ff'><h4>&nbspUpdates:</h4><ul id = 'update-list'></ul><div>"
    )
    jQuery(".content").append(div)
    jQuery("#update-list").append(
        "<li>Add Box-Cox and thresholding transformations</li>"
    )
    jQuery("#update-list").append(
        "<li>Add logistic regression functionality</li>"
    )
    jQuery("#update-list").append("<li>Add better descriptions of options</li>")
    jQuery("#update-list").append("<li>Subset data by factors levels</li>")
}

function get_formula() {
    n_f = getVarNameByID("depvar") + "~" + getVarNameByID("indepvar")
    var cov_list = getVarNameByID("covfixed").filter(function(x) {
        return x != ""
    })
    n_f = cov_list.length > 0 ? n_f + "+" + cov_list.join("+") : n_f
    if (getVarNameByID("covuser") != "") {
        n_f = n_f + "+" + getVarNameByID("covuser")
    }
    if (getVarNameByID("smo.var") && getVarNameByID("smo.var") != "") {
        n_f = n_f + "+" + getVarNameByID("smo.var")
    }
    if (getVarNameByID("log.var") && getVarNameByID("log.var") != "") {
        n_f = n_f + "+" + getVarNameByID("log.var")
    }
    if (getVarNameByID("int.var") && getVarNameByID("int.var") != "") {
        n_f = n_f + "+" + getVarNameByID("int.var")
    }
    if (getVarNameByID("sq.var") && getVarNameByID("sq.var") != "") {
        n_f = n_f + "+" + getVarNameByID("sq.var")
    }
    return n_f
}

function insert_expert_toggle() {
    var div = jQuery("<div>")
    div.attr("class", "form-group")
    var label = jQuery("<label>")
    label.html("Expert Mode (testing and debugging)")
    label.attr("class", " col-md-10 col-form-label span3")
    label.css("line-height", 1.1)
    var d2 = jQuery('<div class="col-sm-12 span9">')
    var input = jQuery("<input>")
    input.attr("type", "checkbox")
    var label_sm = jQuery("<label>").attr("class", "switch")
    var span = jQuery("<span>").attr("class", "slider round")
    div.append(label)
    d2.append(label_sm)

    label_sm.append(input)
    label_sm.append(span)
    div.append(d2)
    jQuery(".content").append(div)
    jQuery(input).on("change", function() {
        if (jQuery("#editor-ace").css("display") == "none") {
            jQuery("#mySidenav-code").css(
                "width",
                Math.max(350, jQuery(window).width() / 2)
            )
            jQuery("#main").css(
                "marginRight",
                Math.max(350, jQuery(window).width() / 2)
            )

            setTimeout(function() {
                editor.setOption("autoScrollEditorIntoView", true)
                jQuery("#editor-ace").show()
            }, 500)
            editor.session.on("change", function() {
                json["nodes"][getExpertNodeNum()][
                    "state"
                ][0].value = editor.getSession().getValue()
            })
            //Ace does not have the functionility to enable AutoScroll if editor is not visible
        } else {
            document.getElementById("mySidenav-code").style.width = "0"
            document.getElementById("main").style.marginRight = "auto"
            jQuery("#editor-ace").fadeOut()
        }

        if (jQuery("#scatter").html() != "") jQuery(window).trigger("resize")
    })
}

function remove_formula_part(part) {
    for (index in json["nodes"]) {
        if (index == "shuffle") continue
        node_state = json["nodes"][index].state
        for (s_n in node_state) {
            if (s_n == "shuffle" || !node_state[s_n]["value"]) continue
            if (node_state[s_n]["value"].indexOf(part) >= 0) {
                //exact match
                if (node_state[s_n]["value"] == part) {
                    node_state[s_n]["value"] = ""
                    console.log(node_state[s_n])
                    continue
                }
                //in the middle
                if (node_state[s_n]["value"].indexOf("+" + part + "+") >= 0) {
                    var index_p = node_state[s_n]["value"].indexOf("+" + part + "+")
                    node_state[s_n]["value"] =
                        node_state[s_n]["value"].slice(0, index_p) +
                        node_state[s_n]["value"].slice(index_p + part.length + 1)
                    console.log(node_state[s_n])
                    continue
                }
                //front
                if (node_state[s_n]["value"].indexOf(part + "+") >= 0) {
                    var index_p = node_state[s_n]["value"].indexOf(part + "+")
                    node_state[s_n]["value"] = node_state[s_n]["value"].slice(
                        index_p + part.length + 1
                    )

                    console.log(node_state[s_n])
                    continue
                }
                //end
                if (node_state[s_n]["value"].indexOf("+" + part) >= 0) {
                    var index_p = node_state[s_n]["value"].indexOf(part + "+")
                    node_state[s_n]["value"] =
                        node_state[s_n]["value"].slice(0, index_p) +
                        node_state[s_n]["value"].slice(index_p + part.length + 1)
                    console.log(node_state[s_n])
                    continue
                }
            }
        }
        jQuery("#formula").html(get_formula())
    }
}

function insert_mutiple_input(item_input, isIndpv) {
    var class_type = item_input.id
    var name = ""
    var id = ""
    var default_value = ""
    for (index in item_input.state) {
        state = item_input.state[index]
        if (state.name == "name") {
            name = state.value
        }
        if (state.name == "id") {
            id = state.value
        }
        if (state.name == "value") {
            default_value = state.value
        }
    }

    var div = jQuery("<div>")
    div.attr("class", "input-group")
    var label = jQuery("<label>")
    label.html(name)
    label.attr("for", class_type + "-" + id)
    label.attr("class", "col-md-10 col-form-label span3 control-label")
    label.css("line-height", 1.1)
    var d2 = jQuery("<div class='col-sm-12 row row-fluid input-group'>")
    var input = jQuery("<div>")
    input.attr("id", class_type + "-" + id)
    input.attr("class", "input-block-level form-control col-lg-10")
    input.attr("contenteditable", "true")
    input.attr(
        "style",
        "width: 100%; background-color: rgb(255, 255, 255); border: 1px solid #aaa;;"
    )
    input.val(default_value)

    d2.append(input)

    var om_button = jQuery(
        "<div class='input-group-append'><button class='btn-sm btn btn-outline-secondary' data-toggle='modal' data-target='#ontology-explore' type='button' style = {border-top-right-radius:3px !important; border-top-right-radius:3px !important}><i class='fas fa-plus' style='font-size: 1rem; padding-bottom: 0px; margin-bottom: 0px; transform: scale(1.5,1.5);'></i></button></div>"
    ).appendTo(d2)
    om_button.click(function() {
        jQuery(".explore-add").attr("data-go-to", class_type + "-" + id)
        jQuery(".explore-add").attr("isIndpv", isIndpv)
        jQuery("#search").val(getVarNameByID(id))
        jQuery("#search").trigger("keyup")
    })
    /*
    var list = jQuery("<ul class='list-unstyled floating-entry'></ul>").appendTo(
        $("#floating-list")
    )
    */

    var list = jQuery(".floating-entry");

    var au = input.autocomplete({
        //source:analysis_names,
        minLength: 3,
        delay: 500,
        source: function(request, response) {
            var content = extractLast(request.term).split("\n")[
                extractLast(request.term).split("\n").length - 1
            ]
            if (
                input
                .children()
                .contents()
                .last()[0] &&
                input
                .children()
                .contents()
                .last()[0].textContent == "+"
            ) {
                return
            }
            if (content.length >= 3) {
                response(
                    jQuery.ui.autocomplete.filter(analysis_names, content).slice(0, 100),
                    content
                )
            }
        },

        select: function(event, ui) {
            //var terms = jQuery(this).html().split("+");
            if (
                jQuery(this)
                .find(".last-remove")
                .html()
            ) {
                jQuery(this)
                    .find(".last-remove")
                    .remove()
                if (!isIndpv) {
                    jQuery(this).append("+")
                }
            } else {
                jQuery(this).html("")
            }
            //terms.push("<span style='background-color:pink;'>"+ui.item.value+"</span>");
            var span_list = add_span_list(ui.item.value, list, id)

            jQuery(this).append(span_list)
            if (!isIndpv) {
                jQuery(this).append(
                    "<span class='last-remove' creatDeap = 'true'  readonly>+</span>"
                )
                //move the caret to the end of input
                var el = input.last()[0]
                var range = document.createRange()
                var sel = window.getSelection()
                range.setStart(el.childNodes[el.childNodes.length - 1], 1)
                range.collapse(true)
                sel.removeAllRanges()
                sel.addRange(range)
            } else {
                //move the caret to the end of input
                var el = span_list[0]
                var range = document.createRange()
                var sel = window.getSelection()
                range.setStart(
                    el.childNodes[el.childNodes.length - 1],
                    ui.item.value.length
                )
                range.collapse(true)
                sel.removeAllRanges()
                sel.addRange(range)
            }
            console.log(input.attr("id"))
            for (index in item_input.state) {
                state = item_input.state[index]
                if (state.name == "value") {
                    usercovArray()
                    console.log("JSON has been updated.")
                    console.log(state)
                    jQuery("#formula").html(get_formula())
                }
            }

            return false
        },
        focus: function() {
            return false
        },
        search: function(event, ui) {
            var content = jQuery(event.currentTarget).html()
        },
    })
    au.data("ui-autocomplete")._renderItem = function(ul, item) {
        return $("<li></li>")
            .data("item.autocomplete", item)
            .append("<div>" + item.label + "</div>")
            .appendTo(ul)
    }

    input.keyup(function() {
        usercovArray()
    })
    input.on("focusout click", function() {
        pasteValParser()
        usercovArray()
    })
    jQuery(".explore-add").click(function() {
        var au_id = jQuery(this)
            .attr("data-go-to")
            .split("-")[
                jQuery(this)
                .attr("data-go-to")
                .split("-").length - 1
            ]
        var au = jQuery("#" + jQuery(this).attr("data-go-to"))
        var isIndpv = jQuery(this).attr("isIndpv") == "true" ? true : false
        var au_list = $($(".floating-menu").find("ul")[0])
        //au = om_button.parent().find(".input-block-level");
        console.log(au.html())
        jQuery.each(
            jQuery(".ui-dialog-buttonpane").find(".variable-button-tag"),
            function(key, value) {
                console.log(jQuery(value).attr("value"))
                var tag_id = jQuery(value).attr("value")
                var span_list = add_span_list(tag_id, au_list, id)
                if (isIndpv) {
                    au.html("")
                }
                au.append(span_list)
                if (!isIndpv) {
                    au.append(
                        "<span class='last-remove' creatdeap = 'true' readonly>+</span>"
                    )
                }
            }
        )
        jQuery(".ui-dialog-buttonpane")
            .find(".variable-button-tag")
            .remove()
        jQuery(".modal-xl .modal-content .modal-header .close").trigger("click")
    })
    /*
    input.focus(function(){ 
    console.log("focused");
    setTimeout(function(){
        //jQuery("body").append(om);
        var om_button = jQuery("<button class = 'Ontology-button btn btn-primary col-lg-1'>E</button>");
        d2.append(om_button);
        om_button.button().on( "click", function() {
        om.dialog('option', 'buttons', {
                Add: function() {
            console.log(id);
                    jQuery(this).dialog('close');
            jQuery.each(jQuery(".ui-dialog-buttonpane").find(".variable-button-tag"), function(key,value){
                        console.log(jQuery(value).attr("value"));
                var tag_id = jQuery(value).attr("value");
                var span_list= add_span_list(tag_id,list,id);
                if(isIndpv){
                au.html("");
                }
                au.append(span_list);
                    if(!isIndpv){
                     au.append("<span class='last-remove' readonly>+</span>");
                }
                });
            jQuery(".ui-dialog-buttonpane").find(".variable-button-tag").remove();;
                    }
        });
            om.dialog( "open" );
        ontology_lisener();
            });
    },200);
    });

    input.focusout(function(){ 
        console.log("focused");
        setTimeout(function(){
        d2.find(".Ontology-button").remove();
    },200)
    }); 
    */

        div.append(label)
        div.append(d2)
        jQuery(".content").append(div)
        if (default_value != "") {
            var default_value_list = default_value.split("+")

            for (var list_key = 0; list_key < default_value_list.length; list_key++) {
                default_value_temp = default_value_list[list_key]
                if (default_value_temp == "") continue
                //au.html(default_value).data('autocomplete')._trigger('select');
                var span_list = add_span_list(default_value_temp, list, id)
                au.append(span_list)
                if (!isIndpv) au.append("<span class='last-remove' readonly>+</span>")
            }
        }
}

function pasteValParser() {
    //covuser
    var indepvar_content = jQuery("#measure-all-multi-covuser").text()
    ul_list = $($(".floating-menu").find("ul")[0])
    if (indepvar_content.length > 0) {
        if (
            jQuery("#measure-all-multi-covuser").find("[creatdeap!=true]").length > 0
        ) {
            if (
                jQuery("#measure-all-multi-covuser")
                .find("[creatdeap!=true]")
                .text()
                .indexOf("+") >= 0
            ) {
                var content = jQuery("#measure-all-multi-covuser")
                    .find("[creatdeap!=true]")
                    .text()
                jQuery("#measure-all-multi-covuser")
                    .find("[creatdeap!=true]")
                    .remove()
                var c_arr = content.split("+")
                for (i in c_arr) {
                    var item = c_arr[i].trim()
                    if (item == "") continue
                    //jQuery("#measure-all-multi-covuser").append(add_span_list(item,jQuery("#measure-all-multi-covuser").parent().find("ul"),"covuser"));
                    jQuery("#measure-all-multi-covuser").append(
                        add_span_list(item, ul_list, "covuser")
                    )
                    jQuery("#measure-all-multi-covuser").append(
                        "<span class='last-remove' creatdeap='true' readonly>+</span>"
                    )
                }
            } else {
                var content = jQuery("#measure-all-multi-covuser")
                    .find("[creatdeap!=true]")
                    .find("span")
                    .text()
                jQuery("#measure-all-multi-covuser")
                    .find("[creatdeap!=true]")
                    .remove()
                var item = content
                if (item.split("\n").length > 1)
                    item = item.split("\n")[item.split("\n").length - 1]
                if (item != "") {
                    jQuery("#measure-all-multi-covuser").append(
                        add_span_list(item, ul_list, "covuser")
                    )
                    jQuery("#measure-all-multi-covuser").append(
                        "<span class='last-remove' creatdeap='true' readonly>+</span>"
                    )
                }
            }
        } else {
            if (jQuery("#measure-all-multi-covuser").find("span").length == 0) {
                var content = jQuery("#measure-all-multi-covuser").text()
                if (content.indexOf("+") < 0) content = content + "+"
                jQuery("#measure-all-multi-covuser").html("")
                var c_arr = content.split("+")
                for (i in c_arr) {
                    var item = c_arr[i].trim()
                    if (item == "") continue
                    jQuery("#measure-all-multi-covuser").append(
                        add_span_list(item, ul_list, "covuser")
                    )
                    jQuery("#measure-all-multi-covuser").append(
                        "<span class='last-remove' creatdeap='true' readonly>+</span>"
                    )
                }
            }
        }
    }

    //indepvar
    var indepvar_content = jQuery("#measure-single-indepvar").text()
    if (indepvar_content.length > 0) {
        if (
            jQuery("#measure-single-indepvar").find("[creatdeap!=true]").length > 0
        ) {
            if (
                jQuery("#measure-single-indepvar")
                .find("[creatdeap!=true]")
                .text().length >= 0
            ) {
                var content = jQuery("#measure-single-indepvar")
                    .find("[creatdeap!=true]")
                    .text()
                jQuery("#measure-single-indepvar")
                    .find("[creatdeap!=true]")
                    .remove()
                var item = content.trim()
                if (item != "")
                    jQuery("#measure-single-indepvar").append(
                        add_span_list(item, ul_list, "indepvar")
                    )
            }
        } else {
            if (jQuery("#measure-single-indepvar").find("span").length == 0) {
                var content = jQuery("#measure-single-indepvar").text()
                jQuery("#measure-single-indepvar").html("")
                var item = content.trim()
                if (item != "")
                    jQuery("#measure-single-indepvar").append(
                        add_span_list(item, ul_list, "indepvar")
                    )
            } else {
                var content = jQuery("#measure-single-indepvar")
                    .find("span")
                    .text()
                if (
                    get_original(content) !=
                    jQuery("#measure-single-indepvar")
                    .find("span")
                    .attr("truevalue")
                ) {
                    jQuery("#measure-single-indepvar")
                        .find("span")
                        .remove()
                    jQuery("#measure-single-indepvar").append(
                        add_span_list(get_original(content), ul_list, "indepvar")
                    )
                }
            }
        }
    }

    //depvar
    var indepvar_content = jQuery("#measure-single-depvar").text()
    if (indepvar_content.length > 0) {
        if (jQuery("#measure-single-depvar").find("[creatdeap!=true]").length > 0) {
            if (
                jQuery("#measure-single-depvar")
                .find("[creatdeap!=true]")
                .text().length >= 0
            ) {
                var content = jQuery("#measure-single-depvar")
                    .find("[creatdeap!=true]")
                    .text()
                jQuery("#measure-single-depvar")
                    .find("[creatdeap!=true]")
                    .remove()
                var item = content.trim()
                if (item != "")
                    jQuery("#measure-single-depvar").append(
                        add_span_list(item, ul_list, "depvar")
                    )
            }
        } else {
            if (jQuery("#measure-single-depvar").find("span").length == 0) {
                var content = jQuery("#measure-single-depvar").text()
                jQuery("#measure-single-depvar").html("")
                var item = content.trim()
                if (item != "")
                    jQuery("#measure-single-depvar").append(
                        add_span_list(item, ul_list, "depvar")
                    )
            } else {
                var content = jQuery("#measure-single-depvar")
                    .find("span")
                    .text()
                if (
                    get_original(content) !=
                    jQuery("#measure-single-depvar")
                    .find("span")
                    .attr("truevalue")
                ) {
                    jQuery("#measure-single-depvar")
                        .find("span")
                        .remove()
                    jQuery("#measure-single-depvar").append(
                        add_span_list(get_original(content), ul_list, "indepvar")
                    )
                }
            }
        }
    }
}

function add_span_list(default_value, list, id) {
    var original_id = get_original(default_value)
    var class_name_original_id = original_id.split(".").join("__DOT__")
    if (id == "depvar") {
        if (getVarNameByID("ws.var")) {
            if (getVarNameByID("ws.var").includes(original_id)) {
                default_value
                    ? (default_value = default_value.replace(
                        original_id,
                        "Censor(" + original_id + ")"
                    ))
                    : (default_value = "Censor(" + original_id + ")")
            }
        }
    }
    if (id == "indepvar") {
        if (getVarNameByID("smo.var")) {
            if (getVarNameByID("smo.var").includes(original_id)) {
                default_value = "s(" + original_id + ")"
            }
        } else if (getVarNameByID("log.var")) {
            if (getVarNameByID("log.var").includes(original_id)) {
                default_value = "log(" + original_id + ")"
            }
        } else if (getVarNameByID("sq.var")) {
            if (getVarNameByID("sq.var").includes(original_id)) {
                default_value = original_id + "^2"
            }
        }

        if (getVarNameByID("ws.var")) {
            if (getVarNameByID("ws.var").includes(original_id)) {
                default_value
                    ? (default_value = default_value.replace(
                        original_id,
                        "Censor(" + original_id + ")"
                    ))
                    : (default_value = "Censor(" + original_id + ")")
            }
        }
    }
    if (id == "covuser") {
        if (getVarNameByID("smo.var")) {
            if (getVarNameByID("smo.var").includes(original_id)) {
                for (var smo_v in getVarNameByID("smo.var").split("+")) {
                    if (
                        getVarNameByID("smo.var")
                        .split("+")
                        [smo_v].includes(original_id)
                    )
                        default_value = getVarNameByID("smo.var").split("+")[smo_v]
                }
            }
        } else if (getVarNameByID("log.var")) {
            if (getVarNameByID("log.var").includes(original_id)) {
                for (var smo_v in getVarNameByID("log.var").split("+")) {
                    if (
                        getVarNameByID("log.var")
                        .split("+")
                        [smo_v].includes(original_id)
                    )
                        default_value = getVarNameByID("log.var").split("+")[smo_v]
                }
            }
        } else if (getVarNameByID("sq.var")) {
            if (getVarNameByID("sq.var").includes(original_id)) {
                for (var smo_v in getVarNameByID("sq.var").split("+")) {
                    if (
                        getVarNameByID("sq.var")
                        .split("+")
                        [smo_v].includes(original_id)
                    )
                        default_value = getVarNameByID("sq.var").split("+")[smo_v]
                }
            }
        } else if (getVarNameByID("int.var")) {
            if (getVarNameByID("int.var").includes(original_id)) {
                for (var smo_v in getVarNameByID("int.var").split("+")) {
                    if (
                        getVarNameByID("int.var")
                        .split("+")
                        [smo_v].includes(original_id)
                    )
                        default_value = getVarNameByID("int.var").split("+")[smo_v]
                }
            }
        }
        if (getVarNameByID("ws.var")) {
            if (getVarNameByID("ws.var").includes(original_id)) {
                default_value
                    ? (default_value = default_value.replace(
                        original_id,
                        "Censor(" + original_id + ")"
                    ))
                    : (default_value = "Censor(" + original_id + ")")
            }
        }
    }
    var span_list = jQuery(
        "<span class= '" +
        class_name_original_id +
        "-" +
        id +
        "-tag' creatDeap = 'true' truevalue = '" +
        original_id +
        "' contenteditable='true' readonly >" +
        default_value +
        "</span>"
    )
    span_list.on("click", function() {
        console.log(original_id)
        if (span_list.css("background-color") != "rgb(144, 238, 144)") {
            span_list.css("background-color", "rgb(144, 238, 144)")
            if (!list.find("." + id + "-" + class_name_original_id).html()) {
                list.append(creatVar(default_value, id), false)
            } else {
                list.find("." + id + "-" + class_name_original_id + "-wrapper").show()
                list
                    .find("." + id + "-" + class_name_original_id + "-wrapper")
                    .attr("hiding-list", false)
                document
                    .getElementsByClassName(
                        id + "-" + class_name_original_id + "-wrapper"
                    )[0]
                    .scrollIntoView({
                        behavior: "smooth",
                        block: "end",
                    })
            }
        } else {
            span_list.css("background-color", "rgb(255,255,255)")
            list.find("." + id + "-" + class_name_original_id + "-wrapper").fadeOut()
            list
                .find("." + id + "-" + class_name_original_id + "-wrapper")
                .attr("hiding-list", true)
        }
    })
    return span_list
}

function split(val) {
    //return val.split(/\+\s*/);
    return val.split(/\+|\*/)
}

function extractLast(term) {
    var list = split(term)
    var pop = list.pop()
    var rt = pop == "" ? list.pop() : pop

    return rt.trim()
}

function insertSmooth(list, val) {
    list.splice(0, 0, "s(" + val + ")")
    return list
}

function get_original(value) {
    var left_char_l = ["("]
    var right_char_r = ["^", ")", ","]
    var left_max = 0
    var right_min = value.length
    for (var i = 0; i < value.length; i++) {
        var t = value.charAt(i) + ""
        if (left_char_l.includes(t) && i > left_max) left_max = i
        if (right_char_r.includes(t) && i < right_min) right_min = i
    }
    return left_max == 0
        ? value.substring(0, right_min)
        : value.substring(left_max + 1, right_min)
}

function usercovArray() {
    var rt = [],
        sl = [],
        ll = [],
        sql = [],
        ws = []
    il = []
    // covuser
    jQuery.each(jQuery("#measure-all-multi-covuser").find("span"), function(
        index,
        ele
    ) {
        //assuming we can only have one way of transformation in the appliation
        //TODO: Upgrade the parser to allow conbination of different transformation.
        var original = jQuery(ele)
            .attr("class")
            .split("-")[0]
            .split("__DOT__")
            .join(".")
        var c_format = "Censor(" + original + ")"
        if (
            jQuery(ele)
            .html()
            .indexOf("s(") >= 0
        ) {
            sl.push(
                jQuery(ele)
                .html()
                .replace(c_format, original)
            )
        } else if (
            jQuery(ele)
            .html()
            .indexOf("log(") >= 0
        ) {
            ll.push(
                jQuery(ele)
                .html()
                .replace(c_format, original)
            )
        } else if (
            jQuery(ele)
            .html()
            .indexOf("*") >= 0
        ) {
            il.push(
                jQuery(ele)
                .html()
                .replace(c_format, original)
            )
        } else if (
            jQuery(ele)
            .html()
            .indexOf("^") >= 0
        ) {
            sql.push(
                jQuery(ele)
                .html()
                .replace(c_format, original)
            )
        }

        if (
            !(
                jQuery(ele)
                .html()
                .indexOf("+") >= 0
            )
        ) {
            rt.push(get_original(jQuery(ele).html()))
        }

        if (
            jQuery(ele)
            .html()
            .indexOf("Censor") >= 0
        ) {
            ws.push(original)
        }
    })
    setVarByID("covuser", rt.join("+"))
    // depvar

    rt = []
    jQuery.each(jQuery("#measure-single-depvar").find("span"), function(
        index,
        ele
    ) {
        var original = jQuery(ele)
            .attr("class")
            .split("-")[0]
            .split("__DOT__")
            .join(".")
        var c_format = "Censor(" + original + ")"
        if (
            jQuery(ele)
            .html()
            .indexOf("Censor") >= 0
        ) {
            ws.push(original)
        }
        rt.push(
            jQuery(ele)
            .html()
            .replace(c_format, original)
        )
    })
    setVarByID("depvar", rt.length == 0 ? "" : rt[0])

    rt = []
    jQuery.each(jQuery("#measure-single-indepvar").find("span"), function(
        index,
        ele
    ) {
        var original = jQuery(ele)
            .attr("class")
            .split("-")[0]
            .split("__DOT__")
            .join(".")
        var c_format = "Censor(" + original + ")"
        if (
            jQuery(ele)
            .html()
            .indexOf("s(") >= 0
        ) {
            sl.push(
                jQuery(ele)
                .html()
                .replace(c_format, original)
            )
        } else if (
            jQuery(ele)
            .html()
            .indexOf("log(") >= 0
        ) {
            ll.push(
                jQuery(ele)
                .html()
                .replace(c_format, original)
            )
        } else if (
            jQuery(ele)
            .html()
            .indexOf("*") >= 0
        ) {
            il.push(
                jQuery(ele)
                .html()
                .replace(c_format, original)
            )
        } else if (
            jQuery(ele)
            .html()
            .indexOf("^") >= 0
        ) {
            sql.push(
                jQuery(ele)
                .html()
                .replace(c_format, original)
            )
        }

        if (
            jQuery(ele)
            .html()
            .indexOf("Censor") >= 0
        ) {
            ws.push(original)
        }
        //May goes wrong since name and the id tag is not always the same
        rt.push(original)
    })

    setVarByID("indepvar", rt.length == 0 ? "" : rt[0])
    setVarByID("smo.var", sl.join("+"))
    setVarByID("sq.var", sql.join("+"))
    setVarByID("log.var", ll.join("+"))
    setVarByID("int.var", il.join("+"))
    setVarByID("ws.var", ws.join("+"))
    jQuery("#formula").html(get_formula())

    return rt
}
//mobile check
window.mobileAndTabletcheck = function() {
    var check = false
    ;(function(a) {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
                a
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                a.substr(0, 4)
            )
        )
            check = true
    })(navigator.userAgent || navigator.vendor || window.opera)
    return check
}
//return a div element contains the user defined value
function creatVar(value, input_id) {
    var act_v = get_original(value)
    var act_name_tag = act_v.split(".").join("__DOT__")
    var $a = jQuery(
        "<div class = '" +
        input_id +
        "-" +
        act_name_tag +
        "-wrapper" +
        " row row-fluid' style= 'background-color: white;position:relative'></div>"
    )
    //.css("padding-left","1em");
    //.css("background-color","#e9ecef");
    var name = jQuery(
        "<input readonly class='col-sm-12 v-val main-input form-control input-xs'></input>"
    )
        .css("font-size", "0.9rem")
        .css("color", "white")
        .css("padding-left", "20px")
        .css("border-color", "#4885ed")
        .css("border-radius", "2px")
        .css("background-color", "#4885ed")
        .css("margin", "0px")
        .val(value)
    //#4d4d4d
    name.appendTo($a)
    // smooth transformation

    $div_button = jQuery(
        "<div class = '" +
        input_id +
        "-" +
        act_name_tag +
        " col-md-12 transformation-group' style = 'padding-left:5px; padding-right:5px'></div>"
    )
    /*
    jQuery('<b style="font-size: 0.6rem;">Transformations: </b>').appendTo(
        $div_button
    )
    */
    if (input_id != "depvar")
        jQuery("<button class='v-s-button btn-sm btn-default btn col-md-12'></button>")
            .text("Smooth transformation")
            .css("background-color", "lightgrey")
            .css("margin-left", "1px")
            .on("click", function() {
                name.val("s(" + act_v + ")")
                jQuery(this)
                    .parent()
                    .find("button")
                    .css("background-color", "lightgrey")
                jQuery(this).css("background-color", "lightgreen")
                jQuery("." + act_name_tag + "-" + input_id + "-tag").html(
                    "s(" + act_v + ")"
                )
                jQuery(this)
                    .parent()
                    .find(".v-interaction-button")
                    .text("by")

                //enable the interaction after do the square transformation
                jQuery(this)
                    .parent()
                    .find(".v-interaction-button")
                    .removeAttr("disabled")
                jQuery(this)
                    .parent()
                    .find(".v-interaction-button")
                    .css("background-color", "lightgrey")
                usercovArray(act_v)
                vinfo_hist(act_v, act_name_tag, [], input_id)
            })
            .appendTo($div_button)

    // log transformation
    jQuery("<button class='v-log-button btn-sm btn-default btn col-md-12'></button>")
        .text("Log transformation")
        .css("margin-left", "1px")
        .css("background-color", "lightgrey")
        .on("click", function() {
            name.val("log(" + act_v + ")")
            jQuery(this)
                .parent()
                .find("button")
                .css("background-color", "lightgrey")
            if (
                jQuery(this)
                .parent()
                .find(".v-interaction-button")
                .text() == "by"
            )
                jQuery(this)
                    .parent()
                    .find(".v-interaction-button")
                    .text("*")
            //disable the interaction after do the log transformation
            jQuery(this)
                .parent()
                .find(".v-interaction-button")
                .attr("disabled", "true")
            jQuery(this)
                .parent()
                .find(".interaction-input")
                .remove()
            jQuery(this)
                .parent()
                .find(".v-interaction-button")
                .css("background-color", "lightgrey")
            jQuery(this).css("background-color", "lightgreen")
            jQuery("." + act_name_tag + "-" + input_id + "-tag").html(
                "log(" + act_v + ")"
            )
            usercovArray()
            vinfo_hist(act_v, act_name_tag, ["log"], input_id)
        })
        .appendTo($div_button)

    // interaction transformation
    if (input_id != "depvar" && input_id != "indepvar")
        jQuery(
            "<button class='v-interaction-button btn-sm btn-default btn col-md-12'></button>"
        )
            .text("interaction")
            .css("margin-left", "1px")
            .css("background-color", "lightgrey")
            .on("click", function() {
                if (
                    jQuery(this)
                    .parent()
                    .find(".interaction-input").length == 0
                ) {
                    var input = jQuery("<input>").attr("class", "v-val interaction-input")
                    input.attr("placeholder", "Interaction terms")
                    input.autocomplete({
                        minLength: 3,
                        delay: 500,
                        source: analysis_names,
                        change: function() {
                            yvalueChanged(input)
                        },
                        select: function(event, ui) {
                            if (
                                jQuery(this)
                                .parent()
                                .find(".v-interaction-button")
                                .text() == "interaction"
                            ) {
                                name.val(name.val() + "*" + ui.item.value)
                                jQuery("." + act_name_tag + "-" + input_id + "-tag").html(
                                    jQuery("." + act_name_tag + "-" + input_id + "-tag").html() +
                                    "*" +
                                    ui.item.value
                                )
                            } else if (
                                jQuery(this)
                                .parent()
                                .find(".v-interaction-button")
                                .text() == "by"
                            ) {
                                name.val("s(" + value + ", by = " + ui.item.value + ")")
                                jQuery("." + act_name_tag + "-" + input_id + "-tag")
                                    .html("s(" + value + ", by = " + ui.item.value + ")")
                                    .css(
                                        "width",
                                        ("s(" + value + ", by = " + ui.item.value + ")").length *
                                        2 +
                                        "px"
                                    )
                            }
                            input.remove()
                            usercovArray()
                        },
                    })
                    input.insertAfter(
                        jQuery(this)
                        .parent()
                        .find(".v-interaction-button")
                    )
                    input.focus()
                } else {
                    jQuery(this)
                        .parent()
                        .find(".interaction-input")
                        .remove()
                }
                /*
            name.val(act_v+"*");
            jQuery(this).parent().find("button").css("background-color","white");
            jQuery(this).css("background-color","lightgreen");
            jQuery("."+act_v+"-tag").html(act_v+"*");
            */
                vinfo_hist(act_v, act_name_tag, [], input_id)
            })
            .appendTo($div_button)

    //square transformation
    if (input_id != "depvar")
        jQuery("<button class='v-square-button btn-sm btn-default btn col-md-12'></button>")
            .text("square transformation")
            .css("margin-left", "1px")
            .css("background-color", "lightgrey")
            .on("click", function() {
                name.val(act_v + "^2")
                jQuery(this)
                    .parent()
                    .find("button")
                    .css("background-color", "lightgrey")
                jQuery(this).css("background-color", "lightgreen")
                jQuery("." + act_name_tag + "-" + input_id + "-tag").html(act_v + "^2")
                //disable the interaction after do the square transformation
                jQuery(this)
                    .parent()
                    .find(".v-interaction-button")
                    .attr("disabled", "true")
                jQuery(this)
                    .parent()
                    .find(".interaction-input")
                    .remove()
                jQuery(this)
                    .parent()
                    .find(".v-interaction-button")
                    .css("background-color", "lightgrey")
                if (
                    jQuery(this)
                    .parent()
                    .find(".v-interaction-button")
                    .text() == "by"
                )
                    jQuery(this)
                        .parent()
                        .find(".v-interaction-button")
                        .text("interaction")
                usercovArray()
                /*
            name.val(act_v+"*");
            jQuery(this).parent().find("button").css("background-color","white");
            jQuery(this).css("background-color","lightgreen");
            jQuery("."+act_v+"-tag").html(act_v+"*");
            */
                vinfo_hist(act_v, act_name_tag, ["squared"], input_id)
            })
            .appendTo($div_button)

    //Censoring

    jQuery("<button class='v-ws-button btn-sm btn-default btn col-md-12'></button>")
        .text("Censor")
        .css("margin-left", "1px")
        .css("background-color", "lightgrey")
        .on("click", function() {
            //jQuery(this).parent().find("button").css("background-color","white");
            jQuery(this).css("background-color", "lightgreen")
            jQuery("." + act_name_tag + "-" + input_id + "-tag").attr("censor", "T")
            var temp = jQuery("." + act_name_tag + "-" + input_id + "-tag").html()
            if (!temp.includes("Censor")) {
                jQuery("." + act_name_tag + "-" + input_id + "-tag").html(
                    temp.split(act_v).join("Censor(" + act_v + ")")
                )
                name.val(temp.split(act_v).join("Censor(" + act_v + ")"))
            }
            usercovArray()
            var trans_arr = ["censor005"]
            if (
                jQuery(this)
                .parent()
                .find(".v-log-button")
                .css("background-color") == "rgb(144, 238, 144)"
            ) {
                trans_arr.push("log")
            }

            vinfo_hist(act_v, act_name_tag, trans_arr, input_id)
        })
        .appendTo($div_button)
    jQuery("<button class='reset-button btn-sm btn-default btn col-md-12'></button>")
        .text("reset")
        .css("margin-left", "1px")
        .css("background-color", "lightgrey")
        .on("click", function() {
            name.val(act_v)
            jQuery(this)
                .parent()
                .find("button")
                .css("background-color", "lightgrey")
            jQuery("." + act_name_tag + "-" + input_id + "-tag").html(act_v)
            //enable the interaction after do the square transformation
            jQuery(this)
                .parent()
                .find(".interaction-input")
                .remove()
            jQuery(this)
                .parent()
                .find(".v-interaction-button")
                .css("background-color", "lightgrey")
            jQuery(this)
                .parent()
                .find(".v-interaction-button")
                .removeAttr("disabled")
            jQuery(this)
                .parent()
                .find(".v-interaction-button")
                .text("interaction")
            usercovArray()
            vinfo_hist(act_v, act_name_tag, [], input_id)
        })
        .appendTo($div_button)
    jQuery(
        "<a class = 'close-button btn-sm btn-default' aria-label='Close'><span class = 'fas fa-times' aria-hidden='true'></span></a>"
    )
        .attr(
            "style",
            "font-size: 1.3em;color:white;position:absolute; top:0px; right:0px;"
        )
        .css("margin-left", "1px")
        .css("background-color", "transparent")
        .on("click", function() {
            jQuery(this)
                .parent()
                .attr("hiding-list", true)
            jQuery(this)
                .parent()
                .fadeOut()
            console.log("." + act_name_tag + "-" + input_id + "-tag")
            jQuery("." + act_name_tag + "-" + input_id + "-tag").css(
                "background-color",
                "lightgrey"
            )
            usercovArray()
        })
        .appendTo($a)
    jQuery(
        "<a class = 'minize-button btn-sm btn-default' aria-label='Close'><span class = 'fas fa-minus-square' aria-hidden='true'></span></a>"
    )
        .attr(
            "style",
            "font-size: 1.3em;color:white;position:absolute; top:0px; right:25px;"
        )
        .css("margin-left", "1px")
        .css("background-color", "transparent")
        .on("click", function() {
            if (
                jQuery(this)
                .parent()
                .find(".variable-summary")
                .is(":visible")
            ) {
                //jQuery(this).parent().find("div").fadeOut();
                $.each(
                    jQuery(this)
                    .parent()
                    .find("div"),
                    function(i, e) {
                        if (!$(e).hasClass("transformation-group")) $(e).fadeOut()
                    }
                )
                jQuery(this)
                    .parent()
                    .find("input")
                    .css("background-color", "#4d4d4d")
                    .css("border-color", "#4d4d4d")
                jQuery(this).html('<i class="fas fa-plus-square"></i>')
            } else {
                jQuery(this)
                    .parent()
                    .find("div")
                    .fadeIn()
                jQuery(this).html('<i class="fas fa-minus-square"></i>')
                jQuery(this)
                    .parent()
                    .find("input")
                    .css("background-color", "#4885ed")
                    .css("border-color", "#4885ed")
                jQuery(this)
                    .parent()[0]
                    .scrollIntoView({
                        behavior: "smooth",
                        block: "end",
                    })
            }
            console.log("." + act_name_tag + "-" + input_id + "-tag")
            usercovArray()
        })
        .appendTo($a)

    //load variable info file
    jQuery
        .get("variableInfo/" + act_v + ".json", function(vinfo, e) {
            console.log(e)
            jQuery.get(
                "/applications/Ontology/searchTerm2.php",
                {
                    search: act_v,
                },
                function(search_result) {
                    console.log(search_result)
                    console.log(vinfo)
                    transform = []
                    type_a_info = []
                    if (value.indexOf("log(") >= 0) {
                        transform.push("log")
                    }
                    if (value.indexOf("Censor(") >= 0) {
                        transform.push("censor005")
                    }
                    num_f = Object.keys(vinfo.factors).length
                    na = vinfo.factors["NA's"]
                    if (num_f <= 10) {
                        type_g = "Factor"
                    } else {
                        type_g = "Numeric"
                    }
                    for (temp_hist in vinfo.summary) {
                        var th = vinfo["summary"][temp_hist]
                        if (is_transform(transform, th.transform)) {
                            type_a_info =
                                type_g == "Factor"
                                ? summary_join(vinfo.factors)
                                : summary_join(vinfo.summary[temp_hist].summary)

                        }
                    }

                    description = JSON.parse(search_result)[0].description
                    //var pre_wrap = jQuery("<div class = 'row row-fluid'></div>").css("margin","0px")

                    jQuery(
                        "<div class = 'col-sm-12 variable-summary' style = 'overflow:auto; max-height: 100px; margin-bottom:5px; font-size: 0.9rem;line-height:20px;padding-left:5px;padding-right:5px;border:0px;'></div>"
                    )
                        .html(
                            //"Variable Type: " + type_g + "\n"
                            // Get it from the type directly from the precaluculated files
                            //+ "NA's: " + (na? na:0) + "\n"
                            "<p style='margin-bottom:5px; margin-top:5px'>" +
                            description +
                            "</p>"
                        )
                        .css("margin", "0px")
                        .appendTo($a)
                    jQuery("<div class = 'col-sm-5' style = 'overflow-y:scroll; max-height: 220px; min-height: 200px;margin:0; font-size: 0.8 rem;line-height:20px; font-height: 2px;padding-left:0px;padding-right:0px;border:0px;'></div>")
                        .append($div_button)
                        .append(type_a_info) 
                        .appendTo($a);

                    jQuery(
                        "<div style = 'padding :0' class = '" +
                        act_name_tag +
                        "-" +
                        input_id +
                        "-hist col-sm-7'></div>"
                    ).appendTo($a)
                    //pre_wrap.appendTo($a)
                    //if(vinfo.histogram != ""){ hist(vinfo.histogram,act_v,act_v,"."+act_name_tag+"-"+input_id+"-hist");}
                    //else{  hist_cata(vinfo.summary,act_v,act_v,"."+act_name_tag+"-"+input_id+"-hist"); }
                    //pre_wrap.appendTo($a)

                    for (temp_hist in vinfo.histograms) {
                        var th = vinfo["histograms"][temp_hist]
                        if (is_transform(transform, th.transform)) {
                            hist(
                                th.histogram,
                                act_v,
                                act_v,
                                "." + act_name_tag + "-" + input_id + "-hist"
                            )
                            return
                        }
                    }

                    hist_cata(
                        vinfo.summary,
                        act_v,
                        act_v,
                        "." + act_name_tag + "-" + input_id + "-hist"
                    )
                }
            )
            setTimeout(function() {
                document
                    .getElementsByClassName(input_id + "-" + act_name_tag + "-wrapper")[0]
                    .scrollIntoView({
                        behavior: "smooth",
                        block: "end",
                    })
            }, 200)
        })
        .fail(function(e) {
            jQuery(
                "<div class = 'variable-summary' readonly style = 'color: red;height: 30px'></div>"
            )
                .html("ERROR: Column " + act_v + " does not exist")
                .appendTo($a)
        })

    if (value.indexOf("s(") >= 0) {
        $a.find(".v-s-button").css("background-color", "lightgreen")
    } else if (value.indexOf("log(") >= 0) {
        $a.find(".v-log-button").css("background-color", "lightgreen")
    } else if (value.indexOf("*") >= 0) {
        $a.find(".v-interaction-button").css("background-color", "lightgreen")
    } else if (value.indexOf("^") >= 0) {
        $a.find(".v-sq-button").css("background-color", "lightgreen")
    }

    if (value.indexOf("Censor(") >= 0) {
        $a.find(".v-ws-button").css("background-color", "lightgreen")
    }

    return jQuery("<li class='list-entry'></li>").append($a)
}

function vinfo_hist(act_v, act_name_tag, transform, input_id) {
    jQuery
        .get("variableInfo/" + act_v + ".json", function(vinfo, e) {
            jQuery("." + act_name_tag + "-" + input_id + "-hist")
                .find("svg")
                .remove()
            //pre_wrap.appendTo($a)

            for (temp_hist in vinfo.histograms) {
                var th = vinfo["histograms"][temp_hist]
                if (is_transform(transform, th.transform)) {
                    hist(
                        th.histogram,
                        act_v,
                        act_v,
                        "." + act_name_tag + "-" + input_id + "-hist"
                    )
                    return
                }
            }

            hist_cata(
                vinfo.summary,
                act_v,
                act_v,
                "." + act_name_tag + "-" + input_id + "-hist"
            )
        })
        .fail(function(e) {
            jQuery("<pre readonly style = 'color: red;height: 20px'></pre>")
                .html("ERROR: Column " + act_v + " is not in the Database.")
                .appendTo($a)
        })
}

function is_transform(transform_specifid, list) {
    return transform_specifid.sort().join(",") === list.sort().join(",")
}

function insert_single_input(item_input) {
    var class_type = item_input.id
    var name = ""
    var id = ""
    var default_value = ""
    for (index in item_input.state) {
        state = item_input.state[index]
        if (state.name == "name") {
            name = state.value
        }
        if (state.name == "id") {
            id = state.value
        }
        if (state.name == "value") {
            default_value = state.value
        }
    }
    var div = jQuery("<div>")
    div.attr("class", "row form-group")
    var label = jQuery("<label>")
    label.html(name)
    label.attr("for", class_type + "-" + id)
    label.attr("class", "col-md-10 col-form-label span3")
    label.css("line-height", 1.1)
    var d2 = jQuery('<div class="col-md-10 span9">')
    var input = jQuery("<input>")
    input.attr("id", class_type + "-" + id)
    input.attr("class", "input-block-level")
    input.attr(
        "style",
        "width: 100%; margin-top: 2px; background-color: rgb(255, 255, 255);"
    )
    input.val(default_value)
    input.autocomplete({
        minLength: 3,
        delay: 500,
        source: analysis_names,
        change: function() {
            yvalueChanged(input)
        },
        select: function(event, ui) {
            for (index in item_input.state) {
                state = item_input.state[index]
                if (state.name == "value") {
                    state.value = ui.item.value
                    console.log("JSON has been updated.")
                    console.log(state)
                    jQuery("#formula").html(get_formula())
                }
            }
        },
    })

    div.append(label)
    d2.append(input)
    div.append(d2)
    jQuery(".content").append(div)
}

function insert_checkbox(arr) {
    var group = jQuery('<div class="form-group">')
    var ran_group = jQuery('<div class="form-group">')
    var label = jQuery("<label>")
    label.html("Fixed Effect Covariates")
    label.attr("class", "col-md-10 col-form-label span3")
    label.css("line-height", 1.1)

    group.append(label)
    var label2 = jQuery("<label>")
    label2.html("Random Effects")
    label2.attr("class", "col-md-10 col-form-label span3")
    label2.css("line-height", 1.1)

    ran_group.append(label2)
    var div = jQuery("<div>")
    div.attr("class", "btn-group col-md-10 span7").css("margin-top", 0)
    div.attr("role", "group")
    div.attr("data-toggle", "buttons").css("overflow-x", "auto")

    var div_random = jQuery("<div>")
    div_random.attr("class", "btn-group col-md-10 span7")
    div_random.attr("role", "group")
    div_random.attr("data-toggle", "buttons")

    for (index in arr) {
        if (index == "shuffle") continue
        var name = ""
        var measure = []
        var default_value = []
        var id = ""
        var value = ""

        item = (function(q) {
            return q
        })(arr[index])

        for (i in item.state) {
            state = item.state[i]
            if (state.name == "name") {
                name = state.value
            }
            if (state.name == "measure") {
                measure = state.value.split(" ")
            }
            if (state.name == "default") {
                //TODO: default should be defined as binary

                default_value = state.value
            }
            if (state.name == "id") {
                id = state.value
            }
            if (state.name == "value") {
                value = state.value
            }
        }

        var input = jQuery("<button>")
        input.attr("id", id + "-input")

        if ( id == "random-Family") {
            input.attr("disabled", "disabled")
        }
        //data-toggle="tooltip" data-placement="top" title="Tooltip on top"
        input
            .attr("class", "btn btn-default btn-sm")
            .attr("data-toggle", "tooltip")
            .attr("data-placement", "top")
            .attr("title", default_value)
            .css("border", "1px solid #4CAF50")
            .css("z-index", "0")
        input.attr("measure", default_value)
        input.attr("default", default_value)
        if (value == default_value) {
            input.addClass("active")
        }
        input.html(name)
        var test = (function(input, item) {
            input.click(function() {
                if (input.hasClass("active")) {
                    //input.removeClass("active");
                    for (index in item.state) {
                        state = item.state[index]
                        if (state.name == "value") {
                            state.value = ""
                            console.log("JSON has been updated.")
                            jQuery("#formula").html(get_formula())
                        }
                    }
                } else {
                    //input.addClass("active")
                    console.log(input.attr("id"))
                    for (index in item.state) {
                        state = item.state[index]
                        if (state.name == "value") {
                            state.value = input.attr("default")
                            console.log("JSON has been updated.")
                            jQuery("#formula").html(get_formula())
                        }
                    }
                }
            })
        })(input, item)

        if (id == "random-SITE" || id == "random-Family") {
            div_random.append(input)
        } else {
            div.append(input)
        }
    }
    group.append(div)
    ran_group.append(div_random)
    jQuery(".content").append(group)
    jQuery(".content").append(ran_group)
    //$('[data-toggle="tooltip"]').tooltip({container: 'body'});
}

function loadAnalysisNames() {
    analysis_names = []
    dataMRIRead = false // we have to read them and afterwards add the entries to the ontology field
    dataBehaviorRead = false
    version = ""
    var inputData =
        "../../data/" +
        project_name +
        "/data_uncorrected" +
        version +
        "/" +
        project_name +
        "_datadictionary01.csv"
    jQuery.get(
        inputData,
        {
            cache: true,
        },
        function(tsv) {
            var lines = [],
                listen = false

            try {
                // split the data return into lines and parse them
                tsv = tsv.split(/\r?\n/)
                jQuery.each(tsv, function(i, line) {
                    if (line == "" || line.charAt(0) == "#") {
                        listen = false
                    }
                    // extract the header line from the first comment line
                    line = line.split(/,/)
                    var name = line[0]
                    name = name.replace(/["']/g, "")
                    analysis_names.push(name)
                })

                dataMRIRead = true
                //if (dataMRIRead && dataBehaviorRead)
                //addToOntology(analysis_names);
            } catch (err) {}
        }
    )

    var inputData =
        "../../data/" +
        project_name +
        "/data_uncorrected" +
        version +
        "/" +
        project_name +
        "_datadictionary02.csv"
    jQuery.get(
        inputData,
        {
            cache: true,
        },
        function(tsv) {
            var lines = [],
                listen = false

            try {
                tsv = tsv.split(/\r?\n/)
                jQuery.each(tsv, function(i, line) {
                    if (
                        line == "" ||
                        line.charAt(0) == "#" ||
                        analysis_names.length == 0
                    ) {
                        listen = false
                    }
                    line = line.split(/,/)
                    analysis_names.push(line[0])
                })

                dataBehaviorRead = true
                //if (dataMRIRead && dataBehaviorRead)
                //addToOntology(analysis_names);
            } catch (err) {}
        }
    )
}

function yvalueChanged(item) {
    setTimeout(function() {
        //updateExpertField();
        var ret = isValidEntry(item.val())
        if (ret[0] != true) {
            item.css("background-color", "#FF9999")
            item.effect("highlight", {}, 1000)
            item.attr("title", 'Error: value "' + ret[1] + '" is unknown.')
        } else {
            item.css("background-color", "white")
            item.attr("title", "valid entry")
        }
    }, 500)
}

function isValidEntry(string) {
    // return true if the string is empty (might not work for some measures)
    if (string.length == 0) {
        return [true, ""]
    }

    var found = false
    var values = string.split("+")
    for (var i = 0; i < values.length; i++) {
        var parts = values[i].split(":")
        for (var j = 0; j < parts.length; j++) {
            var val = parts[j]
            val = val.replace(/\ /g, "")
            if (val.substr(0, 2) == "s(") val = val.substring(2, val.length - 1)
            if (val.substr(0, 2) == "I(") val = val.substring(2, val.length - 1)
            // add test for ^x
            var end = val.match(/\^\d+$/)
            if (end && end.length > 0) {
                val = val.substring(0, val.length - end.length - 1)
            }
            found = false
            jQuery.each(analysis_names, function(index, value) {
                if (value == val) {
                    found = true
                }
            })
            if (found == false) return [found, val]
        }
    }
    return [found, val] // yes,no found
}

var checkDisplayInterval = {}
var display = "Not found"
var display_data = {}
var timeout_check = true
var random = ""
var time_start = 0

// prevent compute if DEAP is is restricted mode
function computeWithCheck() {
    jQuery.getJSON('/applications/Pre-Registration/modeChange.php', { 'action': 'read' }, function(data) {
        if (data['mode'] == 'restricted') {
            alert('Warning: you are trying to run this analysis in restricted mode (see Plan). This analysis will only be executed if you switch to the unrestricted mode.');
        } else {
            compute();
        }
    });
}

function compute() {
    // a random number designed to be unique for the model.
    time_start = new Date().getTime()
    usercovArray()
    $(".model-definition").addClass("disabledbutton")
    jQuery("#formula").html(get_formula())
    jQuery("#compute-button").html("<div class = 'loader'></div>")
    jQuery("#compute-button").attr("disabled", "on")

    random = Math.round(Math.random() * 1000000)
    timeout_check = true

    var pass_post = {
        jsondata: JSON.stringify(json),
        code: random,
        action: "start",
    }

    jQuery.post("./run.php", pass_post).done(function(data) {
        console.log("Nodes processing: " + data)
        console.log(random)
        if (data == "success") {
            if (timeout_check) timeout_check_f(json)
        }
    })
    if (
        jQuery(".list-group").find(".active").length > 0 &&
        JSON.stringify(json) ==
        JSON.parse(
            jQuery(".list-group")
            .find(".active")
            .attr("value")
        ).json
    ) {
        var update_post = {
            nameTag: jQuery(".list-group")
            .find(".active")
            .find("h6")
            .html(),
            code: random,
            action: "saveResult",
        }
        jQuery.post("./run.php", update_post).done(function(data) {
            console.log(data)
        })
    }
}

function timeout_check_f(cur_json) {
    setTimeout(function() {
        if (JSON.stringify(json) != JSON.stringify(cur_json)) {
            time_start = 0
            return
        }
        time_passed = (new Date().getTime() - time_start) / 1000
        var pass_post = {
            code: random,
            action: "read",
            time: time_passed,
        }
        //console.log(new Date().getTime() - time_start );
        if (timeout_check) {
            jQuery.post("./run.php", pass_post).done(function(data) {
                display = data
                if (display != "Not found") {
                    timeout_check = false
                    clearDisplayCheck()
                    update_load_list_pannel()
                } else {
                    timeout_check = true

                    timeout_check_f(cur_json)
                }
                if (data !== "Not found") console.log(data)
            })
        }
    }, 10)
}

function addCommas(x) {
    var parts = x.toString().split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".")
}

function clearDisplayCheck(time) {
    //clearInterval(checkDisplayInterval);
    //get the list of display output
    timeout_check = false
    if (time == 0) time_start = 0
    jQuery(".tutorial-mode")
        .insertAfter("body")
        .hide()
    jQuery("#scatter").html("")

    if (0 != time_start)
        jQuery("#scatter").prepend(
            jQuery("<code>").html(
                ((new Date().getTime() - time_start) / 1000.0).toFixed(2) +
                "sec for calculation"
            )
        )
    time_start = 0
    //jQuery("textarea").hide();
    display_file_list = jQuery.parseJSON(display)
    display_data = {}
    var lineplot_data = []
    for (file_name_index in display_file_list) {
        if (file_name_index == "error") {
            filename = display_file_list[file_name_index]
            console.log(filename[0])
            for (var error_id = 0; error_id < filename.length; error_id++) {
                console.log(error_id)
                jQuery.get(filename[error_id], function(edata) {
                    if (edata.indexOf("Error") >= 0)
                        jQuery("#scatter").append(
                            jQuery("<pre>")
                            .css("margin-left", "15px")
                            .css("color", "red")
                            .html(edata.split("In addition:")[0])
                        )
                })
            }
        }
        if (file_name_index == "scatter") {
            filename = display_file_list[file_name_index]
            jQuery.get(filename, function(data) {
                scatter_output_json = data
		if(!data[0]["src_subject_id"]) return;
                jQuery.get(display_file_list["lineplot"], function(ldata) {
                    lineplot_data = ldata
                    line_output_json = ldata

                    console.log(parseDisplyData(data))
                    display_data = removeDup(parseDisplyData(data[0]))
                    display_data_corrected = removeDup(parseDisplyData(data[7]))
                    //default here
                    indepvar = getVarNameByID("log.var").includes(
                        getVarNameByID("indepvar")
                    )
                        ? "log(" + getVarNameByID("indepvar") + ")"
                        : getVarNameByID("indepvar")

                    depvar = getVarNameByID("depvar")
                    gp = getVarNameByID("grvar")
                    //jQuery("#scatter").css("height","2200px");

                    jQuery("#scatter").append(
                        "<h2 class='tut-data-display'>Data Display and Summaries</h2>"
                    )

                    data[3].type != "categorical"
                        ? hist(data[3], depvar, 3)
                        : hist_cata(data[3], depvar, 3)
                    data[2].type != "categorical"
                        ? hist(data[2], indepvar, 2)
                        : hist_cata(data[2], indepvar, 2)
                    //qqplot(data[1],1,lineplot_data[1],"red");

                    jQuery("#scatter").append(
                        "<h2 class='model-output'>Model Output</h2>"
                    )
                    //jQuery("#scatter").append("<h2>Data output</h2>")

                    //catagorical data output, ignore the scatter plot
                    if (data[0]["eff.names"]) {
                        coef(data[0], "coef")
                    } else {
                        //scatter(display_data,depvar,indepvar, gp,0,{},["red","black","red"]);
                        scatter(display_data, depvar, indepvar, gp, 0, lineplot_data[0], [
                            "red",
                            "black",
                            "red",
                        ])
                    }
                    //var summary_text = jQuery("<textarea class= 'summary-textarea' style='display:none;height: 400px; width: 100%; font-family: \'Lucida Console\', Monaco, monospace; font-size: 12px;'></textarea>");
                    var summary_text = jQuery("<div class = 'summary-textarea'></div>")
                    if (jQuery(window).width() < 400)
                        summary_text.css("font-size", "0.5rem")
                    jQuery.get(
                        display_file_list["statistics"],
                        function(d) {
                            statistics_output_json = d
                            //summary_text.html(JSON.parse(d).join("\n"));
                            if (JSON.parse(d)["formula"])
                                summary_text.append(
                                    "<h4 class='formula-title'>Formula</h4><p class='formula'>" +
                                    (Array.isArray(JSON.parse(d)["formula"])
                                        ? JSON.parse(d)["formula"].join("</n>")
                                        : JSON.parse(d)["formula"]) + 
                                        
                                    "</p>"
                                )
                                summary_text.append( "<p class='formula'>" +
                                    "\n Random: " + JSON.parse(d)["formula.random"] + "</p>");
                            if (JSON.parse(d)["table1"])
                                summary_text.append(
                                    jQuery(
                                        JSON.parse(d)
                                        ["table1"].join("")
                                        .split(",")
                                        .join("")
                                    )
                                    .addClass("center")
                                    .addClass("table1-section")
                                )
                            if (JSON.parse(d)["eftab"]) {
                                summary_text.append(
                                    "<h4 class='effect-size-table-title'>Effect size table</h4>"
                                )
                                summary_text.append(
                                    jQuery(
                                        JSON.parse(d)
                                        ["eftab"].join("")
                                        .split(",")
                                        .join("")
                                    ).addClass("center")
                                )
                            }
                            if (JSON.parse(d)["anova"]) {
                                summary_text.append(
                                    "<h4 class='anova-table-title'>ANOVA table</h4>"
                                )
                                summary_text.append(
                                    jQuery(
                                        JSON.parse(d)
                                        ["anova"].join("")
                                        .split(",")
                                        .join("")
                                    ).addClass("center")
                                )
                            }

                            if (JSON.parse(d)["ptable"]) {
                                summary_text.append(
                                    "<h4 class='parameter-table-title'>Parameter table</h4>"
                                )
                                summary_text.append(
                                    jQuery(
                                        JSON.parse(d)
                                        ["ptable"].join("")
                                        .split(",")
                                        .join("")
                                    ).addClass("center")
                                )
                            }

                            if (JSON.parse(d)["stable"])
                                summary_text.append(
                                    jQuery(
                                        JSON.parse(d)
                                        ["stable"].join("")
                                        .split(",")
                                        .join("")
                                    ).addClass("center")
                                )
                            if (JSON.parse(d)["rantable"]) {
                                summary_text.append(
                                    "<h4 class='random-effects-title'>Random Effect table</h4>"
                                )
                                summary_text.append(
                                    jQuery(
                                        JSON.parse(d)
                                        ["rantable"].join("")
                                        .split(",")
                                        .join("")
                                    ).addClass("center")
                                )
                            }

                            summary_text.append(
                                "<h4 class='other-statistics-title'>Model Selection Statistics</h4>"
                            )
                            var stat = jQuery('<div class="other-stats-section">')
                            for (other_s_item in JSON.parse(d)["other.stats"]) {
                                stat.append(
                                    "<p class='other-stats-item'>" +
                                    addCommas(JSON.parse(d)["other.stats"][other_s_item]) +
                                    "</p>"
                                )
                            }
                            summary_text.append(stat)
                            //jQuery("#scatter").css("height",(summary_text.height()+jQuery("#scatter").height()));
                            $("td").each(function(i, d) {
                                if (
                                    $(d)
                                    .html()
                                    .indexOf("*") >= 0 ||
                                    $(d)
                                    .html()
                                    .indexOf("&gt;") >= 0 ||
                                    $(d)
                                    .html()
                                    .indexOf("&lt;") >= 0
                                )
                                    $(d).html(
                                        $(d)
                                        .html()
                                        .split(" ")
                                        .join("")
                                    )
                            })
                            summary_text.show()
                        },
                        "text"
                    )
                    jQuery("#scatter").append(summary_text)

                    jQuery("#scatter").append(
                        "<h2 class='model-diagnostics'>Model Diagnostics</h2>"
                    )
                    scatter(
                        parseDisplayData_simple(data[4]),
                        "res",
                        "fitted",
                        gp,
                        4,
                        [lineplot_data[4]],
                        ["red"]
                    )
                    //hard coding make random effect a seperate input
                    if(data[5]["breaks"] != "NA") hist(data[5], "site", 5)
                    hist(data[6], "Family", 6)
                    qqplot(data[1], 1, lineplot_data[1], "red")
                    switchMode(mode)
                    //resize window
                    jQuery(window).resize(function() {
                        var ratio = jQuery(window).width() / window_width
                        window_width = jQuery(window).width()
                        jQuery(".tutorial-mode")
                            .insertAfter("body")
                            .hide()
                        jQuery("#scatter").html("")
                        indepvar = getVarNameByID("log.var").includes(
                            getVarNameByID("indepvar")
                        )
                            ? "log(" + getVarNameByID("indepvar") + ")"
                            : getVarNameByID("indepvar")
                        depvar = getVarNameByID("depvar")
                        //jQuery("#scatter").css("height","2500px");

                        jQuery("#scatter").append(
                            "<h2 class='tut-data-display'>Data display and summaries</h2>"
                        )
                        jQuery(".table1-section").insertAfter(jQuery("h2.tut-data-display"))
                        data[3].type != "categorical"
                            ? hist(data[3], depvar, 3)
                            : hist_cata(data[3], depvar, 3)
                        data[2].type != "categorical"
                            ? hist(data[2], indepvar, 2)
                            : hist_cata(data[2], indepvar, 2)

                        jQuery("#scatter").append(
                            "<h2 class='model-output'>Data Output</h2>"
                        )
                        //jQuery("#scatter").append("<h2>Data output</h2>")

                        //data[0]["eff.names"] ? coef(data[0],"coef"):
                        //scatter(display_data,depvar,indepvar, gp,0,lineplot_data[0],["red","black","red"]);
                        if (data[0]["eff.names"]) {
                            coef(data[0], "coef")
                        } else {
                            //scatter(display_data,depvar,indepvar, gp,0,{},["red","black","red"]);
                            scatter(display_data, depvar, indepvar, gp, 0, lineplot_data[0], [
                                "red",
                                "black",
                                "red",
                            ])
                        }
                        jQuery("#scatter").append(summary_text)
                        jQuery("#scatter").append(
                            "<h2 class='model-diagnostics'>Model Diagnostics</h2>"
                        )
                        scatter(
                            parseDisplayData_simple(data[4]),
                            "res",
                            "fitted",
                            gp,
                            4,
                            [lineplot_data[4]],
                            ["red"]
                        )
                        //hard coding make random effect a seperate input
                        hist(data[5], "site", 5)
                        hist(data[6], "Family", 6)
                        qqplot(data[1], 1, lineplot_data[1], "red")

                        switchMode(mode)
                        $("td").each(function(i, d) {
                            if (
                                $(d)
                                .html()
                                .indexOf("*") >= 0 ||
                                $(d)
                                .html()
                                .indexOf("&gt;") >= 0 ||
                                $(d)
                                .html()
                                .indexOf("&lt;") >= 0
                            )
                                $(d).html(
                                    $(d)
                                    .html()
                                    .split(" ")
                                    .join("")
                                )
                        })
                    })
                })
            })
        }
    }
    jQuery("#compute-button").html("Submit")
    jQuery("#compute-button").removeAttr("disabled")
    jQuery("#load-list-pannel .list-group").removeClass("disabledbutton")
    jQuery(".model-definition").removeClass("disabledbutton")
}

function parseDisplyData(d) {
    var newd = []
    for (rownum in d["src_subject_id"]) {
        var temp = {}
        for (col_name in d) {
            temp[col_name] = d[col_name][rownum]
        }
        newd.push(temp)
    }
    var ret_arr = []
    for (var i = 0; i < newd.length; i++) {
        var temp = newd[i]
        var na = false
        for (key in temp) {
            if (key != "src_subject_id" && temp[key] == "NA") na = true
        }

        //if(!na){
        ret_arr.push(temp)
        //}
    }
    return ret_arr
}

function cleanArray(actual) {
    var newArray = new Array()
    for (var i = 0; i < actual.length; i++) {
        if (actual[i]) {
            newArray.push(actual[i])
        }
    }

    return newArray
}

function removeDup(data) {
    var newarray = new Array()
    var map = {}
    for (index in data) {
        datapiece = data[index]
        //map[datapiece["SubjID"] + datapiece["VisitID"]] = datapiece;
        map[datapiece["src_subject_id"]] = datapiece
    }

    for (key in map) {
        for (vk in map[key]) {
            if (!isNaN(map[key][vk])) {
                map[key][vk] = parseFloat(map[key][vk])
            }
        }
        newarray.push(map[key])
    }
    return newarray
}

function parseLineData(d) {
    var newd = []
    for (rownum in d["fit"]) {
        var temp = {}
        for (col_name in d) {
            temp[col_name] = d[col_name][rownum]
        }
        newd.push(temp)
    }
    var ret_arr = []
    for (var i = 0; i < newd.length; i++) {
        var temp = newd[i]
        var na = false
        for (key in temp) {
            if (temp[key] == "NA" || typeof temp[key] === "undefined") na = true
        }

        if (!na) {
            ret_arr.push(temp)
        }
    }
    var ind = ""
    for (key in ret_arr[0]) {
        if (key != "fit" && key != "upper" && key != "lower" && key != "se.fit")
            ind = key
    }
    ret_arr.sort(function(a, b) {
        return a[ind] - b[ind] == 0 ? a.fit - b.fit : a[ind] - b[ind]
    })
    var map = {}
    for (item in ret_arr) {
        if (!map[ret_arr[item][ind]]) {
            map[ret_arr[item][ind]] = []
        }
        map[ret_arr[item][ind]].push(ret_arr[item])
    }
    var r_arr = []
    for (key in map) {
        if (key == "shuffle") continue
        if (map[key][Math.round(map[key].length / 2)])
            r_arr.push(map[key][Math.round(map[key].length / 2)])
    }
    return r_arr
}

function setVarByID(name, value) {
    rt_name = ""
    rt_name_list = []
    jQuery.each(json, function(n) {
        if (n == "nodes") {
            jQuery.each(json[n], function(m) {
                jQuery.each(json[n][m]["state"], function(s) {
                    if (!json[n][m]["state"][s]["value"]) return
                    if (json[n][m]["state"][s]["value"] == name) {
                        jQuery.each(json[n][m]["state"], function(sc) {
                            if (json[n][m]["state"][sc]["name"] == "value") {
                                json[n][m]["state"][sc]["value"] = value
                                rt_name = json[n][m]["state"][sc]["value"]
                                console.log(json[n][m]["state"])
                            }
                        })
                    }
                })
            })
        }
    })
    if (rt_name != "") return rt_name
    else return false
}

function getVarNameByID(name, new_json) {
    if (new_json) {
        console.log("user defined model")
        var json_in_use = new_json
    } else {
        console.log("loaded model")
        var json_in_use = json
    }
    rt_name = "NULL"
    rt_name_list = []
    jQuery.each(json_in_use, function(n) {
        if (n == "nodes") {
            jQuery.each(json_in_use[n], function(m) {
                jQuery.each(json_in_use[n][m]["state"], function(s) {
                    if (!json_in_use[n][m]["state"][s]["value"]) return
                    if (json_in_use[n][m]["state"][s]["value"].includes(name)) {
                        jQuery.each(json_in_use[n][m]["state"], function(sc) {
                            if (json_in_use[n][m]["state"][sc]["name"] == "value") {
                                rt_name_list.push(json_in_use[n][m]["state"][sc]["value"])
                            }
                        })
                    }
                    if (json_in_use[n][m]["state"][s]["value"] == name) {
                        jQuery.each(json_in_use[n][m]["state"], function(sc) {
                            if (json_in_use[n][m]["state"][sc]["name"] == "value") {
                                rt_name = json_in_use[n][m]["state"][sc]["value"]
                            }
                        })
                    }
                })
            })
        }
    })
    if (rt_name != "NULL") return rt_name
    return rt_name_list
}

function parseDisplayData_simple(d) {
    rt = []
    keylist = Object.keys(d)
    length = d[keylist[0]].length
    for (var i = 0; i < length; i++) {
        temp = {}
        for (key in d) {
            temp[key] = d[key][i]
        }
        rt.push(temp)
    }
    return rt
}
//helper
function summary_join(obj) {
    var rt =
        "<table class= 'variable-summary-table col-md-12' style = 'text-align:center' >"
    for (key in obj) {
        rt = rt + "<tr>"
        rt = rt + "<td>" + key + "</td><td>" + Math.round(100*obj[key])/100 + "</td>"
        rt = rt + "</tr>"
    }
    return rt + "</table>"
}
/* Set the width of the side navigation to 250px and the left margin of the page content to 250px if the margin left smaller than 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "350px"
    //var main_margin_left = jQuery("#main").ccs("marginLeft");
    //if(main_margin_left < 250) jQuery("#main").ccs("marginLeft", "250px");
    jQuery("#main").css("marginLeft", "350px")
    jQuery(window).trigger("resize")
}

/* Set the width of the side navigation to 0 and the left margin of the page content to auto */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0"
    document.getElementById("main").style.marginLeft = "auto"
    jQuery(window).trigger("resize")
}

function IsJsonString(str) {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}

function getExpertNodeNum() {
    for (n in json.nodes) {
        if (json.nodes[n].name == "GAMM4") return n
    }
}

function getListofID() {
    var rt = {}
    for (node in json.nodes) {
        if (json.nodes[node].name.includes("Measure")) {
            var node_it = json.nodes[node]
            var state = node_it.state,
                id = "",
                value = ""
            for (s in state) {
                if (state[s].name == "id") {
                    id = state[s].value
                }
                if (state[s].name == "value") {
                    value = state[s].value
                }
            }
            if (id != "" && typeof value != "undefined") {
                rt[id] = value
            }
        }
    }
    return rt
}

function generateQueryString(data) {
    var ret = []
    for (let d in data) {
        nd = d.split(".").join("__DOT__")
        ret.push(encodeURIComponent(nd) + "=" + encodeURIComponent(data[d]))
    }
    return ret.join("&")
}

function downloadJson(obj, name) {
    var dataStr =
        "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj))
    var $a = $("<a>").appendTo("body")
    $a.attr("href", dataStr)
    $a.attr("download", name + ".json")
    $a[0].click()
}

function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(",")[1])

    // separate out the mime component
    var mimeString = dataURI
        .split(",")[0]
        .split(":")[1]
        .split(";")[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length)

    // create a view into the buffer
    var ia = new Uint8Array(ab)

    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
    }

    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], {
        type: mimeString,
    })
    return blob
}

function makeDragable(dragHandle, dragTarget) {
    let dragObj = null //object to be moved
    let xOffset = 0 //used to prevent dragged object jumping to mouse location
    let yOffset = 0

    document
        .querySelector(dragHandle)
        .addEventListener("mousedown", startDrag, true)
    document
        .querySelector(dragHandle)
        .addEventListener("touchstart", startDrag, true)

    /*sets offset parameters and starts listening for mouse-move*/
    function startDrag(e) {
        e.preventDefault()
        e.stopPropagation()
        dragObj = document.querySelector(dragTarget)
        dragObj.style.position = "fixed"
        let rect = dragObj.getBoundingClientRect()

        if (e.type == "mousedown") {
            xOffset = e.clientX - rect.left //clientX and getBoundingClientRect() both use viewable area adjusted when scrolling aka 'viewport'
            yOffset = e.clientY - rect.top
            window.addEventListener("mousemove", dragObject, true)
        } else if (e.type == "touchstart") {
            xOffset = e.targetTouches[0].clientX - rect.left
            yOffset = e.targetTouches[0].clientY - rect.top
            window.addEventListener("touchmove", dragObject, true)
        }
    }

    /*Drag object*/
    function dragObject(e) {
        e.preventDefault()
        e.stopPropagation()

        if (dragObj == null) {
            return // if there is no object being dragged then do nothing
        } else if (e.type == "mousemove") {
            dragObj.style.left =
                Math.min(Math.max(0, e.clientX - xOffset), $(window).width() - 500) +
                "px" // adjust location of dragged object so doesn't jump to mouse position
            dragObj.style.top =
                Math.min(Math.max(0, e.clientY - yOffset), $("#moveable").height() > 50? $(window).height() - 500 : $(window).height() - 30) +
                "px"
        } else if (e.type == "touchmove") {
            dragObj.style.left = e.targetTouches[0].clientX - xOffset + "px" // adjust location of dragged object so doesn't jump to mouse position
            dragObj.style.top = e.targetTouches[0].clientY - yOffset + "px"
        }
    }

    /*End dragging*/
    document.onmouseup = function(e) {
        if (dragObj) {
            dragObj = null
            window.removeEventListener("mousemove", dragObject, true)
            window.removeEventListener("touchmove", dragObject, true)
        }
    }
}
