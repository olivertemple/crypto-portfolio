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

try{
    data = JSON.parse(localStorage.Data)
    displayPrice()
    draw2(1000)
    showAssets()
}catch(error){
    console.log("no stored data")
}

key = "BJt2jYCTXZKvMJkrrhXRxVa5qtwpUuIL0MHtZiZFpkw810n3Mei3Xbz7QzdQlMEm"
secret = "UblqJgYTOf0WAvH5HjZNAj3RJFu8NbowVwOilHscVDaB7dY0gAojNgLoVY4PuLRe"
function loadData(animate){
    var req = new XMLHttpRequest();
    req.open("POST", ("http://192.168.1.117:5000/"), true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.onload = function(){
            data = JSON.parse(req.response)
            data.time = new Date()
            localStorage.Data = JSON.stringify(data)
            displayPrice()
            draw2(animate)
            showAssets()
        }
        req.send(JSON.stringify({
            "key": localStorage.APIkey, "secret":localStorage.APIsecret
        }));
        req.onerror = function(){
            showError()
        }

    var orderReq = new XMLHttpRequest();
    orderReq.open("POST", ("http://192.168.1.117:5000/orders"), true);
    orderReq.setRequestHeader('Content-Type', 'application/json');
    orderReq.onload = function(){
        orders = JSON.parse(orderReq.response)
        showOrders()
    }
    orderReq.send(JSON.stringify({
        "key": localStorage.APIkey, "secret":localStorage.APIsecret
    }));
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
        dict.name = item.asset
        dict.y = ((parseFloat(item.value))/(data.total))*100
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
            backgroundColor: "grey",
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
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
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
    data.assets.forEach(function(item){
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
        document.getElementById("items").appendChild(itemDiv)
    })
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
        amountHeading.appendChild(document.createTextNode(item.origQty))
        priceHeading = document.createElement("h2")
        priceSpan = document.createElement("span")
        priceSpan.appendChild(document.createTextNode("Price: "))

        priceHeading.appendChild(priceSpan)
        if (parseFloat(item.price) < 1 ){
            priceHeading.appendChild(document.createTextNode(Number.parseFloat(item.price).toPrecision(5)))
        }else if (parseFloat(item.price) < 100 && parseFloat(item.price) >= 1){
            priceHeading.appendChild(document.createTextNode(Number.parseFloat(item.price).toPrecision(5)))
        }else{
            priceHeading.appendChild(document.createTextNode(Number.parseFloat(item.price).toPrecision(7)))
        }
        
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

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker
        .register("./serviceWorker.js",{scope: './'})
        .then(res => console.log("service worker registered"))
        .catch(err => console.log("service worker not registered", err))
    })
}