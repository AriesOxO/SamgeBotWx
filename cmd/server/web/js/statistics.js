const chartData = {
  data1: null,
  data2: null,
  data3: null
}
let timer = null

function fetchComments(interfaceName, sortType, limit) {
  const wxNickName = document.getElementById('wxNickName').value;
  const novelTitle = document.getElementById('novelTitle').value;
  const numberOfRaces = document.getElementById('numberOfRaces').value;
  let url = 'http://114.55.235.157:8888/api/' + interfaceName + '?';
  const groupTypeValues = [1, 2, 3]; // GroupType的三种取值

  // 定义一个数组来收集所有的 Promise
  const promises = [];

  groupTypeValues.forEach(groupType => {
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
    currentUrl += `&sortType=${sortType}`;
    currentUrl += `&groupType=${groupType}`;
    currentUrl += `&sortType=1`; // 假设sortType始终为1

    // 将 fetch 请求的结果加入到 promises 数组中
    promises.push(
      fetch(currentUrl)
      .then(response => response.json())
      .then(data => {
        if (groupType === 1) {
          chartData.data1 = {
            title: '评论者排名',
            data,
            type: 0,
            index: 1
          };
        } else if (groupType === 2) {
          chartData.data2 = {
            title: '小说被评排名',
            data,
            type: 1,
            index: 1
          };
        } else if (groupType === 3) {
          chartData.data3 = {
            title: '历届评论排名',
            data,
            type: 2,
            index: 1
          };
        }
      })
    );
  });

  // 使用 Promise.all 等待所有请求完成
  Promise.all(promises).then(() => {
    setChartData()
  }).catch(errors => {
    // 处理可能出现的错误
    console.error('Some requests failed:', errors);
  });
}

// 数据切片
function getPageData(dataArray, pageNum = 1, pageSize = 10) {
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageData = dataArray.slice(startIndex, endIndex);
  return pageData;
}

function setChartData() {
  for (let key in chartData) {
    const title = chartData[key].title
    const option = getPageData(chartData[key].data, chartData[key].index)
    chartData[key].index = getNextPage(chartData[key].data, chartData[key].index)
    chartInit(title, option, chartData[key].type)
  }
  timer = setTimeout(() => {
    setChartData()
  }, 3000)
}

function getNextPage(arr, pageNum) {
  const itemsPerPage = 10;
  const totalPages = Math.ceil(arr.length / itemsPerPage);
  const startIdx = (pageNum - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  if (pageNum < 1 || pageNum > totalPages) {
    throw new Error('Invalid page number');
  }
  const nextPageNum = (pageNum % totalPages) + 1;
  return nextPageNum
}

window.addEventListener('resize', () => {
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    setChartData()
  }, 200)
})

function chartInit(title, list, type) {
  const data = list.map(item => {
    return {
      value: item.Count,
      name: item.WxNickName
    }
  })
  const chartDom = document.querySelectorAll('.chart-dom')
  chartDom.innerHTML = ''
  const myChart = echarts.init(chartDom[type]);
  const option = {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: function(d) {
        return `${d.seriesName}<br/>${d.marker}  ${d.data.name + (type == 2 ? '届' : '')}: ${d.data.value}`
      }
    },
    series: [{
        name: title,
        type: 'pie',
        radius: '50%',
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          position: 'inside',
          textStyle: {
            fontWeight: 300,
            fontSize: 10
          },
          formatter: function(d) {
            return '数量:' + d.data.value
          }
        }
      },
      {
        name: title,
        type: 'pie',
        radius: '50%',
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          position: 'outside', //标签的位置
          textStyle: {
            fontWeight: 300,
            fontSize: 14 //文字的字体大小
          },
          formatter: function(d) {
            return type == 0 ? '笔名:' + d.data.name : type == 1 ? '名称' + d.data.name : '届数:' + d.data.name
          }
        }
      }
    ]
  };
  option && myChart.setOption(option);
}