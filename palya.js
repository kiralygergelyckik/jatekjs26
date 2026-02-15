export class Palya {
    constructor(main, sorok, oszlopok) {
        this.main = main;
        this.sorok = sorok;
        this.oszlopok = oszlopok;
        this.tabla = [];
        this.veszelySzint = 0;
        this.veszelyInterval = null;
        this.jatekos1 = null;
        this.jatekos2 = null;
    }

    beallitJatekosok(j1, j2) {
        this.jatekos1 = j1;
        this.jatekos2 = j2;
    }

    tablaLetrehoz() {
        const tablaElem = document.getElementById('jatekter');
        tablaElem.innerHTML = '';
        this.alkalmazMeretStilus();

        tablaElem.style.gridTemplateColumns = `repeat(${this.oszlopok}, var(--cella-meret))`;
        tablaElem.style.gridTemplateRows = `repeat(${this.sorok}, var(--cella-meret))`;

        this.tabla = Array.from({ length: this.sorok }, () => Array.from({ length: this.oszlopok }));
        for (let i = 0; i < this.sorok; i++) {
            for (let j = 0; j < this.oszlopok; j++) {
                const cella = document.createElement('div');
                cella.classList.add('cella');
                cella.dataset.x = String(i);
                cella.dataset.y = String(j);
                this.tabla[i][j] = cella;
                tablaElem.appendChild(cella);
            }
        }
    }

    alkalmazMeretStilus() {
        let meret = 50;
        if (this.sorok <= 8) meret = 68;
        else if (this.sorok >= 24) meret = 28;
        document.documentElement.style.setProperty('--cella-meret', `${meret}px`);
    }

    cella(x, y) {
        return this.tabla[x][y];
    }

    biztonsagosMezok() {
        return [
            { r: 0, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 1 },
            { r: this.sorok - 1, c: this.oszlopok - 1 },
            { r: this.sorok - 2, c: this.oszlopok - 1 },
            { r: this.sorok - 1, c: this.oszlopok - 2 }
        ];
    }

    egyediPoziciok(db, kizart = []) {
        const max = this.sorok * this.oszlopok - kizart.length;
        const celDb = Math.max(0, Math.min(db, max));
        const poziciok = [];

        while (poziciok.length < celDb) {
            const r = Math.floor(Math.random() * this.sorok);
            const c = Math.floor(Math.random() * this.oszlopok);
            const marLetezik = poziciok.some((p) => p.r === r && p.c === c);
            const tiltott = kizart.some((p) => p.r === r && p.c === c);
            if (!marLetezik && !tiltott) poziciok.push({ r, c });
        }
        return poziciok;
    }

    objektumokatHozzaad(poziciok, osztaly) {
        poziciok.forEach(({ r, c }) => this.tabla[r][c].classList.add(osztaly));
    }

    ervenyesLepes(x, y, jatekos = null) {
        if (x < 0 || x >= this.sorok || y < 0 || y >= this.oszlopok) return false;
        if (this.tabla[x][y].classList.contains('bomba')) return false;
        if (this.tabla[x][y].classList.contains('doboz') && !(jatekos && jatekos.arnyekAktiv())) return false;
        return true;
    }

    jatekosRajzol(jatekos, osztaly) {
        const div = document.createElement('div');
        div.classList.add('jatekosDiv', osztaly);
        this.tabla[jatekos.x][jatekos.y].appendChild(div);
    }

    jatekosTorol(jatekos) {
        const regiDiv = this.tabla[jatekos.x][jatekos.y].querySelector('.jatekosDiv');
        if (regiDiv) regiDiv.remove();
    }

    kozelbenUresPozicio(halalX, halalY, tav = 3) {
        const lehetseges = [];
        for (let dx = -tav; dx <= tav; dx++) {
            for (let dy = -tav; dy <= tav; dy++) {
                const x = halalX + dx;
                const y = halalY + dy;
                if (
                    x >= 0 && x < this.sorok
                    && y >= 0 && y < this.oszlopok
                    && this.ervenyesLepes(x, y)
                    && !this.tabla[x][y].querySelector('.jatekosDiv')
                    && !this.tabla[x][y].classList.contains('veszelyzona')
                ) {
                    lehetseges.push({ x, y });
                }
            }
        }
        return lehetseges.length > 0 ? lehetseges[Math.floor(Math.random() * lehetseges.length)] : null;
    }

    alkalmazVeszelyZona(szint) {
        for (let i = 0; i < this.sorok; i++) {
            for (let j = 0; j < this.oszlopok; j++) {
                if (i < szint || i >= this.sorok - szint || j < szint || j >= this.oszlopok - szint) {
                    this.tabla[i][j].classList.add('veszelyzona');
                    this.tabla[i][j].classList.remove('powerup');
                }
            }
        }
    }

    idovegeEffekt() {
        const kijelzo = document.getElementById('timeDisplay');
        document.getElementById('jatekter').classList.add('jatekter-veszely');
        if (kijelzo) {
            kijelzo.innerText = '⏱ Lejárt az idő! A pálya szűkül...';
            setTimeout(() => { kijelzo.style.display = 'none'; }, 5000);
        }
        document.body.style.background = 'black';

        this.veszelyInterval = setInterval(() => {
            this.veszelySzint += 1;
            if (this.sorok - this.veszelySzint * 2 < 3) {
                clearInterval(this.veszelyInterval);
                return;
            }
            this.alkalmazVeszelyZona(this.veszelySzint);
        }, 5000);
    }

    ellenorizVeszelyHalal(jatekos) {
        if (!this.tabla[jatekos.x][jatekos.y].classList.contains('veszelyzona')) return;
        jatekos.jatekosHal(this.main);
    }

    frissitVeszelySebzes(jatekos, delta) {
        if (!this.tabla[jatekos.x][jatekos.y].classList.contains('veszelyzona')) {
            jatekos.veszelybenToltottIdo = 0;
            return;
        }

        jatekos.veszelybenToltottIdo += delta;
        if (jatekos.veszelybenToltottIdo < 3000) return;

        jatekos.veszelybenToltottIdo = 0;
        jatekos.sebezodik(this.main);
    }
}