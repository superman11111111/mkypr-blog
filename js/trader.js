// var baseUrl = "http://62.171.165.127:3333"
var updateInterv = 10 * 1000;
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

var outerDiv = document.createElement('div');
var plotDiv = document.createElement('div');
var calctimesDiv = document.createElement('div');
var latenciesDiv = document.createElement('div');
plotDiv.className = 'box';
calctimesDiv.className = 'box';
latenciesDiv.className = 'box';
outerDiv.appendChild(plotDiv);
outerDiv.appendChild(calctimesDiv);
outerDiv.appendChild(latenciesDiv);

var plotSelect = document.createElement('select');

var roiDiv = document.createElement('div');
roiDiv.className = 'box';

function resize() {
    document.body.appendChild(plotSelect);
    document.body.appendChild(outerDiv);
    document.body.appendChild(logDiv);
    document.body.appendChild(signalsDiv);
    document.body.appendChild(tradesDiv);
    document.body.appendChild(profitDiv);
    document.body.appendChild(roiDiv); 
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
    req(baseUrl + "/log", function (responseText) {
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
    req(baseUrl + "/signals", function (responseText) {
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
    req(baseUrl + "/trades", function (responseText) {
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
    req(baseUrl + "/profit", function (responseText) {
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
    req(baseUrl + "/data", function (responseText) {
        let jj = JSON.parse(responseText)
        plotSelect.addEventListener('change', function (ev) {
            console.log(this.ev);
            let pair = this.value; 
            let data = jj[pair];
            let Y1 = data[0];
            let Y2 = data[1];
            let Y3 = data[2];
            let Y4 = data[3];
            let X = Array(Y1.length).fill().map((_, idx) => idx)
            let layout = {
                title: {
                text: pair,
                font: {
                    family: 'Courier New, monospace',
                    size: 24
                },
                xref: 'paper',
                x: 0.05,
                },
                xaxis: {
                title: {
                    text: 'time in minutes',
                    font: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: '#7f7f7f'
                    }
                },
                },
                yaxis: {
                title: {
                    text: 'usd',
                    font: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: '#7f7f7f'
                    }
                }
                }
            };
            Plotly.newPlot(
                plotDiv, 
                [
                    {
                        x: X,
                        y: Y1,
                        name: 'y',
                        type: 'line'
                    },
                    {
                        x: X,
                        y: Y2,
                        name: 'emabase',
                        type: 'line'
                    },
                    {
                        x: X,
                        y: Y3,
                        name: 'emaY',
                        type: 'line'
                    },
                    // {
                    //     x: X,
                    //     y: Y4,
                    //     name: 'emadiff',
                    //     type: 'line'
                    // },
                ],
                layout
            );
        })
        plotSelect.innerHTML = '';
        Object.entries(jj).forEach(e => {
            let pair = e[0]; 
            let opt = document.createElement('option')
            opt.value = pair;
            opt.innerHTML = pair;
            plotSelect.add(opt);
        });
    });
    req(baseUrl + "/calctimes", function (responseText) {
        let jj = JSON.parse(responseText); 
        let Y = Array.from(jj)
        let X = Array(Y.length).fill().map((_, idx) => idx)
        let layout = {
            title: {
              text: 'calctimes',
              font: {
                family: 'Courier New, monospace',
                size: 24
              },
              xref: 'paper',
              x: 0.05,
            },
            yaxis: {
              title: {
                text: 'time in seconds',
                font: {
                  family: 'Courier New, monospace',
                  size: 18,
                  color: '#7f7f7f'
                }
              }
            }
          };
        Plotly.newPlot(calctimesDiv, 
            [{
                x: X,
                y: Y,
                name: 'Name of Trace 2',
                type: 'line'
            }],
            layout
        );
    });
    req(baseUrl + "/latencies", function (responseText) {
        let jj = JSON.parse(responseText); 
        let data = Array.from(jj);
        let X = data.map((d, _) => d[0]);
        let Y = data.map((d, _) => d[1]);
        let layout = {
            title: {
              text: 'latencies',
              font: {
                family: 'Courier New, monospace',
                size: 24
              },
              xref: 'paper',
              x: 0.05,
            },
            yaxis: {
              title: {
                text: 'latency in ms',
                font: {
                  family: 'Courier New, monospace',
                  size: 18,
                  color: '#7f7f7f'
                }
              }
            }
          };
        Plotly.newPlot(latenciesDiv, 
            [{
                x: X,
                y: Y,
                name: 'Name of Trace 2',
                mode: 'markers', 
                type: 'scatter'
            }],
            layout
        );
    });
    req(baseUrl + "/roi", function (responseText) {
        let jj = JSON.parse(responseText);
        roiDiv.innerHTML = '';
        let p = document.createElement('p');
        p.innerHTML = String(jj);
        
        let p1 = document.createElement('p')
        p1.className = 'p1';
        p1.innerHTML = 'roi';
        roiDiv.appendChild(p1)
        roiDiv.appendChild(p);
    });
    
}


window.addEventListener('resize', resize())
