const demoTareas = [
    { titulo:"Login System", progreso:90, dificultad:4, comentarios:"Auth OK", completada:true },
    { titulo:"Dashboard UI", progreso:70, dificultad:3, comentarios:"Mejoras UI", completada:false },
    { titulo:"Chat IA", progreso:55, dificultad:5, comentarios:"En progreso", completada:false },
    { titulo:"Biblioteca", progreso:30, dificultad:5, comentarios:"Base creada", completada:false },
    { titulo:"Roles System", progreso:100, dificultad:2, comentarios:"Finalizado", completada:true }
];

document.addEventListener("DOMContentLoaded", () => {
    render(demoTareas);
});

function render(data){

    let total = data.length;
    let comp = 0;
    let pen = 0;
    let sum = 0;
    let max = 0;
    let min = 100;

    const tbody = document.getElementById("tabla-body");
    tbody.innerHTML = "";

    data.forEach(t => {

        if(t.completada) comp++;
        else pen++;

        sum += t.progreso;
        max = Math.max(max, t.progreso);
        min = Math.min(min, t.progreso);

        tbody.innerHTML += `
            <tr>
                <td>${t.titulo}</td>
                <td>${t.progreso}%</td>
                <td>${t.dificultad}/5</td>
                <td>${t.comentarios}</td>
            </tr>
        `;
    });

    // KPIs
    document.getElementById("kpi-tareas").innerText = total;
    document.getElementById("kpi-completadas").innerText = Math.round((comp/total)*100) + "%";
    document.getElementById("kpi-pendientes").innerText = pen;
    document.getElementById("kpi-progreso").innerText = Math.round(sum/total) + "%";

    // insights
    document.getElementById("media-dificultad").innerText =
        (data.reduce((a,b)=>a+b.dificultad,0)/total).toFixed(1);

    document.getElementById("media-pasos").innerText =
        (Math.random()*5+4).toFixed(1);

    document.getElementById("max-progreso").innerText = max + "%";
    document.getElementById("min-progreso").innerText = min + "%";

    // CHART SEMI DONUT
    const porcentaje = Math.round((comp/(comp+pen))*100);
    document.getElementById("chart-percent").innerText = porcentaje + "%";

    new Chart(document.getElementById("chart-progreso"), {
        type: "doughnut",
        data: {
            labels: ["Completadas", "Pendientes"],
            datasets: [{
                data: [comp, pen],
                backgroundColor: ["#22c55e", "#ef4444"],
                borderWidth: 0
            }]
        },
        options: {
            cutout: "70%",
            rotation: -90,
            circumference: 180,
            plugins: {
                legend: { display: false }
            }
        }
    });
}