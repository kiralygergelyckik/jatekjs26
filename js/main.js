import { Palya } from './palya.js';
import { Jatekos } from './jatekos.js';
import { Beallitasok } from './beallitasok.js';
import { Erositesek } from './erositesek.js';

// ------------------ ALAP VÁLTOZÓK ------------------

const tablaElem = document.getElementById('jatekter');

let palya;
let jatekos1;
let jatekos2;

// ------------------ JÁTÉK INDÍTÁS ------------------

function jatekTablaLetrehoz() {
    Beallitasok.betolt();
    Beallitasok.alkalmaz();

    palya = new Palya(15, 15, tablaElem);
    palya.letrehoz();

    jatekos1 = new Jatekos("Piros", 0, 0);
    jatekos2 = new Jatekos("Kék", 14, 14);

    kirajzolJatekos(jatekos1, 'jatekos1');
    kirajzolJatekos(jatekos2, 'jatekos2');
}

// ------------------ KIRAJZOLÁS ------------------

function kirajzolJatekos(jatekos, cssClass) {
    const cella = palya.tabla[jatekos.x][jatekos.y];
    const div = document.createElement('div');
    div.className = `jatekosDiv ${cssClass}`;
    cella.appendChild(div);
}

// ------------------ MENÜ FUNKCIÓK ------------------

function megjelenitBeallitasok() {
    alert("Beállítások ide jönnek 🙂");
}

function grafika() {
    alert("Grafikai beállítások");
}

function palyak() {
    alert("Pályaválasztás");
}

function karakterek() {
    alert("Karakterválasztás");
}

// ------------------ HTML-HEZ KÖTÉS ------------------
// EZ KULCSFONTOSSÁGÚ ⬇⬇⬇

window.jatekTablaLetrehoz = jatekTablaLetrehoz;
window.megjelenitBeallitasok = megjelenitBeallitasok;
window.grafika = grafika;
window.palyak = palyak;
window.karakterek = karakterek;
