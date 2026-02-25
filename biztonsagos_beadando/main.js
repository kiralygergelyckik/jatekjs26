import { Jatekos } from './jatekos.js';
import { Palya } from './palya.js';
import { Erositesek } from './erositesek.js';
import { Beallitasok } from './beallitasok.js';
import { NetworkManager } from './NetworkManager.js';

const PALYA_BEALLITASOK = {
    palya1: { dobozArany: 0.22, powerupArany: 0.13 },
    palya2: { dobozArany: 0.62, powerupArany: 0.02 },
    palya3: { dobozArany: 0.18, powerupArany: 0.03 },
    veletlen: { dobozArany: 0.45, powerupMin: 1, powerupMax: 15 }
};

const MOZGASOK = [
    { key: 'w', player: 1, dx: -1, dy: 0 },
    { key: 's', player: 1, dx: 1, dy: 0 },
    { key: 'a', player: 1, dx: 0, dy: -1 },
    { key: 'd', player: 1, dx: 0, dy: 1 },
    { key: 'ArrowUp', player: 2, dx: -1, dy: 0 },
    { key: 'ArrowDown', player: 2, dx: 1, dy: 0 },
    { key: 'ArrowLeft', player: 2, dx: 0, dy: -1 },
    { key: 'ArrowRight', player: 2, dx: 0, dy: 1 },
    { key: 't', player: 3, dx: -1, dy: 0 },
    { key: 'g', player: 3, dx: 1, dy: 0 },
    { key: 'f', player: 3, dx: 0, dy: -1 },
    { key: 'h', player: 3, dx: 0, dy: 1 },
    { key: 'i', player: 4, dx: -1, dy: 0 },
    { key: 'k', player: 4, dx: 1, dy: 0 },
    { key: 'j', player: 4, dx: 0, dy: -1 },
    { key: 'l', player: 4, dx: 0, dy: 1 }
];


