import { Jatekos } from './Jatekos.js';
import { Palya } from './Palya.js';
import { Erositesek } from './erositesek.js';
import { Beallitasok } from './beallitasok.js';

const PALYA_BEALLITASOK = {
    palya1: { doboz: 50, powerup: 30 },
    palya2: { doboz: 180, powerup: 5 },
    palya3: { doboz: 40, powerup: 5 },
    veletlen: { doboz: 130, powerupMin: 1, powerupMax: 15 }
};

const BIZTONSAGOS_MEZOK = [
    { r: 0, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 1 },
    { r: 13, c: 14 }, { r: 14, c: 13 }, { r: 14, c: 14 }
];

const MOZGASOK = [
    { key: 'w', player: 1, dx: -1, dy: 0 },
    { key: 's', player: 1, dx: 1, dy: 0 },
    { key: 'a', player: 1, dx: 0, dy: -1 },
    { key: 'd', player: 1, dx: 0, dy: 1 },
    { key: 'ArrowUp', player: 2, dx: -1, dy: 0 },
    { key: 'ArrowDown', player: 2, dx: 1, dy: 0 },
    { key: 'ArrowLeft', player: 2, dx: 0, dy: -1 },
    { key: 'ArrowRight', player: 2, dx: 0, dy: 1 }
];

class Main {
    constructor() {
        this.sorok = 15;
        this.oszlopok = 15;
        this.jatekAktiv = false;
        this.lenyomott = {};
        this.felveheto = true;

        this.nehezseg = 'alap';
        this.idokorlathoz = 0;
        this.hatralevoIdo = 0;
        this.idozito = null;
        this.powerUpEsely = 1;
        this.bombaSebesseg = 1000;

        this.valasztottPalya = localStorage.getItem('palya') || null;
        this.karakter1 = localStorage.getItem('karakter1') || '0';
        this.karakter2 = localStorage.getItem('karakter2') || '0';

        this.pontElem = document.getElementById('pontszam');

        this.jatekos1 = new Jatekos({ nev: 'Piros', x: 0, y: 0, sebesseg: 250, alapsebesseg: 250 });
        this.jatekos2 = new Jatekos({ nev: 'Kék', x: 14, y: 14, sebesseg: 250, alapsebesseg: 250 });

        this.palya = new Palya(this.sorok, this.oszlopok);
        this.erositesek = new Erositesek(this);
        this.beallitasok = new Beallitasok(this);
    }

    init() {
        this.beallitasok.alkalmazGrafikaiBeallitasokValoban();
        this.kotEventek();

        const gyik = document.getElementById('gyik-doboz');
        if (gyik) gyik.style.display = 'block';
    }

    kotEventek() {
        document.getElementById('kezdes').addEventListener('click', () => this.jatekTablaLetrehoz());
        document.getElementById('beallitasok').addEventListener('click', () => this.beallitasok.megjelenitBeallitasok());
        document.getElementById('grafika').addEventListener('click', () => this.beallitasok.grafika());
        document.getElementById('palyak').addEventListener('click', () => this.beallitasok.palyak());
        document.getElementById('karakterek').addEventListener('click', () => this.beallitasok.karakterek());

        document.addEventListener('keydown', (event) => {
            if (!this.lenyomott[event.key]) {
                if (event.key === 'q') this.erositesek.bombaLetesz(this.jatekos1);
                if (event.key === 'm') this.erositesek.bombaLetesz(this.jatekos2);
            }
            this.lenyomott[event.key] = true;
        });

        document.addEventListener('keyup', (event) => {
            delete this.lenyomott[event.key];
        });

        setInterval(() => this.futasiCiklus(), 70);
    }

    futasiCiklus() {
        if (!this.jatekAktiv) return;

        MOZGASOK.forEach(({ key, player, dx, dy }) => {
            if (!this.lenyomott[key]) return;
            this.jatekosMozog(player === 1 ? this.jatekos1 : this.jatekos2, dx, dy);
        });

        this.palya.frissitVeszelySebzes(this.jatekos1, 70, () => this.frissitPontszam());
        this.palya.frissitVeszelySebzes(this.jatekos2, 70, () => this.frissitPontszam());
    }

