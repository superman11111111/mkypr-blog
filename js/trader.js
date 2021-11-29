// var baseUrl = "http://62.171.165.127:3333"
var updateInterv = 3000;
var baseUrl = "http://127.0.0.1:3333"
var logDiv = document.createElement('div');
var logTable =  document.createElement('table');
logDiv.className = 'box';
var profitDiv = document.createElement('div');
profitDiv.className = 'box';
var signalsDiv = document.createElement('div');
signalsDiv.className = 'box';
var signalsTable =  document.createElement('table');
var tradesDiv = document.createElement('div');
tradesDiv.className = 'box';
var tradesTable =  document.createElement('table');

function resize() {
    document.body.appendChild(logDiv);
    document.body.appendChild(signalsDiv);
    document.body.appendChild(tradesDiv);
    document.body.appendChild(profitDiv);
    update();
    setInterval(function () {
        update();
    }, updateInterv);
}

function req(url, callback) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function () {
        callback(this.responseText);
    });
    oReq.open("GET", url);
    oReq.send();
}


function update() {
    console.log('update');
    let logUrl = baseUrl + "/log" 
    let profitUrl = baseUrl + "/profit" 
    let signalsUrl = baseUrl + "/signals" 
    let tradesUrl =  baseUrl + "/trades" 
    req(logUrl, function (responseText) {
        let jj = JSON.parse(responseText);
        let arr = Array.from(jj).reverse();
        let i = arr.length;
        logDiv.innerHTML = '';
        logTable.innerHTML = '';
        arr.forEach(e => {
            let tr = document.createElement('tr')
            let td1 = document.createElement('td')
            td1.innerHTML = i;
            let td2 = document.createElement('td')
            td2.innerHTML = e
            tr.appendChild(td1);
            tr.appendChild(td2);
            logTable.appendChild(tr);
            i--; 
        });
        let p = document.createElement('p')
        p.className = 'p1';
        p.innerHTML = 'log';
        logDiv.appendChild(p)
        logDiv.appendChild(logTable);
    });
    req(signalsUrl, function (responseText) {
        let jj = JSON.parse(responseText)
        let arr = Array.from(jj);
        let i = arr.length;
        signalsDiv.innerHTML = '';
        signalsTable.innerHTML = '';
        arr.forEach(e => {
            let tr = document.createElement('tr')
            let td1 = document.createElement('td')
            td1.innerHTML = i;
            let td2 = document.createElement('td')
            td2.innerHTML = e
            tr.appendChild(td1);
            tr.appendChild(td2);
            signalsTable.appendChild(tr);
            i--; 
        });
        let p = document.createElement('p')
        p.className = 'p1';
        p.innerHTML = 'signals';
        signalsDiv.appendChild(p)
        signalsDiv.appendChild(signalsTable);
    });
    req(tradesUrl, function (responseText) {
        let jj = JSON.parse(responseText)
        let arr = Array.from(jj);
        let i = arr.length;
        tradesDiv.innerHTML = '';
        tradesTable.innerHTML = '';
        arr.forEach(e => {
            let tr = document.createElement('tr')
            let td1 = document.createElement('td')
            td1.innerHTML = i;
            let td2 = document.createElement('td')
            td2.innerHTML = e
            tr.appendChild(td1);
            tr.appendChild(td2);
            tradesTable.appendChild(tr);
            i--; 
        });
        let p = document.createElement('p')
        p.className = 'p1';
        p.innerHTML = 'trades';
        tradesDiv.appendChild(p)
        tradesDiv.appendChild(tradesTable);
    });
    req(profitUrl, function (responseText) {
        profitDiv.innerHTML = '';
        let jj = JSON.parse(responseText)
        let p = document.createElement('p')
        p.innerHTML = String(jj);
        
        let p1 = document.createElement('p')
        p1.className = 'p1';
        p1.innerHTML = 'profit';
        profitDiv.appendChild(p1)
        profitDiv.appendChild(p);
    });
    
}


window.addEventListener('resize', resize())