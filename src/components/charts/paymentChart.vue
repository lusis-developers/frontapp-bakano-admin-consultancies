<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Chart, registerables, type ChartItem } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

// Registramos los módulos de Chart.js solo una vez.
Chart.register(...registerables, ChartDataLabels)

// --- DEFINICIÓN DE PROPS ---
const props = defineProps<{
  paidByLink: number
  paidByTransfer: number
  pending: number
  // 💡 1. AÑADIMOS COLORES COMO PROPS PARA MÁXIMA REUTILIZACIÓN
  // Proporcionamos valores por defecto como fallback.
  colors?: {
    link: string
    transfer: string
    pending: string
  }
}>()

// --- ESTADO Y REFS ---
const chartRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// --- LÓGICA DEL GRÁFICO ---
const createOrUpdateChart = () => {
  if (!chartRef.value) return

  const chartData = {
    labels: ['Por Link', 'Por Transferencia', 'Pendientes'],
    datasets: [
      {
        label: 'Pagos',
        data: [props.paidByLink, props.paidByTransfer, props.pending],
        backgroundColor: [
          props.colors?.link || '#85529C', // Bakano Purple
          props.colors?.transfer || '#3BB77E', // Bakano Green
          props.colors?.pending || '#E6285C', // Bakano Pink
        ],
        borderColor: '#ffffff',
        borderWidth: 4,
        hoverOffset: 15,
        hoverBorderColor: '#ffffff',
      },
    ],
  }

  // Si ya existe una instancia del gráfico, la actualizamos.
  if (chartInstance) {
    chartInstance.data = chartData
    chartInstance.update()
  } else {
    // Si no, creamos una nueva.
    chartInstance = new Chart(chartRef.value as ChartItem, {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false, // Permite controlar el tamaño con CSS
        cutout: '70%', // Hacemos el donut más delgado y moderno
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#191423', // Usamos color de la marca
              font: { size: 14, family: "'Inter', sans-serif" },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: '#191423',
            titleFont: { size: 14, family: "'Mosk', sans-serif", weight: 'bold' },
            bodyFont: { size: 12, family: "'Inter', sans-serif" },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const label = context.label || ''
                const value = context.parsed
                return ` ${label}: ${value} pago(s)`
              },
            },
          },
          datalabels: {
            color: '#ffffff',
            font: { weight: 'bold', size: 14, family: "'Mosk', sans-serif" },
            formatter: (value, ctx) => {
              if (value === 0) return '' // No mostrar etiqueta si el valor es 0
              const sum = ctx.chart.data.datasets[0].data.reduce((a: any, b: any) => a + b, 0)
              const percentage = (value / sum) * 100
              // Solo mostrar porcentaje si es significativo
              return percentage > 5 ? `${percentage.toFixed(0)}%` : ''
            },
          },
        },
      },
    })
  }
}

// --- CICLO DE VIDA ---
// Observamos cambios en las props para actualizar el gráfico dinámicamente.
watch(() => [props.paidByLink, props.paidByTransfer, props.pending], () => {
  createOrUpdateChart()
})

onMounted(() => {
  createOrUpdateChart()
})

// Es una buena práctica destruir la instancia del gráfico al desmontar el componente.
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<style scoped lang="scss">
// 💡 2. AÑADIMOS ESTILOS PROFESIONALES Y MODERNOS
.chart-container {
  position: relative;
  width: 100%;
  max-width: 350px; // Un tamaño máximo para mantener la estética
  height: 350px; // Altura fija para un aspect ratio consistente
  margin: 0 auto; // Centramos el gráfico
}
</style>