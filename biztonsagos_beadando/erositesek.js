const POWERUPOK = ['nagyrobbanas', 'pluszelet', 'gyorsito', 'furo', 'pajzs', 'arnyek', 'uszas', 'latoszog', 'bomba', 'mega'];

export class Erositesek {
    constructor(main) {
        this.main = main;
    }

    powerupFelvesz(jatekos, x, y) {
        const tipus = POWERUPOK[Math.floor(Math.random() * POWERUPOK.length)];
        this.main.palya.cella(x, y).classList.remove('powerup');

        switch (tipus) {
            case 'nagyrobbanas':
                jatekos.nagyrobbanas = true;
                jatekos.powerupAllapot.nagyrobbanas = true;
                this.main.mutatPowerupUzenet(jatekos, 'Nagyrobbanás');
                break;
            case 'pluszelet': {
                const total = (jatekos.pirosElet || 0) + (jatekos.kekElet || 0);
                if (total < 6) jatekos.kekElet = Math.min(6 - (jatekos.pirosElet || 0), (jatekos.kekElet || 0) + 1);
                this.main.mutatPowerupUzenet(jatekos, 'Plusz élet');
                break;
            }
            case 'gyorsito':
                jatekos.regisebesseg = jatekos.sebesseg;
                jatekos.sebesseg = Math.max(90, jatekos.sebesseg - 100);
                jatekos.powerupAllapot.gyorsito = true;
                this.main.mutatPowerupUzenet(jatekos, 'Gyorsító');
                setTimeout(() => this.gyorsitoLejar(jatekos), 5000);
                break;
            case 'furo':
                jatekos.furoAktiv = true;
                jatekos.powerupAllapot.furo = true;
                this.main.mutatPowerupUzenet(jatekos, 'Fúró');
                break;
            case 'pajzs':
                jatekos.pajzsVege = Date.now() + 10000;
                jatekos.powerupAllapot.pajzs = true;
                this.main.mutatPowerupUzenet(jatekos, 'Pajzs (10s)');
                setTimeout(() => {
                    jatekos.powerupAllapot.pajzs = false;
                    this.main.frissitJatekosPanelok();
                }, 10000);
                break;
            case 'arnyek':
                jatekos.arnyekVege = Date.now() + 10000;
                jatekos.powerupAllapot.arnyek = true;
                this.main.mutatPowerupUzenet(jatekos, 'Árnyék (10s)');
                setTimeout(() => {
                    jatekos.powerupAllapot.arnyek = false;
                    this.main.frissitJatekosPanelok();
                }, 10000);
                break;
            case 'uszas':
                jatekos.uszasVege = Date.now() + 10000;
                jatekos.powerupAllapot.uszas = true;
                this.main.mutatPowerupUzenet(jatekos, 'Úszás (10s)');
                setTimeout(() => {
                    jatekos.powerupAllapot.uszas = false;
                    this.main.frissitJatekosPanelok();
                }, 10000);
                break;
            case 'latoszog':
                jatekos.latoszogVege = Date.now() + 10000;
                jatekos.powerupAllapot.latoszog = true;
                this.main.mutatPowerupUzenet(jatekos, 'Látószög 7x7 (10s)');
                setTimeout(() => {
                    jatekos.powerupAllapot.latoszog = false;
                    this.main.frissitJatekosPanelok();
                }, 10000);
                break;
            case 'bomba':
                jatekos.idozitettBomba(this.main, x, y, false);
                this.main.mutatPowerupUzenet(jatekos, 'Bomba');
                break;
            case 'mega':
                jatekos.powerupAllapot.mega = true;
                this.main.mutatPowerupUzenet(jatekos, 'MEGA x9');
                this.megaBomba(jatekos);
                jatekos.powerupAllapot.mega = false;
                break;
            default:
                break;
        }

        this.main.frissitJatekosPanelok();
    }

    gyorsitoLejar(jatekos) {
        jatekos.sebesseg = jatekos.regisebesseg || jatekos.alapsebesseg || 250;
        jatekos.powerupAllapot.gyorsito = false;
        this.main.frissitJatekosPanelok();
    }

    megaBomba(jatekos) {
        const tiltott = [];
        for (let i = 0; i < this.main.sorok; i++) {
            for (let j = 0; j < this.main.oszlopok; j++) {
                const cella = this.main.palya.cella(i, j);
                if (cella.classList.contains('veszelyzona')) tiltott.push({ r: i, c: j });
            }
        }

        const helyek = this.main.palya.egyediPoziciok(9, tiltott);
        helyek.forEach(({ r, c }) => jatekos.idozitettBomba(this.main, r, c, false));
    }
}