var myChart = InitChart("chart1")
var func_exp_set=["Math.sin(x)", "Math.cos(x)", "Math.tan(x)", "Math.cot(x)"]
option = {
    darkMode: true,
    legend: {},
    grid: [
        { left: '7%', top: '7%', width: '38%', height: '38%' },
        { right: '7%', top: '7%', width: '38%', height: '38%' },
        { left: '7%', bottom: '7%', width: '38%', height: '38%' },
        { right: '7%', bottom: '7%', width: '38%', height: '38%' }
    ],
    tooltip: {trigger: 'axis'},
    xAxis: [
        {gridIndex: 0, name: 'x', max: 6, min: -6},
        {gridIndex: 1, name: 'x', max: 6, min: -6},
        {gridIndex: 2, name: 'x', max: 6, min: -6},
        {gridIndex: 3, name: 'x', max: 6, min: -6}
    ],
    yAxis: [
        {gridIndex: 0, name: 'y', max: 1.2, min: -1.2},
        {gridIndex: 1, name: 'y', max: 1.2, min: -1.2},
        {gridIndex: 2, name: 'y', max: 8, min: -8},
        {gridIndex: 3, name: 'y', max: 8, min: -8}
    ],
    series: [
        {
            name: 'Math.sin(x)',
            type: 'line',
            showSymbol: false,
            chip: false,
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: generateData(-2*Math.PI, 2*Math.PI, "Math.sin(x)")
        },
        {
            name: 'Math.cos(x)',
            type: 'line',
            showSymbol: false,
            chip: false,
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: generateData(-2*Math.PI, 2*Math.PI, "Math.cos(x)")
        },
        {
            name: 'Math.tan(x)',
            type: 'line',
            showSymbol: false,
            chip: false,
            xAxisIndex: 2,
            yAxisIndex: 2,
            data: generateData(-2*Math.PI, 2*Math.PI, "Math.tan(x)")
        },
        {
            name: 'Math.cot(x)',
            type: 'line',
            showSymbol: false,
            chip: false,
            xAxisIndex: 3,
            yAxisIndex: 3,
            data: generateData(-2*Math.PI, 2*Math.PI, "1/Math.tan(x)")
        }
    ]
}
myChart.setOption(option)