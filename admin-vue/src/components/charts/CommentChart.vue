<template>
  <div class="chart-container">
    <v-chart class="chart" :option="option" :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

interface Props {
  type: 'pie' | 'bar' | 'line'
  data: any[]
  title?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  loading: false,
})

const option = computed(() => {
  const baseOption = {
    title: {
      text: props.title,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
  }

  if (props.type === 'pie') {
    return {
      ...baseOption,
      series: [
        {
          name: '统计',
          type: 'pie',
          radius: '50%',
          data: props.data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    }
  }

  if (props.type === 'bar') {
    return {
      ...baseOption,
      legend: {
        orient: 'horizontal',
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: props.data.map((item) => item.name),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '数量',
          type: 'bar',
          data: props.data.map((item) => item.value),
          itemStyle: {
            color: '#409EFF',
          },
        },
      ],
    }
  }

  if (props.type === 'line') {
    return {
      ...baseOption,
      legend: {
        orient: 'horizontal',
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: props.data.map((item) => item.name),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '数量',
          type: 'line',
          data: props.data.map((item) => item.value),
          smooth: true,
          itemStyle: {
            color: '#409EFF',
          },
        },
      ],
    }
  }

  return baseOption
})
</script>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  height: 300px;

  .chart {
    width: 100%;
    height: 100%;
  }
}
</style>