    jatekTablaLetrehoz() {
        this.jatekAktiv = true;
        this.karakter1 = localStorage.getItem('karakter1') || '0';
        this.karakter2 = localStorage.getItem('karakter2') || '0';

        this.palya.tablaLetrehoz();
        this.palya.beallitJatekosok(this.jatekos1, this.jatekos2);
        this.beallitasok.karakterAlkalmazas();

        document.getElementById('menu').style.display = 'none';
        document.getElementById('focim').style.display = 'none';

        const ures = this.palya.egyediPoziciok(5, BIZTONSAGOS_MEZOK);
        const palyaBeallitas = PALYA_BEALLITASOK[this.valasztottPalya] || PALYA_BEALLITASOK.veletlen;

        const dobozok = this.palya.egyediPoziciok(palyaBeallitas.doboz, [...ures, ...BIZTONSAGOS_MEZOK]);
        const powerupDarab = palyaBeallitas.powerup ?? (Math.floor(Math.random() * palyaBeallitas.powerupMax) + palyaBeallitas.powerupMin);
        const powerupok = this.palya.egyediPoziciok(powerupDarab, [...ures, ...dobozok]);

        this.palya.objektumokatHozzaad(dobozok, 'doboz');
        this.palya.objektumokatHozzaad(powerupok, 'powerup');
        this.palya.jatekosRajzol(this.jatekos1, 'jatekos1');
        this.palya.jatekosRajzol(this.jatekos2, 'jatekos2');

        if (this.idokorlathoz > 0) this.inditIdozito();
        this.frissitPontszam();
    }

    jatekosMozog(jatekos, dx, dy) {
        const most = Date.now();
        if (most - jatekos.utolsoMozgas < jatekos.sebesseg) return;

        const ujX = jatekos.x + dx;
        const ujY = jatekos.y + dy;
        const masikJatekos = jatekos === this.jatekos1 ? this.jatekos2 : this.jatekos1;
        if (masikJatekos.x === ujX && masikJatekos.y === ujY) return;

        if (!this.palya.ervenyesLepes(ujX, ujY)) return;

        this.palya.jatekosTorol(jatekos);
        jatekos.x = ujX;
        jatekos.y = ujY;
        this.palya.jatekosRajzol(jatekos, jatekos === this.jatekos1 ? 'jatekos1' : 'jatekos2');

        if (this.palya.cella(ujX, ujY).classList.contains('powerup') && this.felveheto) {
            this.erositesek.powerupFelvesz(jatekos, ujX, ujY);
        }

        jatekos.utolsoMozgas = most;
        this.palya.ellenorizVeszelyHalal(jatekos, () => this.frissitPontszam());
    }

    frissitPontszam() {
        if (!this.jatekAktiv) return;
        this.pontElem.textContent = `Játékos 1: ${this.jatekos1.pont} - Játékos 2: ${this.jatekos2.pont}`;

        const szakertoGyorsNyero =
            (this.jatekos1.pont >= 2 && this.karakter1 === '1') ||
            (this.jatekos2.pont >= 2 && this.karakter2 === '1');

        if (szakertoGyorsNyero) {
            this.jatekVege(this.jatekos1.pont >= 2 ? 'Játékos 1' : 'Játékos 2');
            return;
        }

        if (this.jatekos1.pont >= 3 || this.jatekos2.pont >= 3) {
            this.jatekVege(this.jatekos1.pont >= 3 ? 'Játékos 1' : 'Játékos 2');
        }
    }

    jatekVege(nyertes) {
        this.jatekAktiv = false;
        const vegeAblak = document.createElement('div');
        vegeAblak.classList.add('jatekvegekepernyo');
        vegeAblak.innerHTML = `<h2>${nyertes} nyert!</h2><button id="ujrainditas">Új játék</button>`;
        document.body.appendChild(vegeAblak);

        document.getElementById('ujrainditas').addEventListener('click', () => location.reload());

        this.megallitIdozito();
        document.getElementById('jatekter').style.opacity = '0.2';
    }

    inditIdozito() {
        this.hatralevoIdo = this.idokorlathoz;

        let kijelzo = document.getElementById('timeDisplay');
        if (!kijelzo) {
            kijelzo = document.createElement('div');
            kijelzo.id = 'timeDisplay';
            document.body.appendChild(kijelzo);
        }

        kijelzo.innerText = `Hátralévő idő: ${this.hatralevoIdo}s`;

        this.idozito = setInterval(() => {
            this.hatralevoIdo -= 1;
            kijelzo.innerText = `Idő hátra: ${this.hatralevoIdo}s`;

            if (this.hatralevoIdo > 0) return;
            clearInterval(this.idozito);
            this.palya.idovegeEffekt();
        }, 1000);
    }

    megallitIdozito() {
        clearInterval(this.idozito);
        const kijelzo = document.getElementById('timeDisplay');
        if (kijelzo) kijelzo.remove();
    }
}

window.addEventListener('load', () => {
    const main = new Main();
    main.init();
});