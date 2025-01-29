import { useState, useRef } from "react";
import { evaluate, derivative, fraction, format } from "mathjs";
import "katex/dist/katex.min.css";
import katex from "katex";
import Chart from "chart.js/auto";

const TaylorCalculator = () => {
    const [func, setFunc] = useState("sin(x)");
    const [x0, setX0] = useState(0);
    const [n, setN] = useState(5);
    const [taylorSeries, setTaylorSeries] = useState("");
    const [decimalSeries, setDecimalSeries] = useState("");
    const chartRef = useRef(null);

    const factorial = (num) => (num <= 1 ? 1 : num * factorial(num - 1));

    const generateTaylorFunction = () => {
        let fractionSeries = [];
        let decimalSeries = [];
        let taylorExpression = "0";
        let currentFunc = func;

        for (let i = 0; i <= 5; i++) {
            let termValue = evaluate(currentFunc, { x: x0 });
            let termFactorial = factorial(i);
            let coefficient = termValue / termFactorial;

            if (coefficient !== 0) {
                let fractionForm = fraction(coefficient);
                let formattedFraction = fractionForm.d === 1
                    ? `${fractionForm.n}x^{${i}}`
                    : `\\frac{${fractionForm.n}}{${fractionForm.d}} x^{${i}}`;
                let formattedDecimal = `${format(coefficient, { precision: 5 })} x^{${i}}`;

                fractionSeries.push(coefficient < 0 ? `- ${formattedFraction.replace("-", "")}` : `+ ${formattedFraction}`);
                decimalSeries.push(coefficient < 0 ? `- ${formattedDecimal.replace("-", "")}` : `+ ${formattedDecimal}`);
            }
            taylorExpression += ` + (${coefficient}) * (x - ${x0})^${i}`;
            currentFunc = derivative(currentFunc, "x").toString();
        }

        setTaylorSeries(fractionSeries.join(" "));
        setDecimalSeries(decimalSeries.join(" "));
        return taylorExpression;
    };

    const plotGraph = (taylorFunc) => {
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = document.getElementById("taylorChart").getContext("2d");
        const xValues = Array.from({ length: 100 }, (_, i) => i / 10 - 5);
        const originalY = xValues.map((x) => evaluate(func, { x }));
        const taylorY = xValues.map((x) => evaluate(taylorFunc, { x }));

        chartRef.current = new Chart(ctx, {
            type: "line",
            data: {
                labels: xValues,
                datasets: [
                    { label: "Función Original", borderColor: "blue", data: originalY, borderWidth: 2, fill: false },
                    { label: "Aproximación de Taylor", borderColor: "red", borderDash: [5, 5], data: taylorY, borderWidth: 2, fill: false },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { title: { display: true, text: "x" } }, y: { title: { display: true, text: "f(x)" } } },
            },
        });
    };

    const handleCalculate = () => {
        const taylorFunc = generateTaylorFunction();
        plotGraph(taylorFunc);
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h2>Calculadora de Serie de Taylor</h2>
            <label>Función (ej. sin(x), cos(x), exp(x)):</label>
            <input type="text" value={func} onChange={(e) => setFunc(e.target.value)} />
            <label>Punto de expansión (a):</label>
            <input type="number" value={x0} onChange={(e) => setX0(parseFloat(e.target.value))} />
            <label>Número de términos:</label>
            <input type="number" value={n} onChange={(e) => setN(parseInt(e.target.value))} />
            <button onClick={handleCalculate}>Calcular y Graficar</button>
            <h3>Serie de Taylor (Fracción):</h3>
            <div dangerouslySetInnerHTML={{ __html: katex.renderToString(`${taylorSeries}`, { throwOnError: false }) }} />
            <h3>Serie de Taylor (Decimal):</h3>
            <div dangerouslySetInnerHTML={{ __html: katex.renderToString(`${decimalSeries}`, { throwOnError: false }) }} />
            <div style={{ width: "600px", height: "400px", margin: "auto" }}>
                <canvas id="taylorChart"></canvas>
            </div>
        </div>
    );
};

export default TaylorCalculator;
