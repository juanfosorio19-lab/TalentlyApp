// src/components/charts/LineChart.jsx
// Gráfico de línea — actividad de swipes por semana
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import './Charts.css';

Chart.register(...registerables);

export default function LineChart({ labels = [], data = [], title, subtitle }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        const styles = getComputedStyle(document.documentElement);
        const primary = styles.getPropertyValue('--primary').trim() || '#1392EC';
        const primaryLight = styles.getPropertyValue('--primary-light').trim() || '#60BDFF';
        const textSecondary = styles.getPropertyValue('--text-secondary').trim() || '#636E72';
        const border = styles.getPropertyValue('--border').trim() || '#E8ECEF';
        const tooltipBg = styles.getPropertyValue('--chart-tooltip-bg').trim() || '#1A1A1A';
        const tooltipText = styles.getPropertyValue('--chart-tooltip-text').trim() || '#FFFFFF';
        const pointBorder = styles.getPropertyValue('--chart-point-border').trim() || '#FFFFFF';

        // Gradiente de fondo
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, primaryLight + '40');
        gradient.addColorStop(1, primaryLight + '05');

        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Swipes',
                    data,
                    borderColor: primary,
                    backgroundColor: gradient,
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: primary,
                    pointBorderColor: pointBorder,
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: tooltipBg,
                        titleColor: tooltipText,
                        bodyColor: tooltipText,
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
                        },
                        border: { display: false },
                    },
                },
            },
        });

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
