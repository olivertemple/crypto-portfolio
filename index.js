function showError(){
    console.log("error")
    div = document.createElement("div")
    div.setAttribute("class","error")
    heading = document.createElement("h1")
    heading.appendChild(document.createTextNode("API error!"))
    heading.appendChild(document.createElement("br"))
    heading.appendChild(document.createTextNode("please update or add API keys in settings"))
    div.appendChild(heading)
    document.getElementsByTagName("body")[0].appendChild(div)
}
pieHeight = null
changeTheme()
try{
    data = JSON.parse(localStorage.Data)
    displayPrice()
    draw2(1000)
    showAssets()
    //plotLine(JSON.parse(localStorage.histData))
}catch(error){
    console.log("no stored data")
}

function loadData(animate){
    var req = new XMLHttpRequest();
    req.open("POST", ("https://olivertemple.ddns.net/flask/wallet"), true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.onload = function(){
	    testData = req.response
	    console.log(req.response)
            data = JSON.parse(req.response)
            data.time = new Date()
            localStorage.Data = JSON.stringify(data)
            displayPrice()
            draw2(animate)
            showAssets()
	    //getHistData()
        }
        req.send(JSON.stringify({
            "key": localStorage.APIkey, "secret":localStorage.APIsecret
        }));
        req.onerror = function(){
            showError()
        }

    var orderReq = new XMLHttpRequest();
    orderReq.open("POST", ("https://olivertemple.ddns.net/flask/orders"), true);
    orderReq.setRequestHeader('Content-Type', 'application/json');
    orderReq.onload = function(){
        orders = JSON.parse(orderReq.response)
        showOrders()
	if (orders.orders.length == 0){
	    document.getElementById("noOpenOrders").setAttribute("style","display:block")
        }
    }
    orderReq.send(JSON.stringify({
        "key": localStorage.APIkey, "secret":localStorage.APIsecret
    }));
}


function getHistData(){
    var histReq = new XMLHttpRequest();
    histReq.open("POST","https://olivertemple.ddns.net/flask/histData",true)
    histReq.setRequestHeader("Content-Type","application/json");
    histReq.onload = function(){
        resp = histReq.response.replaceAll("u","")
        resp = eval(resp)
        localStorage.histData = JSON.stringify(resp)
        plotLine(resp)
    };
    histReq.send(JSON.stringify({
        "key":localStorage.APIkey
    }))
}


function plotLine(dataToPlot){
    Highcharts.chart(("timeChart"),{
        chart: {
	    type:"area",
            zoomType: "x",
            backgroundColor: chartColor,
	        height:320,
        },
        title:{
            text:"portfolio value",
            style:{
                font:'bold "Source Sans Pro", sans-serif',
                color:chartText,
            }
        },
        xAxis:{
            type:"datetime",
	    labels:{
		    enabled:false
	    }
        },
        yAxis:{
            title:{
                text:"value",
                style:{
                    color:chartText
                }
            },
            labels:{
                style:{
                    color:chartText
                }
            }
        },
        toolTip:{
            formatter: function(tooltip){
                return this.point.name +": £"+(Math.round(parseFloat(this.point.value)*100))/100
            }
        },
        plotOptions: {
            area: {
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        legend:{
            enabled: false
        },
        series:[{
	    name:"portfolio value",
            data:dataToPlot,
        }]
    }
    )
    document.getElementsByClassName("highcharts-exporting-group")[1].setAttribute("style","display:none")
}


function displayPrice(){
    heading = document.createElement("h1")
    heading.appendChild(document.createTextNode("£"+String((Math.round(data.total*100))/100)))
    heading2 = document.createElement("h2")
    heading2.setAttribute("id","percentChange")
    percent = (data.total/localStorage.money)*100
    heading2.appendChild(document.createTextNode(" "+String(((percent-100).toFixed(2)))+"%"))
    if (percent-100 > 0){
        heading2.style.color="#0EC67E"
    }else if (percent-100 < 0){
        heading2.style.color="darkred"
    }else{
        heading.style.color="yellow"
    }
    document.getElementById("total").innerHTML = ""
    heading3 = document.createElement("h3")
    heading3.appendChild(document.createTextNode("portfolio ballance"))
    document.getElementById("total").appendChild(heading3)
    document.getElementById("total").appendChild(heading)
    document.getElementById("total").appendChild(heading2)
}





function draw2(animate){
    var drawData = []
    data.assets.forEach(function(item){
        var dict = {}
        dict.y = ((parseFloat(item.value))/(data.total))*100
        if(dict.y < 5){
            dict.name = "other"
        }else{
            dict.name = item.asset
        }
        
        dict.value = item.value
        drawData.push(dict)
    })
    console.log(drawData)
    Highcharts.chart("chart",{
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            backgroundColor: chartColor,
            height:pieHeight,
        },
        title: {
            text: null
        },
        tooltip: {
            //pointFormat: '{point.percentage*66}<b>{point.percentage:.1f}%</b>'
            formatter: function(tooltip){
                return this.point.name +": £"+(Math.round(this.point.value*100))/100
            }
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        plotOptions: {
            pie: {
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style:{
                        color: chartText
                    }
                },
                animation:{
                    duration:animate
                }
            }
        },
        series: [{name:"crypto",
                innerSize: "75%",
                colorByPoint: true,
                data: drawData}]
    })
    document.getElementsByClassName("highcharts-exporting-group")[0].style.display = "none"
    document.getElementsByClassName("highcharts-container")[0].style.height = "350px"
    document.getElementsByClassName("highcharts-background")[0].style.height = "350px"
    var item = document.getElementsByClassName("highcharts-text-outline")
    for (i = 0; i< item.length; i++){
        item[i].setAttribute("style","display:none")
    }
}

function noIcon(item, name){
    item.setAttribute("src","https://cryptoicons.org/api/color/"+name+"/30")
    item.setAttribute("onerror","this.setAttribute('src','./resources/generic-coin.svg')")
}
function showAssets(){
    document.getElementById("items").innerHTML=""
    for (i=0; i<data.assets.length;i++) {
        item = data.assets[i]
        img = document.createElement("img")
        img.setAttribute("id","cryptoIcon")
        img.setAttribute("src","https://icons.bitbot.tools/api/"+item.asset.toLowerCase()+"/32x32")
        //img.setAttribute("src","https://cryptoicons.org/api/color/"+item.asset.toLowerCase()+"/30")
        img.setAttribute("onerror","noIcon(this,'"+item.asset.toLowerCase()+"')")
        
        
        amountDiv = document.createElement("div")
        amountDiv.setAttribute("id","amount")

        nameHeading = document.createElement("h1")
        nameHeading.appendChild(document.createTextNode(item.asset))

        amountHeading = document.createElement("h2")
        amountSpan = document.createElement("span")
        amountHeading.appendChild(document.createTextNode("£"+(Math.round(item.value*100))/100))
        amountSpan.appendChild(document.createTextNode(" ("+String(parseFloat(item.free) + parseFloat(item.locked))+item.asset+")"))
        amountHeading.appendChild(amountSpan)

        amountDiv.appendChild(nameHeading)
        amountDiv.appendChild(amountHeading)


        priceDiv = document.createElement("div")
        priceDiv.setAttribute("id","price")

        priceHeading = document.createElement("h1")
        priceHeading.appendChild(document.createTextNode("£"+String((Math.round(item.price*100))/100)))

        changeDiv = document.createElement("div")
        changeDiv.setAttribute("id","change")
        
        changeHeading = document.createElement("h1")
        changeHeading.appendChild(document.createTextNode(String((Math.round(item.change*100))/100)+"%"))

        arrow = document.createElement("img")
        if (item.change > 0){
            changeHeading.style.color = "green"
            arrow.setAttribute("src","./resources/arrow-up.png")

        }else if (item.change < 0){
            changeHeading.style.color = "darkred"
            arrow.setAttribute("src", "./resources/arrow-down.png")
        }else{
            changeHeading.style.color = "yellow"
            arrow.setAttribute("style", "transform: rotate(0deg); fill:yellow")
        }

        changeDiv.appendChild(changeHeading)
        changeDiv.appendChild(arrow)
        priceDiv.appendChild(priceHeading)
        priceDiv.appendChild(changeDiv)

        itemDiv = document.createElement("div")
        itemDiv.setAttribute("id","item")
        itemDiv.appendChild(img)
        itemDiv.appendChild(amountDiv)
        itemDiv.appendChild(priceDiv)
	if (i == data.assets.length - 1){
	    itemDiv.setAttribute("style","margin-bottom:20px")
        }
        document.getElementById("items").appendChild(itemDiv)
    }
    document.querySelector("#chart").setAttribute("style","margin-top:-15px")
}

function showOrders(){
    orders.orders.forEach(function(item){
        infoDiv = document.createElement("div")
        infoDiv.setAttribute("id","info")
        infoHeading = document.createElement("h1")
        infoHeading.appendChild(document.createTextNode(item.side+" "+item.type))
        infoDiv.appendChild(infoHeading)
        if (item.side == "SELL"){
            infoHeading.style.color = "darkred"
        }else{
            infoHeading.style.color = "green"
        }
        infoHeading2 = document.createElement("h2")
        infoHeading2.appendChild(document.createTextNode(item.symbol))
        infoDiv.appendChild(infoHeading2)

        amountDiv = document.createElement("div")
        amountDiv.setAttribute("id","amount")
        amountHeading = document.createElement("h1")
        amountSpan = document.createElement("span")
        amountSpan.appendChild(document.createTextNode("Amount: "))
        amountHeading.appendChild(amountSpan)
        amountHeading.appendChild(document.createTextNode(parseFloat(item.origQty)))
        priceHeading = document.createElement("h2")
        priceSpan = document.createElement("span")
        priceSpan.appendChild(document.createTextNode("Price: "))

        priceHeading.appendChild(priceSpan)
        priceHeading.appendChild(document.createTextNode(parseFloat(item.price)))
        
        amountDiv.appendChild(amountHeading)
        amountDiv.appendChild(priceHeading)
        itemDiv = document.createElement("div")
        itemDiv.setAttribute("id","item")
        itemDiv.appendChild(infoDiv)
        itemDiv.appendChild(amountDiv)
        document.getElementById("orderItems").appendChild(itemDiv)
    })
    
}
if (localStorage.money != undefined){
    document.querySelector("#addMoney").setAttribute("placeholder","current: £"+localStorage.money)
}
function addMoney(item){
    item = item.parentElement.children[0]
    console.log(parseFloat(item.value))
    if (localStorage.money != "NaN" && localStorage.money !=undefined){
        localStorage.money = parseFloat(localStorage.money)+parseFloat(item.value)
    }else{
        localStorage.money = item.value
    }
    item.value = ""
    item.setAttribute("placeholder","current: £"+localStorage.money)


    percent = (data.total/localStorage.money)*100
    document.getElementById("percentChange").innerHTML = (" "+String((percent-100).toFixed(2))+"%")
    if (percent-100 > 0){
        heading2.style.color="#0EC67E"
    }else if (percent-100 < 0){
        heading2.style.color="darkred"
    }else{
        heading.style.color="yellow"
    }

    
}

function addKeys(){
    localStorage.APIkey = document.querySelector("#key").value
    document.querySelector("#key").value=""
    localStorage.APIsecret = document.querySelector("#secret").value
    document.querySelector("#secret").value=""
    errors = document.getElementsByClassName("error")
    for (i=0; i<errors.length; i++){;
        errors[i].setAttribute("style","display:none")
    }
    loadData(true)
}

function scrollSettings(item){
    document.querySelector('.pages').scrollLeft = 1000
    document.getElementsByClassName("active")[0].setAttribute("class","")
    item.children[0].setAttribute('class','active')
}
function scrollAssets(item){
    document.querySelector('.pages').scrollLeft = 0
    document.getElementsByClassName("active")[0].setAttribute("class","")
    item.children[0].setAttribute('class','active')
}
function scrollOrders(item){
    document.querySelector('.pages').scrollLeft = 300
    document.getElementsByClassName("active")[0].setAttribute("class","")
    item.children[0].setAttribute('class','active')
}
document.getElementsByClassName("pages")[0].addEventListener("scroll", touchStart, true)
function touchStart(){
    assetPos = document.querySelector(".assets").getBoundingClientRect()
    if (assetPos.x ==0){
        document.querySelector("#assetNav").setAttribute("class","active")
        document.querySelector("#orderNav").setAttribute("class","")
        document.querySelector("#settingsNav").setAttribute("class","")
    } else if (assetPos.x <= -1*window.innerWidth +1 && assetPos.x >= -1*window.innerWidth -1){
        document.querySelector("#assetNav").setAttribute("class","")
        document.querySelector("#orderNav").setAttribute("class","active")
        document.querySelector("#settingsNav").setAttribute("class","")

    }else if (assetPos.x ==-2*window.innerWidth){
        document.querySelector("#assetNav").setAttribute("class","")
        document.querySelector("#orderNav").setAttribute("class","")
        document.querySelector("#settingsNav").setAttribute("class","active")
    }
}
/*document.getElementsByClassName("pages")[0].addEventListener("touchend", touchEnd, false)

function touchEnd(evt){
    change = (xStart - evt.changedTouches[0].pageX)
    console.log(change)
    if (change > 187.5){
        var active = document.querySelector(".active").id
        if (active == "assetNav"){
            document.getElementById("assetNav").setAttribute("class","")
            document.getElementById("orderNav").setAttribute("class","active")
        }else if (active == "orderNav"){
            document.getElementById("orderNav").setAttribute("class","")
            document.getElementById("settingsNav").setAttribute("class","active")
        }
    }else if (change < -187.5){
        var active = document.querySelector(".active").id
        if (active == "settingsNav"){
            document.getElementById("settingsNav").setAttribute("class","")
            document.getElementById("orderNav").setAttribute("class","active")
        }else if (active == "orderNav"){
            document.getElementById("orderNav").setAttribute("class","")
            document.getElementById("assetNav").setAttribute("class","active")
        }
    }
}*/

function changeTheme(){
    if (localStorage.theme != undefined){
        theme = localStorage.theme;
        document.getElementsByTagName("body")[0].setAttribute("class",theme);
        if (theme == "light"){
            chartColor = "grey"
            chartText = "black"
            setTimeout(function() {document.getElementById("themeImg").setAttribute("src","./resources/light.svg")},800)
            
        }else{
            chartColor = "black"
            chartText = "lightgrey"
            setTimeout(function() {document.getElementById("themeImg").setAttribute("src","./resources/dark.svg")},800)
        }
    }else{
        localStorage.theme = "light"
        changeTheme()
    }
}
function toggleTheme(){
    document.getElementsByClassName("theme")[0].setAttribute("id","transitionTheme")
    if (localStorage.theme == "light"){
        localStorage.theme = "dark"
    }else if (localStorage.theme == "dark"){
        localStorage.theme=("light")
    }
    changeTheme()
    draw2(null)
    //plotLine(res)
    setTimeout(function(){document.getElementsByClassName("theme")[0].setAttribute("id","")},1000)
}



if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker
        .register("./serviceWorker.js",{scope: './'})
        .then(res => console.log("service worker registered"))
        .catch(err => console.log("service worker not registered", err))
    })
}


window.addEventListener("orientationchange", function(event) {
    if(event.target.screen.orientation.angle == 90){
        document.querySelector("#chart").setAttribute("style","margin-top: 50px")
        pieHeight=290
        draw2()
        document.querySelector(".scroll").setAttribute("style","margin-top:325px")
    }else{
        document.querySelector(".scroll").setAttribute("style","")
        pieHeight=null
        draw2()

        document.querySelector("#chart").setAttribute("style","margin-top: 15px; width: 100vw;")

    }
  });
