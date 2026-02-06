import { Jatekos } from './Jatekos.js';
import { Palya } from './Palya.js';
import { Erositesek } from './erositesek.js';
import { Beallitasok } from './beallitasok.js';

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
    { key: 'ArrowRight', player: 2, dx: 0, dy: 1 }
];

const POWERUP_SLOTOK = [
    { key: 'nagyrobbanas', img: 'grafika/expo.png' },
    { key: 'gyorsito', img: 'grafika/jatekos1.png' },
    { key: 'furo', img: 'grafika/tegla.jpg' },
    { key: 'pajzs', img: 'grafika/este.jpg' },
    { key: 'arnyek', img: 'grafika/fak.png' },
    { key: 'mega', img: 'grafika/bomba.png' }
];

const TABLA_MERETEK = {
    kicsi: { sorok: 8, oszlopok: 8 },
    kozepes: { sorok: 15, oszlopok: 15 },
    nagy: { sorok: 24, oszlopok: 24 }
};

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

        this.palya = new Palya(this, this.sorok, this.oszlopok);
        this.erositesek = new Erositesek(this);
        this.beallitasok = new Beallitasok(this);
    }

    init() {
        this.beallitasok.alkalmazGrafikaiBeallitasokValoban();
        this.inicializalPowerupSlotok();
        this.frissitJatekosPanelok();
        this.kotEventek();

        const gyik = document.getElementById('gyik-doboz');
        if (gyik) gyik.style.display = 'block';
    }

    frissitTablaMeret(meretKulcs) {
        this.meret = meretKulcs;
        localStorage.setItem('tablaMeret', meretKulcs);

        this.sorok = TABLA_MERETEK[meretKulcs].sorok;
        this.oszlopok = TABLA_MERETEK[meretKulcs].oszlopok;

        this.palya.sorok = this.sorok;
        this.palya.oszlopok = this.oszlopok;

        this.jatekos1.x = 0;
        this.jatekos1.y = 0;
        this.jatekos2.x = this.sorok - 1;
        this.jatekos2.y = this.oszlopok - 1;
    }

    kotEventek() {
        document.getElementById('kezdes').addEventListener('click', () => this.jatekTablaLetrehoz());
        document.getElementById('beallitasok').addEventListener('click', () => this.beallitasok.megjelenitBeallitasok());
        document.getElementById('grafika').addEventListener('click', () => this.beallitasok.grafika());
        document.getElementById('palyak').addEventListener('click', () => this.beallitasok.palyak());
        document.getElementById('karakterek').addEventListener('click', () => this.beallitasok.karakterek());

        document.addEventListener('keydown', (event) => {
            if (!this.lenyomott[event.key]) {
                if (event.key === 'q') this.jatekos1.bombaLetesz(this);
                if (event.key === 'm') this.jatekos2.bombaLetesz(this);
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
            const j = player === 1 ? this.jatekos1 : this.jatekos2;
            j.jatekosMozog(this, dx, dy);
        });

        this.palya.frissitVeszelySebzes(this.jatekos1, 70);
        this.palya.frissitVeszelySebzes(this.jatekos2, 70);
    }

    jatekTablaLetrehoz() {
        this.jatekAktiv = true;
        this.beallitasok.karakterAlkalmazas();

        this.palya.tablaLetrehoz();
        this.palya.beallitJatekosok(this.jatekos1, this.jatekos2);

        document.getElementById('menu').style.display = 'none';
        document.getElementById('focim').style.display = 'none';

        const gyik = document.getElementById('gyik-doboz');
        if (gyik) gyik.style.display = 'none';

        document.getElementById('oldal-bal').classList.remove('rejtett');
        document.getElementById('oldal-jobb').classList.remove('rejtett');

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
        this.palya.jatekosRajzol(this.jatekos1, 'jatekos1');
        this.palya.jatekosRajzol(this.jatekos2, 'jatekos2');

        this.frissitJatekosPanelok();
        if (this.idokorlathoz > 0) this.inditIdozito();
    }

    ellenorizGyozelem() {
        if (!this.jatekAktiv) return;
        const szakertoNyero =
            (this.jatekos1.pont >= 2 && this.karakter1 === '1') ||
            (this.jatekos2.pont >= 2 && this.karakter2 === '1');

        if (szakertoNyero) {
            this.jatekVege(this.jatekos1.pont >= 2 ? 'Játékos 1' : 'Játékos 2');
            return;
        }

        if (this.jatekos1.pont >= 3 || this.jatekos2.pont >= 3) {
            this.jatekVege(this.jatekos1.pont >= 3 ? 'Játékos 1' : 'Játékos 2');
        }
    }

    inicializalPowerupSlotok() {
        [{ id: 'powerup-slots-1' }, { id: 'powerup-slots-2' }].forEach(({ id }) => {
            const kontener = document.getElementById(id);
            if (!kontener) return;
            kontener.innerHTML = '';

            POWERUP_SLOTOK.forEach(({ key, img }) => {
                const slot = document.createElement('div');
                slot.className = 'powerup-slot';
                slot.dataset.powerup = key;

                const kep = document.createElement('img');
                kep.src = img;
                kep.alt = key;

                slot.appendChild(kep);
                kontener.appendChild(slot);
            });
        });
    }

    frissitJatekosPanelok() {
        this.frissitSzivek('szivek-1', this.jatekos1);
        this.frissitSzivek('szivek-2', this.jatekos2);
        this.frissitPowerupSlotok('powerup-slots-1', this.jatekos1);
        this.frissitPowerupSlotok('powerup-slots-2', this.jatekos2);
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

    frissitPowerupSlotok(elemId, jatekos) {
        const kontener = document.getElementById(elemId);
        if (!kontener) return;

        kontener.querySelectorAll('.powerup-slot').forEach((slot) => {
            const key = slot.dataset.powerup;
            if (jatekos.powerupAllapot[key]) slot.classList.add('aktiv');
            else slot.classList.remove('aktiv');
        });
    }

    mutatPowerupUzenet(jatekos, szoveg) {
        const elemId = jatekos === this.jatekos1 ? 'uzenet-1' : 'uzenet-2';
        const elem = document.getElementById(elemId);
        if (!elem) return;

        elem.textContent = szoveg;
        elem.style.opacity = '1';

        if (jatekos.uzenetIdozito) clearTimeout(jatekos.uzenetIdozito);
        jatekos.uzenetIdozito = setTimeout(() => {
            elem.style.opacity = '0';
            elem.textContent = '';
        }, 2500);
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
