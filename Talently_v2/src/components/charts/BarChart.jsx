// src/components/charts/BarChart.jsx
// Gráfico de barras — matches por oferta
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import './Charts.css';

Chart.register(...registerables);

export default function BarChart({ labels = [], data = [], title, subtitle }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Destruir instancia previa si existe
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');

        // Obtener CSS variables
        const styles = getComputedStyle(document.documentElement);
        const primary = styles.getPropertyValue('--primary').trim() || '#1392EC';
        const primaryLight = styles.getPropertyValue('--primary-light').trim() || '#60BDFF';
        const textSecondary = styles.getPropertyValue('--text-secondary').trim() || '#636E72';
        const border = styles.getPropertyValue('--border').trim() || '#E8ECEF';

        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Matches',
                    data,
                    backgroundColor: primaryLight + '80',
                    borderColor: primary,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1a1a1a',
                        titleFont: { family: 'Inter', weight: '600' },
                        bodyFont: { family: 'Inter' },
                        cornerRadius: 8,
                        padding: 10,
                    },
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: textSecondary,
                            font: { family: 'Inter', size: 11 },
                            maxRotation: 45,
                        },
                        border: { display: false },
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: border,
                            drawBorder: false,
                        },
                        ticks: {
                            color: textSecondary,
                            font: { family: 'Inter', size: 11 },
                            stepSize: 1,
                        },
                        border: { display: false },
                    },
                },
            },
        });

        // Cleanup: destruir instancia al desmontar
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [labels, data]);

    return (
        <div className="chart-container">
            {title && <h4 className="chart-container__title">{title}</h4>}
            {subtitle && <p className="chart-container__subtitle">{subtitle}</p>}
            <div style={{ position: 'relative', height: '200px' }}>
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
}
