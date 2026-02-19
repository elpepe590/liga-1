const equipos = [
  "ADT",
  "Alianza Atlético",
  "Alianza Lima",
  "Atlético Grau",
  "Cienciano",
  "Comerciantes Unidos",
  "Cusco FC",
  "Deportivo Garcilaso",
  "Deportivo Moquegua",
  "FBC Melgar",
  "UTC",
  "Juan Pablo II",
  "Los Chankas",
  "Sport Boys",
  "Sport Huancayo",
  "Sporting Cristal",
  "Universitario",
  "Unión Comercio"
];

let fixtureApertura = [];
let fixtureClausura = [];
let tabla = {};
let torneoActual = "apertura";

// ===== GENERADOR ROUND ROBIN =====
function generarFixtureBase() {
  let teams = [...equipos];
  let jornadas = teams.length - 1;
  let mitad = teams.length / 2;
  let fixture = [];

  for (let j = 0; j < jornadas; j++) {
    let fecha = [];

    for (let i = 0; i < mitad; i++) {
      fecha.push({
        local: teams[i],
        visita: teams[teams.length - 1 - i],
        gl: null,
        gv: null
      });
    }

    fixture.push(fecha);
    teams.splice(1, 0, teams.pop());
  }

  return fixture;
}

function generarClausura(apertura) {
  return apertura.map(fecha =>
    fecha.map(p => ({
      local: p.visita,
      visita: p.local,
      gl: null,
      gv: null
    }))
  );
}

// ===== RENDER FECHAS =====
function renderFechas() {
  const fechaSelect = document.getElementById("fechaSelect");
  fechaSelect.innerHTML = "";

  let fixture = torneoActual === "apertura"
    ? fixtureApertura
    : fixtureClausura;

  fixture.forEach((_, i) => {
    let option = document.createElement("option");
    option.value = i;
    option.textContent = "Fecha " + (i + 1);
    fechaSelect.appendChild(option);
  });
}

// ===== RENDER FIXTURE =====
function renderFixture(fechaIndex) {
  const div = document.getElementById("fixture");
  div.innerHTML = "";

  let fixture = torneoActual === "apertura"
    ? fixtureApertura
    : fixtureClausura;

  fixture[fechaIndex].forEach((p, index) => {
    div.innerHTML += `
      <div>
        ${p.local}
        <input type="number" min="0" value="${p.gl ?? ""}"
          onchange="actualizar(${fechaIndex},${index},this.value,'local')">
        -
        <input type="number" min="0" value="${p.gv ?? ""}"
          onchange="actualizar(${fechaIndex},${index},this.value,'visita')">
        ${p.visita}
      </div>
    `;
  });
}

// ===== ACTUALIZAR =====
function actualizar(fecha, partido, valor, tipo) {
  let fixture = torneoActual === "apertura"
    ? fixtureApertura
    : fixtureClausura;

  if (tipo === "local") {
    fixture[fecha][partido].gl = parseInt(valor);
  } else {
    fixture[fecha][partido].gv = parseInt(valor);
  }

  calcularTabla();
}

// ===== CALCULAR TABLA =====
function calcularTabla() {
  tabla = {};

  equipos.forEach(e => {
    tabla[e] = { pts: 0, gf: 0, gc: 0, pj: 0 };
  });

  let fixture = torneoActual === "apertura"
    ? fixtureApertura
    : fixtureClausura;

  fixture.forEach(fecha => {
    fecha.forEach(p => {
      if (p.gl !== null && p.gv !== null) {

        tabla[p.local].pj++;
        tabla[p.visita].pj++;

        tabla[p.local].gf += p.gl;
        tabla[p.local].gc += p.gv;

        tabla[p.visita].gf += p.gv;
        tabla[p.visita].gc += p.gl;

        if (p.gl > p.gv) tabla[p.local].pts += 3;
        else if (p.gl < p.gv) tabla[p.visita].pts += 3;
        else {
          tabla[p.local].pts += 1;
          tabla[p.visita].pts += 1;
        }
      }
    });
  });

  renderTabla();
}

// ===== RENDER TABLA =====
function renderTabla() {
  let tbody = document.querySelector("#tabla tbody");
  tbody.innerHTML = "";

  let orden = Object.entries(tabla).sort((a, b) =>
    b[1].pts - a[1].pts ||
    (b[1].gf - b[1].gc) - (a[1].gf - a[1].gc) ||
    b[1].gf - a[1].gf
  );

  orden.forEach((equipo, i) => {
    let dg = equipo[1].gf - equipo[1].gc;

    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${equipo[0]}</td>
        <td>${equipo[1].pj}</td>
        <td>${equipo[1].pts}</td>
        <td>${equipo[1].gf}</td>
        <td>${equipo[1].gc}</td>
        <td>${dg}</td>
      </tr>
    `;
  });
}

// ===== EVENTOS =====
document.getElementById("fechaSelect").addEventListener("change", e => {
  renderFixture(e.target.value);
});

document.getElementById("torneoSelect").addEventListener("change", e => {
  torneoActual = e.target.value;
  renderFechas();
  renderFixture(0);
  calcularTabla();
});

// ===== INICIO =====
fixtureApertura = generarFixtureBase();
fixtureClausura = generarClausura(fixtureApertura);

renderFechas();
renderFixture(0);
calcularTabla();
