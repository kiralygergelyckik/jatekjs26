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
}