const PLAYER_CONTROLS = {
    1: { mozgas: ['w', 'a', 's', 'd'], bomba: 'q' },
    2: { mozgas: ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'], bomba: 'm' },
    3: { mozgas: ['t', 'f', 'g', 'h'], bomba: 'r' },
    4: { mozgas: ['i', 'j', 'k', 'l'], bomba: 'o' }
};

const POWERUP_SLOTOK = [
    { key: 'nagyrobbanas', jel: '✶' },
    { key: 'gyorsito', jel: '↯' },
    { key: 'furo', jel: '⛏' },
    { key: 'pajzs', jel: '◍' },
    { key: 'arnyek', jel: '◐' },
    { key: 'mega', jel: '✹' }
];

const TABLA_MERETEK = {
    kicsi: { sorok: 8, oszlopok: 8 },
    kozepes: { sorok: 15, oszlopok: 15 },
    nagy: { sorok: 24, oszlopok: 24 }
};

const CELL_FLAGS = {
    doboz: 1,
    powerup: 2,
    perzseles: 4,
    romok: 8,
    veszelyzona: 16,
    bomba: 32
};

const CELL_KEYS = Object.keys(CELL_FLAGS);

class Main {
    constructor() {
        this.meret = localStorage.getItem('tablaMeret') || 'kozepes';
        this.sorok = TABLA_MERETEK[this.meret].sorok;
        this.oszlopok = TABLA_MERETEK[this.meret].oszlopok;

        this.jatekAktiv = false;
        this.lenyomott = {};
        this.nehezseg = 'alap';
        this.idokorlathoz = 0;
        this.hatralevoIdo = 0;
        this.idozito = null;
        this.powerUpEsely = 1;
        this.bombaSebesseg = 1000;

        this.valasztottPalya = localStorage.getItem('palya') || null;
        this.karakter1 = localStorage.getItem('karakter1') || '0';
        this.karakter2 = localStorage.getItem('karakter2') || '0';

        this.jatekos1 = new Jatekos({ nev: 'Piros', x: 0, y: 0, sebesseg: 250, alapsebesseg: 250 });
        this.jatekos2 = new Jatekos({ nev: 'Kék', x: this.sorok - 1, y: this.oszlopok - 1, sebesseg: 250, alapsebesseg: 250 });
        this.jatekos3 = new Jatekos({ nev: 'Sárga', x: this.sorok - 1, y: 0, sebesseg: 250, alapsebesseg: 250 });
        this.jatekos4 = new Jatekos({ nev: 'Zöld', x: 0, y: this.oszlopok - 1, sebesseg: 250, alapsebesseg: 250 });
        this.players = [this.jatekos1, this.jatekos2, this.jatekos3, this.jatekos4];
        this.activePlayers = 2;

        this.palya = new Palya(this, this.sorok, this.oszlopok);
        this.erositesek = new Erositesek(this);
        this.beallitasok = new Beallitasok(this);
        this.network = new NetworkManager(this);
        this.utolsoRemoteCells = [];
    }

    init() {
        this.beallitasok.alkalmazGrafikaiBeallitasokValoban();
        this.inicializalPowerupSlotok();
        this.frissitJatekosPanelok();
        this.kotEventek();

        const gyik = document.getElementById('gyik-doboz');
        if (gyik) gyik.style.display = 'block';
    }

    mutatHalozatUzenet(szoveg) {
        this.mutatPowerupUzenet(this.jatekos1, szoveg);
    }

    osszesJatekos() {
        return this.players.slice(0, this.activePlayers);
    }

    setActivePlayers(db) {
        this.activePlayers = Math.max(2, Math.min(4, Number(db) || 2));
        this.frissitJatekosPanelok();
    }

    kezdoPoziciok() {
        return [
            { x: 0, y: 0 },
            { x: this.sorok - 1, y: this.oszlopok - 1 },
            { x: this.sorok - 1, y: 0 },
            { x: 0, y: this.oszlopok - 1 }
        ];
    }

    kezdoPozicioByPlayer(jatekos) {
        const idx = this.players.indexOf(jatekos);
        return this.kezdoPoziciok()[idx >= 0 ? idx : 0];
    }

    frissitTablaMeret(meretKulcs) {
        this.meret = meretKulcs;
        localStorage.setItem('tablaMeret', meretKulcs);

        this.sorok = TABLA_MERETEK[meretKulcs].sorok;
        this.oszlopok = TABLA_MERETEK[meretKulcs].oszlopok;

        this.palya.sorok = this.sorok;
        this.palya.oszlopok = this.oszlopok;

        const startok = this.kezdoPoziciok();
        this.players.forEach((jatekos, i) => {
            jatekos.x = startok[i].x;
            jatekos.y = startok[i].y;
        });
    }

    kotEventek() {
        document.getElementById('kezdes').addEventListener('click', () => this.jatekTablaLetrehoz());
        document.getElementById('beallitasok').addEventListener('click', () => this.beallitasok.megjelenitBeallitasok());
        document.getElementById('grafika').addEventListener('click', () => this.beallitasok.grafika());
        document.getElementById('palyak').addEventListener('click', () => this.beallitasok.palyak());
        document.getElementById('karakterek').addEventListener('click', () => this.beallitasok.karakterek());

        document.getElementById('host').addEventListener('click', () => this.hostRoom());
        document.getElementById('join').addEventListener('click', () => this.joinRoom());

        document.addEventListener('keydown', (event) => {
            const key = event.key;
            const sajatSlot = this.network.isClient() ? this.network.selfSlot : 1;
            const sajatControl = PLAYER_CONTROLS[sajatSlot] || PLAYER_CONTROLS[1];

            if (!this.lenyomott[key]) {
                if (this.network.isClient()) {
                    if (key === sajatControl.bomba) this.network.sendBomb();
                } else {
                    if (key === PLAYER_CONTROLS[1].bomba) this.jatekos1.bombaLetesz(this);
                    if (!this.network.isHost()) {
                        if (key === PLAYER_CONTROLS[2].bomba) this.jatekos2.bombaLetesz(this);
                        if (key === PLAYER_CONTROLS[3].bomba) this.jatekos3.bombaLetesz(this);
                        if (key === PLAYER_CONTROLS[4].bomba) this.jatekos4.bombaLetesz(this);
                    }
                }
            }

            this.lenyomott[key] = true;
            if (this.network.isClient() && sajatControl.mozgas.includes(key)) {
                this.network.sendInput(key, true);
            }
        });

        document.addEventListener('keyup', (event) => {
            const key = event.key;
            delete this.lenyomott[key];

            const sajatSlot = this.network.isClient() ? this.network.selfSlot : 1;
            const sajatControl = PLAYER_CONTROLS[sajatSlot] || PLAYER_CONTROLS[1];
            if (this.network.isClient() && sajatControl.mozgas.includes(key)) {
                this.network.sendInput(key, false);
            }
        });

        setInterval(() => this.futasiCiklus(), 70);
        setInterval(() => this.palya.render(), 60);
    }

    hostRoom() {
        const room = prompt('Szoba azonosító (pl: kuruc123):', 'kuruc123');
        if (!room) return;
        this.network.connect('host', room);
    }

    joinRoom() {
        const room = prompt('Szoba azonosító:', 'kuruc123');
        if (!room) return;
        this.network.connect('join', room);
    }

    futasiCiklus() {
        if (!this.jatekAktiv) return;

        MOZGASOK.forEach(({ key, player, dx, dy }) => {
            if (player > this.activePlayers) return;
            const jatekos = this.players[player - 1];
            if (!jatekos) return;

            if (player === 1) {
                if (!this.lenyomott[key]) return;
                jatekos.jatekosMozog(this, dx, dy);
                return;
            }

            if (this.network.isHost()) {
                const shouldMove = this.network.getRemoteKey(player, key);
                if (!shouldMove) return;
                jatekos.jatekosMozog(this, dx, dy);
                return;
            }

            if (this.network.isClient()) return;

            if (!this.lenyomott[key]) return;
            jatekos.jatekosMozog(this, dx, dy);
        });

        this.osszesJatekos().forEach((jatekos) => this.palya.frissitVeszelySebzes(jatekos, 70));
    }

    jatekTablaLetrehoz() {
        this.jatekAktiv = true;
        this.beallitasok.karakterAlkalmazas();

        this.palya.tablaLetrehoz();
        this.utolsoRemoteCells = [];
        this.palya.beallitJatekosok(this.players);

        document.getElementById('menu').style.display = 'none';
        document.getElementById('focim').style.display = 'none';

        const gyik = document.getElementById('gyik-doboz');
        if (gyik) gyik.style.display = 'none';

        document.getElementById('oldal-bal').classList.remove('rejtett');
        document.getElementById('oldal-jobb').classList.remove('rejtett');
        this.frissitJatekosPanelok();

        const biztonsagos = this.palya.biztonsagosMezok();
        const ures = this.palya.egyediPoziciok(Math.max(2, Math.floor((this.sorok * this.oszlopok) * 0.02)), biztonsagos);

        const palyaBeallitas = PALYA_BEALLITASOK[this.valasztottPalya] || PALYA_BEALLITASOK.veletlen;
        const maxDoboz = Math.floor((this.sorok * this.oszlopok) * 0.7);
        const dobozDarab = Math.min(maxDoboz, Math.floor(this.sorok * this.oszlopok * (palyaBeallitas.dobozArany || 0.4)));
        const dobozok = this.palya.egyediPoziciok(dobozDarab, [...ures, ...biztonsagos]);

        const powerupDarab = palyaBeallitas.powerupArany
            ? Math.max(2, Math.floor(this.sorok * this.oszlopok * palyaBeallitas.powerupArany))
            : Math.floor(Math.random() * palyaBeallitas.powerupMax) + palyaBeallitas.powerupMin;

        const powerupok = this.palya.egyediPoziciok(powerupDarab, [...ures, ...dobozok, ...biztonsagos]);

        this.palya.objektumokatHozzaad(dobozok, 'doboz');
        this.palya.objektumokatHozzaad(powerupok, 'powerup');
        this.osszesJatekos().forEach((jatekos, idx) => this.palya.jatekosRajzol(jatekos, `jatekos${idx + 1}`));

        this.frissitJatekosPanelok();
        if (this.idokorlathoz > 0) this.inditIdozito();
    }

    captureState() {
        return {
            sorok: this.sorok,
            oszlopok: this.oszlopok,
            jatekAktiv: this.jatekAktiv,
            activePlayers: this.activePlayers,
            j1: this.serializePlayer(this.jatekos1),
            j2: this.serializePlayer(this.jatekos2),
            j3: this.serializePlayer(this.jatekos3),
            j4: this.serializePlayer(this.jatekos4),
            cells: this.jatekAktiv && this.palya.tabla.length ? this.tablaState() : [],
            gameOpacity: document.getElementById('jatekter').style.opacity || '1'
        };
    }

    serializePlayer(j) {
        return {
            x: j.x, y: j.y, pont: j.pont,
            pirosElet: j.pirosElet, kekElet: j.kekElet,
            sebesseg: j.sebesseg, nagyrobbanas: j.nagyrobbanas,
            powerupAllapot: j.powerupAllapot
        };
    }


    encodeCellState(cella) {
        return CELL_KEYS.reduce((mask, key) => (cella.classList.contains(key) ? mask | CELL_FLAGS[key] : mask), 0);
    }

    decodeCellState(encoded) {
        if (Array.isArray(encoded)) return encoded;
        const mask = Number(encoded) || 0;
        return CELL_KEYS.filter((key) => (mask & CELL_FLAGS[key]) !== 0);
    }

    tablaState() {
        const data = [];
        for (let i = 0; i < this.sorok; i++) {
            const row = [];
            for (let j = 0; j < this.oszlopok; j++) {
                const cella = this.palya.cella(i, j);
                if (!cella) {
                    row.push(0);
                    continue;
                }
                row.push(this.encodeCellState(cella));
            }
            data.push(row);
        }
        return data;
    }

    applyRemoteState(state) {
        if (!state) return;

        this.setActivePlayers(state.activePlayers || 2);

        if (state.sorok !== this.sorok || state.oszlopok !== this.oszlopok) {
            this.frissitTablaMeret(state.sorok <= 8 ? 'kicsi' : state.sorok >= 24 ? 'nagy' : 'kozepes');
            this.palya.tablaLetrehoz();
            this.utolsoRemoteCells = [];
            this.palya.beallitJatekosok(this.players);
        }

        if (!this.palya.tabla.length) {
            this.palya.tablaLetrehoz();
            this.utolsoRemoteCells = [];
            this.palya.beallitJatekosok(this.players);
        }

        for (let i = 0; i < this.sorok; i++) {
            if (!this.utolsoRemoteCells[i]) this.utolsoRemoteCells[i] = [];
            for (let j = 0; j < this.oszlopok; j++) {
                const cella = this.palya.cella(i, j);
                if (!cella) continue;
                const rawCell = state.cells?.[i]?.[j] ?? 0;
                const encoded = Array.isArray(rawCell) ? rawCell.join('|') : Number(rawCell);
                if (this.utolsoRemoteCells[i][j] === encoded) continue;
                this.utolsoRemoteCells[i][j] = encoded;
                cella.classList.replaceAll(['cella']);
                this.decodeCellState(rawCell).forEach((c) => cella.classList.add(c));
            }
        }

        Object.assign(this.jatekos1, state.j1);
        Object.assign(this.jatekos2, state.j2);
        if (state.j3) Object.assign(this.jatekos3, state.j3);
        if (state.j4) Object.assign(this.jatekos4, state.j4);

        this.osszesJatekos().forEach((jatekos, idx) => this.palya.jatekosRajzol(jatekos, `jatekos${idx + 1}`));
        this.frissitJatekosPanelok();
        document.getElementById('jatekter').style.opacity = state.gameOpacity || '1';
        this.palya.render();

        this.jatekAktiv = !!state.jatekAktiv;
        if (!this.jatekAktiv) return;
        document.getElementById('menu').style.display = 'none';
        document.getElementById('focim').style.display = 'none';
        const gyik = document.getElementById('gyik-doboz');
        if (gyik) gyik.style.display = 'none';
        document.getElementById('oldal-bal').classList.remove('rejtett');
        document.getElementById('oldal-jobb').classList.remove('rejtett');
        this.frissitJatekosPanelok();
    }

    ellenorizGyozelem() {
        if (!this.jatekAktiv) return;
        const maxPont = Math.max(...this.osszesJatekos().map((j) => j.pont));
        if (maxPont < 3) return;
        const nyertesIndex = this.osszesJatekos().findIndex((j) => j.pont === maxPont);
        this.jatekVege(`Játékos ${nyertesIndex + 1}`);
    }
    inicializalPowerupSlotok() {}

    frissitJatekosPanelok() {
        this.osszesJatekos().forEach((jatekos, idx) => {
            this.frissitSzivek(`szivek-${idx + 1}`, jatekos);
        });

        [1, 2, 3, 4].forEach((idx) => {
            const panel = document.getElementById(`panel-${idx}`);
            if (!panel) return;
            if (idx <= this.activePlayers) panel.classList.remove('rejtett');
            else panel.classList.add('rejtett');
        });
    }

    frissitSzivek(elemId, jatekos) {
        const kontener = document.getElementById(elemId);
        if (!kontener) return;

        kontener.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const sziv = document.createElement('span');
            sziv.className = 'sziv';

            if (i < jatekos.kekElet) {
                sziv.textContent = '♥';
                sziv.classList.add('kek');
            } else if (i < jatekos.pirosElet) {
                sziv.textContent = '♥';
                sziv.classList.add('piros');
            } else {
                sziv.textContent = '♡';
                sziv.classList.add('ures');
            }
            kontener.appendChild(sziv);
        }
    }

    mutatPowerupUzenet(jatekos, szoveg) {
        const idx = this.players.indexOf(jatekos);
        const elemId = idx >= 0 ? `uzenet-${idx + 1}` : null;
        const elem = elemId ? document.getElementById(elemId) : null;
        if (!elem) return;

        elem.textContent = szoveg;
        elem.style.opacity = '1';

        if (jatekos.uzenetIdozito) clearTimeout(jatekos.uzenetIdozito);
        jatekos.uzenetIdozito = setTimeout(() => {
            elem.style.opacity = '0';
        }, 50);
        jatekos.uzenetIdozito = setTimeout(() => {
            elem.textContent = '';
            elem.style.opacity = '0';
        }, 2000);
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