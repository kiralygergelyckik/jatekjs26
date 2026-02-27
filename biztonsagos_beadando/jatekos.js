export class Jatekos {
    constructor({ nev, x, y, sebesseg, alapsebesseg }) {
        this.nev = nev;
        this.x = x;
        this.y = y;
        this.pont = 0;

        this.alapPirosElet = 3;
        this.pirosElet = this.alapPirosElet || 3;
        this.kekElet = 0;
        this.uszasVege = 0;
        this.latoszogVege = 0;
        this.halottEppen = false;

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
        this.powerupPopup = '';
        this.powerupOpacity = 0;
        this.powerupInterval = null;

        this.pajzsVege = 0;
        this.arnyekVege = 0;
        this.furoAktiv = false;

        this.powerupAllapot = {
            nagyrobbanas: false,
            gyorsito: false,
            furo: false,
            pajzs: false,
            arnyek: false,
            uszas: false,
            latoszog: false,
            mega: false
        };
    }

    vedett() {
        return this.sebezhetetlen || Date.now() < this.pajzsVege;
    }

    arnyekAktiv() {
        return Date.now() < this.arnyekVege;
    }

    uszasAktiv() {
        return this.uszo || Date.now() < this.uszasVege;
    }

    resetPozicio(x, y) {
        this.x = x;
        this.y = y;
        this.pirosElet = this.alapPirosElet || 3;
        this.kekElet = 0;
        this.uszasVege = 0;
        this.latoszogVege = 0;
        this.halottEppen = false;
        this.sebesseg = this.alapsebesseg || 250;
        this.sebezhetetlen = true;
        this.pajzsVege = 0;
        this.arnyekVege = 0;
        this.furoAktiv = false;
        if (this.powerupInterval) clearInterval(this.powerupInterval);
        this.powerupInterval = null;
        this.powerupPopup = '';
        this.powerupOpacity = 0;
        this.powerupAllapot = {
            nagyrobbanas: false,
            gyorsito: false,
            furo: false,
            pajzs: false,
            arnyek: false,
            uszas: false,
            latoszog: false,
            mega: false
        };
    }

    jatekosMozog(main, dx, dy) {
        const most = Date.now();
        if (most - this.utolsoMozgas < this.sebesseg) return;

        const ujX = this.x + dx;
        const ujY = this.y + dy;

        const utkozes = main.osszesJatekos().some((jatekos) => jatekos !== this && jatekos.x === ujX && jatekos.y === ujY);
        if (utkozes) return;
        if (!main.palya.ervenyesLepes(ujX, ujY, this)) return;

        main.palya.jatekosTorol(this);
        this.x = ujX;
        this.y = ujY;
        const idx = main.players.indexOf(this);
        main.palya.jatekosRajzol(this, `jatekos${idx + 1}`);

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

        setTimeout(() => {
            cella.classList.remove('bomba');
            this.robbanasAnimacio(main, x, y);
            if (tulajdonosBomba) this.bombaAktiv = false;
        }, main.bombaSebesseg);
    }

    robbanasAnimacio(main, x, y) {
        const cella = main.palya.cella(x, y);
        cella.classList.add('romok');

        const robbanasiPontok = this.bombaRobbanas(main, x, y);
        this.jatekosSebzes(main, robbanasiPontok);
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
            // if (cella.classList.contains('doboz')) {
            //     cella.classList.remove('doboz');
            //     cella.classList.add('perzseles');
            //     szetmentFalak.push({ x: ujX, y: ujY });
            // }
            cella.classList.remove('powerup');
            cella.classList.remove('doboz');
            if(!cella.classList.contains('viz'))
            cella.classList.add('perzseles');
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

            robbanasiPontok.push({ x, y });
        }
    }

    jatekosSebzes(main, robbanasiPontok) {
        main.osszesJatekos().forEach((cel) => {
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
        if (this.pirosElet + this.kekElet > 0) {
            main.frissitJatekosPanelok();
            return;
        }

        this.jatekosHal(main);
    }

    jatekosHal(main) {
        if (this.halottEppen) return;
        this.halottEppen = true;
        const halalX = this.x;
        const halalY = this.y;

        main.palya.jatekosTorol(this);
        const cella = main.palya.cella(halalX, halalY);
        cella.classList.add('jatekosHalal');
        setTimeout(() => cella.classList.remove('jatekosHalal'), 1000);

        main.osszesJatekos()
            .filter((jatekos) => jatekos !== this)
            .forEach((jatekos) => { jatekos.pont += 1; });

        const ujHely = main.palya.kozelbenUresPozicio(halalX, halalY, 3);
        if (ujHely) this.resetPozicio(ujHely.x, ujHely.y);
        else {
            const alap = main.kezdoPozicioByPlayer(this);
            this.resetPozicio(alap.x, alap.y);
        }

        const idx = main.osszesJatekos().indexOf(this);
        main.palya.jatekosRajzol(this, `jatekos${idx + 1}`);
        setTimeout(() => {
            this.sebezhetetlen = false;
            this.halottEppen = false;
        }, 1000);

        main.frissitJatekosPanelok();
        main.ellenorizGyozelem();
    }
}