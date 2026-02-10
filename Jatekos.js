export class Jatekos {
    constructor({ nev, x, y, sebesseg, alapsebesseg }) {
        this.nev = nev;
        this.x = x;
        this.y = y;
        this.pont = 0;

        this.pirosElet = 3;
        this.kekElet = 0;

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
        this.uzenetIdozito = null;

        this.pajzsVege = 0;
        this.arnyekVege = 0;
        this.furoAktiv = false;

        this.powerupAllapot = {
            nagyrobbanas: false,
            gyorsito: false,
            furo: false,
            pajzs: false,
            arnyek: false,
            mega: false
        };
    }

    vedett() {
        return this.sebezhetetlen || Date.now() < this.pajzsVege;
    }

    arnyekAktiv() {
        return Date.now() < this.arnyekVege;
    }

    resetPozicio(x, y) {
        this.x = x;
        this.y = y;
        this.pirosElet = 3;
        this.kekElet = 0;
        this.sebesseg = this.alapsebesseg || 250;
        this.sebezhetetlen = true;
        this.pajzsVege = 0;
        this.arnyekVege = 0;
        this.furoAktiv = false;
        this.powerupAllapot = {
            nagyrobbanas: false,
            gyorsito: false,
            furo: false,
            pajzs: false,
            arnyek: false,
            mega: false
        };
    }

    jatekosMozog(main, dx, dy) {
        const most = Date.now();
        if (most - this.utolsoMozgas < this.sebesseg) return;

        const ujX = this.x + dx;
        const ujY = this.y + dy;
        const masik = this === main.jatekos1 ? main.jatekos2 : main.jatekos1;

        if (masik.x === ujX && masik.y === ujY) return;
        if (!main.palya.ervenyesLepes(ujX, ujY, this)) return;

        main.palya.jatekosTorol(this);
        this.x = ujX;
        this.y = ujY;
        main.palya.jatekosRajzol(this, this === main.jatekos1 ? 'jatekos1' : 'jatekos2');

        if (main.palya.cella(ujX, ujY).classList.contains('powerup')) {
            main.erositesek.powerupFelvesz(this, ujX, ujY);
        }

        this.utolsoMozgas = most;
        main.palya.ellenorizVeszelyHalal(this);
    }

    bombaLetesz(main) {
        if (!main.jatekAktiv || this.bombaAktiv) return;
        this.bombaAktiv = true;
        this.idozitettBomba(main, this.x, this.y, true);
    }

    idozitettBomba(main, x, y, tulajdonosBomba = false) {
        const cella = main.palya.cella(x, y);
        if (cella.classList.contains('veszelyzona')) return;

        cella.classList.add('bomba');
        const bombaDiv = document.createElement('div');
        bombaDiv.classList.add('bombaDiv', 'bomba');
        bombaDiv.dataset.bomba = 'true';
        cella.appendChild(bombaDiv);

        setTimeout(() => {
            bombaDiv.remove();
            cella.classList.remove('bomba');
            this.robbanasAnimacio(main, x, y);
            if (tulajdonosBomba) this.bombaAktiv = false;
        }, main.bombaSebesseg);
    }

    robbanasAnimacio(main, x, y) {
        const cella = main.palya.cella(x, y);
        const kozep = document.createElement('div');
        kozep.classList.add('explozioDiv', 'explozio');
        cella.appendChild(kozep);
        cella.classList.add('romok');

        const robbanasiPontok = this.bombaRobbanas(main, x, y);
        this.jatekosSebzes(main, robbanasiPontok);

        setTimeout(() => {
            document.querySelectorAll('.explozioDiv').forEach((div) => div.remove());
        }, 500);
    }

    robbanasiIranyok() {
        const alap = [
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
        ];
        if (this.nagyrobbanas) {
            alap.push({ dx: -2, dy: 0 }, { dx: 2, dy: 0 }, { dx: 0, dy: -2 }, { dx: 0, dy: 2 });
        }
        if (this.specialisRobbanas) {
            alap.push({ dx: -1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: -1 }, { dx: 1, dy: 1 });
        }
        return alap;
    }

    bombaRobbanas(main, x, y) {
        const robbanasiPontok = [{ x, y }];
        const szetmentFalak = [];

        this.robbanasiIranyok().forEach(({ dx, dy }) => {
            const ujX = x + dx;
            const ujY = y + dy;
            if (ujX < 0 || ujX >= main.sorok || ujY < 0 || ujY >= main.oszlopok) return;

            const cella = main.palya.cella(ujX, ujY);
            if (cella.classList.contains('doboz')) {
                cella.classList.remove('doboz');
                szetmentFalak.push({ x: ujX, y: ujY });
            }
            cella.classList.remove('powerup');
            cella.classList.add('perzseles');

            const expl = document.createElement('div');
            expl.classList.add('explozioDiv', 'explozio');
            cella.appendChild(expl);
            robbanasiPontok.push({ x: ujX, y: ujY });
        });

        if (this.furoAktiv && szetmentFalak.length > 0) {
            this.furoAktiv = false;
            this.powerupAllapot.furo = false;
            this.furoLancRobbantas(main, szetmentFalak, robbanasiPontok);
        }

        if (this.nagyrobbanas) {
            this.nagyrobbanas = false;
            this.powerupAllapot.nagyrobbanas = false;
        }

        main.frissitJatekosPanelok();
        return robbanasiPontok;
    }

    furoLancRobbantas(main, kiinduloFalak, robbanasiPontok) {
        const pluszDb = Math.floor(Math.random() * 10) + 1;
        const jeloltek = [];

        kiinduloFalak.forEach(({ x, y }) => {
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    const ujX = x + dx;
                    const ujY = y + dy;
                    if (ujX < 0 || ujX >= main.sorok || ujY < 0 || ujY >= main.oszlopok) continue;
                    const cella = main.palya.cella(ujX, ujY);
                    if (cella.classList.contains('doboz')) {
                        jeloltek.push({ x: ujX, y: ujY });
                    }
                }
            }
        });

        for (let i = 0; i < pluszDb && jeloltek.length > 0; i++) {
            const idx = Math.floor(Math.random() * jeloltek.length);
            const { x, y } = jeloltek.splice(idx, 1)[0];
            const cella = main.palya.cella(x, y);
            cella.classList.remove('doboz');
            cella.classList.remove('powerup');
            cella.classList.add('perzseles');

            const expl = document.createElement('div');
            expl.classList.add('explozioDiv', 'explozio');
            cella.appendChild(expl);
            robbanasiPontok.push({ x, y });
        }
    }

    jatekosSebzes(main, robbanasiPontok) {
        [main.jatekos1, main.jatekos2].forEach((cel) => {
            if (cel.vedett()) return;
            const serult = robbanasiPontok.some((p) => p.x === cel.x && p.y === cel.y);
            if (serult) cel.sebezodik(main);
        });
    }

    sebezodik(main) {
        if (this.kekElet > 0) {
            this.kekElet -= 1;
            main.frissitJatekosPanelok();
            return;
        }

        this.pirosElet -= 1;
        if (this.pirosElet > 0) {
            main.frissitJatekosPanelok();
            return;
        }

        this.jatekosHal(main);
    }

    jatekosHal(main) {
        const halalX = this.x;
        const halalY = this.y;

        main.palya.jatekosTorol(this);
        const cella = main.palya.cella(halalX, halalY);
        cella.classList.add('jatekosHalal');
        setTimeout(() => cella.classList.remove('jatekosHalal'), 1000);

        if (this === main.jatekos1) main.jatekos2.pont += 1;
        else main.jatekos1.pont += 1;

        const ujHely = main.palya.kozelbenUresPozicio(halalX, halalY, 3);
        if (ujHely) this.resetPozicio(ujHely.x, ujHely.y);
        else {
            const alap = this === main.jatekos1 ? { x: 1, y: 1 } : { x: main.sorok - 2, y: main.oszlopok - 2 };
            this.resetPozicio(alap.x, alap.y);
        }

        main.palya.jatekosRajzol(this, this === main.jatekos1 ? 'jatekos1' : 'jatekos2');
        const ujDiv = main.palya.cella(this.x, this.y).querySelector('.jatekosDiv');
        if (ujDiv) {
            ujDiv.classList.add('sebezhetetlen');
            setTimeout(() => {
                this.sebezhetetlen = false;
                ujDiv.classList.remove('sebezhetetlen');
            }, 1000);
        }

        main.frissitJatekosPanelok();
        main.ellenorizGyozelem();
    }
}
