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

        this.tabla = Array.from({ length: this.sorok }, () => Array.from({ length: this.oszlopok }));

        for (let i = 0; i < this.sorok; i++) {
            const tr = document.createElement('tr');
            for (let j = 0; j < this.oszlopok; j++) {
                const td = document.createElement('td');
                this.tabla[i][j] = td;
                tr.appendChild(td);
            }
            tablaElem.appendChild(tr);
        }
    }

    cella(x, y) {
        return this.tabla[x][y];
    }

    egyediPoziciok(db, kizart = []) {
        const poziciok = [];
        while (poziciok.length < db) {
            const r = Math.floor(Math.random() * this.sorok);
            const c = Math.floor(Math.random() * this.oszlopok);

            const marLetezik = poziciok.some((p) => p.r === r && p.c === c);
            const tiltott = kizart.some((p) => p.r === r && p.c === c);

            if (!marLetezik && !tiltott) {
                poziciok.push({ r, c });
            }
        }
        return poziciok;
    }

    objektumokatHozzaad(poziciok, osztaly) {
        poziciok.forEach(({ r, c }) => this.tabla[r][c].classList.add(osztaly));
    }

    ervenyesLepes(x, y) {
        return x >= 0
            && x < this.sorok
            && y >= 0
            && y < this.oszlopok
            && !this.tabla[x][y].classList.contains('doboz')
            && !this.tabla[x][y].classList.contains('bomba');
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

        if (lehetseges.length === 0) return null;
        return lehetseges[Math.floor(Math.random() * lehetseges.length)];
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
            setTimeout(() => {
                kijelzo.style.display = 'none';
            }, 5000);
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
        const cella = this.tabla[jatekos.x][jatekos.y];
        if (!cella.classList.contains('veszelyzona')) return;

        jatekos.elet = 0;
        jatekos.jatekosHal(this.main);
    }

    frissitVeszelySebzes(jatekos, delta) {
        const cella = this.tabla[jatekos.x][jatekos.y];
        if (!cella.classList.contains('veszelyzona')) {
            jatekos.veszelybenToltottIdo = 0;
            return;
        }

        jatekos.veszelybenToltottIdo += delta;
        if (jatekos.veszelybenToltottIdo < 3000) return;

        jatekos.veszelybenToltottIdo = 0;
        jatekos.elet -= 1;
        jatekos.jatekosHal(this.main);
    }
}
