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
}