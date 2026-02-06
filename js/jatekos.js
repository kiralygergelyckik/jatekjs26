export class Jatekos {
    constructor({ nev, x, y, sebesseg, alapsebesseg }) {
        this.nev = nev;
        this.x = x;
        this.y = y;
        this.pont = 0;
        this.elet = 1;
        this.utolsoMozgas = 0;
        this.bombaAktiv = false;
        this.veszelybenToltottIdo = 0;
        this.sebezhetetlen = false;
        this.nagyrobbanas = false;
        this.specialisRobbanas = false;
        this.powerupInditas = false;
        this.sebesseg = sebesseg;
        this.alapsebesseg = alapsebesseg;
        this.bombaido = 0;
        this.regisebesseg = sebesseg;
    }

    resetPozicio(x, y) {
        this.x = x;
        this.y = y;
        this.elet = 1;
        this.sebesseg = this.alapsebesseg || 250;
        this.sebezhetetlen = true;
    }

    jatekosMozog(main, dx, dy) {
        const most = Date.now();
        if (most - this.utolsoMozgas < this.sebesseg) return;

        const ujX = this.x + dx;
        const ujY = this.y + dy;
        const masikJatekos = this === main.jatekos1 ? main.jatekos2 : main.jatekos1;
        if (masikJatekos.x === ujX && masikJatekos.y === ujY) return;
        if (!main.palya.ervenyesLepes(ujX, ujY)) return;

        main.palya.jatekosTorol(this);
        this.x = ujX;
        this.y = ujY;
        main.palya.jatekosRajzol(this, this === main.jatekos1 ? 'jatekos1' : 'jatekos2');

        if (main.palya.cella(ujX, ujY).classList.contains('powerup') && main.felveheto) {
            main.erositesek.powerupFelvesz(this, ujX, ujY);
        }

        this.utolsoMozgas = most;
        main.palya.ellenorizVeszelyHalal(this);
    }

    bombaLetesz(main) {
        if (!main.jatekAktiv || this.bombaAktiv) return;

        this.bombaAktiv = true;
        const { x, y } = this;

        const bombaDiv = document.createElement('div');
        bombaDiv.classList.add('bombaDiv', 'bomba');
        bombaDiv.dataset.bomba = 'true';
        main.palya.cella(x, y).appendChild(bombaDiv);

        setTimeout(() => {
            bombaDiv.remove();
            this.robbanasAnimacio(main, x, y);
        }, main.bombaSebesseg);
    }

    robbanasAnimacio(main, x, y) {
        const kozepsoExplozio = document.createElement('div');
        kozepsoExplozio.classList.add('explozioDiv', 'explozio');

        const cella = main.palya.cella(x, y);
        cella.appendChild(kozepsoExplozio);
        cella.classList.add('romok');

        this.bombaRobbanas(main, x, y);
        this.jatekosSebzes(main, x, y);

        setTimeout(() => {
            document.querySelectorAll('.explozioDiv').forEach((div) => div.remove());
            this.bombaAktiv = false;
        }, 500);
    }

    robbanasiIranyok() {
        const normalRobbanas = [
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
        ];
        const nagyRobbanasPlusz = [
            { dx: -2, dy: 0 }, { dx: 2, dy: 0 },
            { dx: 0, dy: -2 }, { dx: 0, dy: 2 }
        ];
        const atlosRobbanas = [
            { dx: -1, dy: -1 }, { dx: -1, dy: 1 },
            { dx: 1, dy: -1 }, { dx: 1, dy: 1 }
        ];

        let iranyok = [...normalRobbanas];
        if (this.nagyrobbanas) iranyok = [...iranyok, ...nagyRobbanasPlusz];
        if (this.specialisRobbanas) iranyok = [...iranyok, ...atlosRobbanas];
        return iranyok;
    }

    bombaRobbanas(main, x, y) {
        this.robbanasiIranyok().forEach(({ dx, dy }) => {
            const ujX = x + dx;
            const ujY = y + dy;
            if (ujX < 0 || ujX >= main.sorok || ujY < 0 || ujY >= main.oszlopok) return;

            const cella = main.palya.cella(ujX, ujY);
            cella.classList.remove('doboz');
            cella.classList.add('perzseles');

            const explozioDiv = document.createElement('div');
            explozioDiv.classList.add('explozioDiv', 'explozio');
            cella.appendChild(explozioDiv);
        });
    }

    jatekosSebzes(main, x, y) {
        const terulet = [{ x, y }, ...this.robbanasiIranyok().map(({ dx, dy }) => ({ x: x + dx, y: y + dy }))];

        if (this.nagyrobbanas) this.nagyrobbanas = false;

        [main.jatekos1, main.jatekos2].forEach((celpont) => {
            if (celpont.sebezhetetlen) return;
            const serult = terulet.some((pont) => celpont.x === pont.x && celpont.y === pont.y);
            if (!serult) return;

            celpont.elet -= 1;
            if (celpont.elet <= 0) {
                celpont.jatekosHal(main);
            }
            main.frissitPontszam();
        });
    }

    jatekosHal(main) {
        const halalozasiX = this.x;
        const halalozasiY = this.y;

        main.palya.jatekosTorol(this);

        const cella = main.palya.cella(halalozasiX, halalozasiY);
        cella.classList.add('jatekosHalal');
        setTimeout(() => cella.classList.remove('jatekosHalal'), 1000);

        if (this === main.jatekos1) main.jatekos2.pont += 1;
        else main.jatekos1.pont += 1;

        main.frissitPontszam();

        const ujHely = main.palya.kozelbenUresPozicio(halalozasiX, halalozasiY, 3);
        if (ujHely) {
            this.resetPozicio(ujHely.x, ujHely.y);
        } else {
            const alapPozicio = this === main.jatekos1 ? { x: 1, y: 1 } : { x: 13, y: 13 };
            this.resetPozicio(alapPozicio.x, alapPozicio.y);
        }

        main.palya.jatekosRajzol(this, this === main.jatekos1 ? 'jatekos1' : 'jatekos2');
        const ujDiv = main.palya.cella(this.x, this.y).querySelector('.jatekosDiv');
        if (!ujDiv) return;

        ujDiv.classList.add('sebezhetetlen');
        setTimeout(() => {
            this.sebezhetetlen = false;
            ujDiv.classList.remove('sebezhetetlen');
        }, 1000);
    }
}
