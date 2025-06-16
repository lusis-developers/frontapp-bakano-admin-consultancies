<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Chart, registerables } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
Chart.register(...registerables, ChartDataLabels)

const chartRef = ref<HTMLCanvasElement | null>(null)

const props = defineProps<{
  paidByLink: number
  paidByTransfer: number
  pending: number
}>()

onMounted(() => {
  if (chartRef.value) {
    new Chart(chartRef.value, {
      type: 'doughnut',
      data: {
        labels: ['Por Link', 'Por Transferencia', 'Pendientes'],
        datasets: [
          {
            label: 'Pagos',
            data: [props.paidByLink, props.paidByTransfer, props.pending],
            backgroundColor: ['#e07b91', '#4caf50', '#ffb74d'],
            borderWidth: 2,
            borderColor: '#fff',
            hoverOffset: 12
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#444',
              font: {
                size: 14,
                weight: 'bold'
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ''
                const value = context.parsed
                return `${label}: ${value} pagos`
              }
            }
          },
          datalabels: {
            color: '#fff',
            font: {
              weight: 'bold'
            },
            formatter: (value, ctx) => {
              const sum = ctx.chart.data.datasets[0].data.reduce((a: any, b: any) => a + b, 0)
              const percentage = ((value / sum) * 100).toFixed(1) + '%'
              return percentage
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    })
  }
})
</script>

<template>
  <div class="payment-chart">
    <h3 class="chart-title">Distribución de Pagos del Mes</h3>
    <canvas ref="chartRef" width="300" height="300"></canvas>
  </div>
</template>

<style scoped>
.payment-chart {
  max-width: 420px;
  text-align: center;
}

.chart-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 600;
}
</style>
