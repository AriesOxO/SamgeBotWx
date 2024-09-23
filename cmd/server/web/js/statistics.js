const chartData = {
  data1: {timer: null},
  data2: {timer: null},
  data3: {timer: null}
}
let timer = null

function fetchComments(interfaceName, sortType, limit) {
  for (let key in chartData) {
    if (chartData[key].timer) {
      clearInterval(chartData[key].timer)
      chartData[key].timer = null
    }
  }
  const wxNickName = document.getElementById('wxNickName').value;
  const novelTitle = document.getElementById('novelTitle').value;
  const numberOfRaces = document.getElementById('numberOfRaces').value;
  let url = 'http://114.55.235.157:8888/api/' + interfaceName + '?';
  const groupTypeValues = [1, 2, 3]; // GroupType的三种取值

  // 定义一个数组来收集所有的 Promise
  const promises = [];
  groupTypeValues.forEach((groupType, index) => {
    createSvgDom(index)
    let currentUrl = url; // 每次循环重新初始化URL
    if (wxNickName.trim() !== '') {
      currentUrl += `&wxNickName=${wxNickName}`;
    }
    if (novelTitle.trim() !== '') {
      currentUrl += `&novelTitle=${novelTitle}`;
    }
    if (numberOfRaces.trim() !== '') {
      currentUrl += `&number=${numberOfRaces}`;
    }
    // currentUrl += `&sortType=${sortType}`;
    currentUrl += `&groupType=${groupType}`;
    currentUrl += `&sortType=2`; // 假设sortType始终为1

    // 将 fetch 请求的结果加入到 promises 数组中
    promises.push(
      fetch(currentUrl)
      .then(response => response.json())
      .then(data => {
        if (groupType === 1) {
          chartData.data1 = {
            title: '评论者排名',
            data: data ? data : [],
            type: 0,
            index: 1
          };
        } else if (groupType === 2) {
          chartData.data2 = {
            title: '小说被评排名',
            data: data ? data : [],
            type: 1,
            index: 1
          };
        } else if (groupType === 3) {
          chartData.data3 = {
            title: '历届评论排名',
            data: data ? data : [],
            type: 2,
            index: 1
          };
        }
      })
    );
  });

  // 使用 Promise.all 等待所有请求完成
  Promise.all(promises).then(() => {
    for (let i = 0; i < 3; i++) {
      setChartData(i)
    }
  }).catch(errors => {
    // 处理可能出现的错误
    console.error('Some requests failed:', errors);
  });
}


function createSvgDom() {
  for (let i = 0; i < 3; i++) {
    const chartsBox = document.querySelectorAll('.charts-li-content');
    const targetChartsBox = chartsBox[i];
    const width = targetChartsBox.clientWidth
    const isMoBile = window.innerWidth <= 1200
    const height = isMoBile ? 650 : targetChartsBox.clientHeight
    const svg =
      `<svg width="${width}" height="${height}" class="dv-border-svg-container">
        <path fill="transparent" stroke="#6586ec" d="
              M 5 20 L 5 10 L 12 3  L 60 3 L 68 10
              L ${width - 20} 10 L ${width - 5} 25
              L ${width - 5} ${height - 5} L 20 ${height - 5}
              L 5 ${height - 20} L 5 20
          " />
        <path fill="transparent" stroke-width="3" stroke-linecap="round" stroke-dasharray="10, 5"
          stroke="#6586ec" d="M 16 9 L 61 9" />
        <path fill="transparent" stroke="#6586ec" d="M 5 20 L 5 10 L 12 3  L 60 3 L 68 10" />
        <path fill="transparent" stroke="#2cf7fe" d="M ${width - 5} ${height - 30} L ${width - 5} ${height - 5} L ${
            width - 30} ${height - 5}" />
      </svg>`
    if (targetChartsBox) {
      const existingSvgDiv = targetChartsBox.querySelector('div.svg');
      if (existingSvgDiv) {
        existingSvgDiv.innerHTML = svg
      } else {
        const newSvgDiv = document.createElement('div');
        newSvgDiv.className = 'svg';
        newSvgDiv.innerHTML = svg;
        targetChartsBox.appendChild(newSvgDiv);
      }
    } else {
      console.error('chartsBox element with the specified type does not exist.');
    }
  }
}

