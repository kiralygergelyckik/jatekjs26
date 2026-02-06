const NORMAL_ROBBANAS = [
    { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
    { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
];

const NAGY_ROBBANAS_PLUSZ = [
    { dx: -2, dy: 0 }, { dx: 2, dy: 0 },
    { dx: 0, dy: -2 }, { dx: 0, dy: 2 }
];

const ATLOS_ROBBANAS = [
    { dx: -1, dy: -1 }, { dx: -1, dy: 1 },
    { dx: 1, dy: -1 }, { dx: 1, dy: 1 }
];

export class Erositesek {
    constructor(main) {
        this.main = main;
    }

    powerupFelvesz(jatekos, x, y) {
        const random = Math.floor(Math.random() * 3);
        this.main.felveheto = false;

        let tipus = 'Ismeretlen';
        if (random === 0) {
            jatekos.nagyrobbanas = true;
            tipus = 'Nagyrobbanás';
        } else if (random === 1) {
            jatekos.elet += 1;
            tipus = 'Plusz élet';
        } else {
            jatekos.regisebesseg = jatekos.sebesseg;
            jatekos.sebesseg = 125;
            tipus = 'Gyorsító';
            setTimeout(() => this.sebessegVissza(jatekos), 5000);
        }

        this.main.palya.cella(x, y).classList.remove('powerup');
        this.kiirKarakterenkent(`${jatekos.nev} felvette a ${tipus} powerupot!`, 'uzenet');
    }

    kiirKarakterenkent(szoveg, celElemId) {
        const elem = document.getElementById(celElemId);
        if (!elem) return;

        elem.style.display = 'inline';
        elem.innerHTML = '';

        let i = 0;
        const intervallum = setInterval(() => {
            if (i < szoveg.length) {
                elem.innerHTML += szoveg[i];
                i += 1;
                return;
            }

            clearInterval(intervallum);
            setTimeout(() => this.eltunes(elem), 500);
        }, 30);
    }

    eltunes(elem) {
        elem.style.display = 'none';
        this.main.felveheto = true;
    }

    sebessegVissza(jatekos) {
        jatekos.sebesseg = jatekos.regisebesseg || 250;
    }

    bombaLetesz(jatekos) {
        if (!this.main.jatekAktiv || jatekos.bombaAktiv) return;

        jatekos.bombaAktiv = true;
        const { x, y } = jatekos;

        const bombaDiv = document.createElement('div');
        bombaDiv.classList.add('bombaDiv', 'bomba');
        bombaDiv.dataset.bomba = 'true';
        this.main.palya.cella(x, y).appendChild(bombaDiv);

        setTimeout(() => {
            bombaDiv.remove();
            this.robbanasAnimacio(jatekos, x, y);
        }, this.main.bombaSebesseg);
    }

    robbanasAnimacio(jatekos, x, y) {
        const kozepsoExplozio = document.createElement('div');
        kozepsoExplozio.classList.add('explozioDiv', 'explozio');

        const cella = this.main.palya.cella(x, y);
        cella.appendChild(kozepsoExplozio);
        cella.classList.add('romok');

        this.bombaRobbanas(jatekos, x, y);
        this.jatekosSebzes(jatekos, x, y);

        setTimeout(() => {
            document.querySelectorAll('.explozioDiv').forEach((div) => div.remove());
            jatekos.bombaAktiv = false;
        }, 500);
    }

    robbanasiIranyok(jatekos) {
        let iranyok = [...NORMAL_ROBBANAS];
        if (jatekos.nagyrobbanas) iranyok = [...iranyok, ...NAGY_ROBBANAS_PLUSZ];
        if (jatekos.specialisRobbanas) iranyok = [...iranyok, ...ATLOS_ROBBANAS];
        return iranyok;
    }

    bombaRobbanas(jatekos, x, y) {
        this.robbanasiIranyok(jatekos).forEach(({ dx, dy }) => {
            const ujX = x + dx;
            const ujY = y + dy;

            if (ujX < 0 || ujX >= this.main.sorok || ujY < 0 || ujY >= this.main.oszlopok) return;

            const cella = this.main.palya.cella(ujX, ujY);
            cella.classList.remove('doboz');
            cella.classList.add('perzseles');

            const explozioDiv = document.createElement('div');
            explozioDiv.classList.add('explozioDiv', 'explozio');
            cella.appendChild(explozioDiv);
        });
    }

    jatekosSebzes(jatekos, x, y) {
        const terulet = [{ x, y }, ...this.robbanasiIranyok(jatekos).map(({ dx, dy }) => ({ x: x + dx, y: y + dy }))];

        if (jatekos.nagyrobbanas) {
            jatekos.nagyrobbanas = false;
        }

        [this.main.jatekos1, this.main.jatekos2].forEach((celpont) => {
            if (celpont.sebezhetetlen) return;

            const serult = terulet.some((pont) => celpont.x === pont.x && celpont.y === pont.y);
            if (!serult) return;

            celpont.elet -= 1;
            if (celpont.elet <= 0) {
                this.main.palya.jatekosHal(celpont, () => this.main.frissitPontszam());
            }
            this.main.frissitPontszam();
        });
    }
}