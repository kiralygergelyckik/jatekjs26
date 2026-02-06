export class Jatekos {
    constructor(nev, x, y) {
        this.nev = nev;
        this.x = x;
        this.y = y;

        this.pont = 0;
        this.elet = 1;

        this.sebesseg = 250;
        this.alapsebesseg = 250;

        this.utolsoMozgas = 0;
        this.bombaAktiv = false;
        this.bombaido = 0;

        this.sebezhetetlen = false;
        this.veszelybenToltottIdo = 0;

        this.nagyrobbanas = false;
        this.specialisRobbanas = false;
        this.powerupInditas = false;
    }

    resetPozicio(x, y) {
        this.x = x;
        this.y = y;
    }

    sebzes() {
        if (this.sebezhetetlen) return false;
        this.elet--;
        return this.elet <= 0;
    }

    halhatatlan(ms = 1000) {
        this.sebezhetetlen = true;
        setTimeout(() => this.sebezhetetlen = false, ms);
    }

    gyorsitas(ms = 5000, ujSeb = 125) {
        this.sebesseg = ujSeb;
        setTimeout(() => this.sebesseg = this.alapsebesseg, ms);
    }
}
