function generateData(bot, top, exp) {
    let data = [];
    for (let i = bot; i <= top; i += 0.001) {
        data.push([i, eval(exp)]);
    }
    return data;
}

function generateDataSet(bot, top, fes) {
    var ds = []
    for (i in func_exp_set) {
        ds.push({name: fes[i],type: "line", showSymbol: false, chip: false, data: generateData(bot, top, fes[i])})
    }
    return ds
}

function InitChart(ele_id) {
    var chartDom = document.getElementById(ele_id);
    return echarts.init(chartDom);
}

function RealLog(x, y) {
    return Math.log(y) / Math.log(x);
}
  