// 数据切片
function getPageData(dataArray, pageNum = 1, pageSize = 20) {
  if(dataArray.length == 0){
    
  }
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageData = dataArray.slice(startIndex, endIndex);
  return pageData;
}

function setChartData(index) {
  const key = 'data' + (index + 1)
  if (chartData[key].timer) {
    clearInterval(chartData[key].timer)
  }
  const title = chartData[key].title
  const option = getPageData(chartData[key].data, chartData[key].index)
  chartData[key].index = getNextPage(chartData[key].data, chartData[key].index)
  chartInit(title, option, index)
}

function getNextPage(arr, pageNum) {
  const itemsPerPage = 20;
  const totalPages = Math.ceil(arr.length / itemsPerPage);
  const startIdx = (pageNum - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  if (pageNum < 1 || pageNum > totalPages) {
    return 1
  }
  const nextPageNum = (pageNum % totalPages) + 1;
  return nextPageNum
}

window.addEventListener('resize', () => {
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    createSvgDom()
  }, 200)
})

function calculatePercentage(data) {
  const maxValue = Math.max(...data.map(item => item.value));
  return data.map(item => ({
    ...item,
    percentage: (item.value / maxValue * 100).toFixed(2) + '%'
  }));
}

function generateIntervals(data) {
  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = 0;
  const step = (maxValue - minValue) / 5;
  const intervals = [];
  for (let i = 0; i <= 5; i++) {
    intervals.push(Math.round(minValue + i * step)); // 保留两位小数
  }
  return intervals;
}

function chartInit(title, list, type) {
  const data = list.map(item => {
    const maxValue = Math.max(...list.map(item => item.Count));
    return {
      value: item.Count,
      name: item.WxNickName,
      percentage: (item.Count / maxValue * 100).toFixed(2) + '%'
    }
  })
  const intervals = generateIntervals(data)
  const colors = [
    "#6586ec",
    "#37a2da",
    "#32c5e9",
    "#67e0e3",
    "#9fe6b8",
    "#ffdb5c",
    "#fffb85",
    "#ff9f7f",
    "#fb7293",
    "#fb2856",
    "#ffaaff",
    "#55ffff",
    "#aaffff",
    "#aaff7f",
    "#00ff00",
    "#aaaa00",
    "#00aa00",
    "#aa5500",
    "#aa557f",
    "#ff007f",
  ]
  const chartDom = document.querySelectorAll('.chart-dom')[type]
  const footDom = document.querySelectorAll('.chart-footer')[type]
  chartDom.innerHTML = ''
  data.forEach((item, index) => {
    const element = document.createElement('div');
    element.className = 'bar-chart-li'
    element.innerHTML = `
        <div class="bar-chart-title" title="${item.name}">${item.name}</div>
        <div class="bar-chart-box">
          <div class="bar-chart-container" style="width: ${item.percentage};background-color: ${colors[index]}"></div>
          <div class="bar-chart-count">${item.value}</div>
        </div>
    `;
    chartDom.appendChild(element);
  })
  
  if(data.length == 0) {
    footDom.innerHTML = `<div>空</div>`
  }else{
    let footer = ''
    intervals.forEach(item => {
      footer += `<div>${item}</div>`
    })
    footDom.innerHTML = footer
  }
  const isMoBile = window.innerWidth <= 1200
  // 移动端十秒更新一次数据
  if(isMoBile){
    const key = 'data' + (type + 1)
    if (chartData[key].timer) {
      clearInterval(chartData[key].timer)
      chartData[key].timer = null
    }
    chartData[key].timer = setInterval(() => {
      setChartData(type)
    }, 10000)
  }else{
    start(type)
  }
}


function start(type) {
  const key = 'data' + (type + 1)
  if (chartData[key].timer) {
    clearInterval(chartData[key].timer)
    chartData[key].timer = null
  }
  const chartDom = document.querySelectorAll('.chart-dom')[type]
  chartDom.onmouseover = () => {
    clearInterval(chartData[key].timer)
    chartData[key].timer = null
  }
  chartDom.onmouseout = () => {
    start(type)
  };
  if (chartDom.clientHeight >= chartDom.scrollHeight) {
    return
  }
  
  chartData[key].timer = setInterval(() => {
    chartDom.scrollTop += 1
    if (chartDom.clientHeight + chartDom.scrollTop == chartDom.scrollHeight) {
      chartDom.scrollTop = 0
      setChartData(type)
    }
  }, 50)
}