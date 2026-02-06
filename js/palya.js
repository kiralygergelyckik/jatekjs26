export class Palya {
    constructor(sorok, oszlopok, tablaElem) {
        this.sorok = sorok;
        this.oszlopok = oszlopok;
        this.tablaElem = tablaElem;
        this.tabla = [];
    }

    letrehoz() {
        this.tablaElem.innerHTML = '';
        this.tabla = Array.from({ length: this.sorok }, () =>
            Array.from({ length: this.oszlopok })
        );

        for (let i = 0; i < this.sorok; i++) {
            const tr = document.createElement('tr');
            for (let j = 0; j < this.oszlopok; j++) {
                const td = document.createElement('td');
                tr.appendChild(td);
                this.tabla[i][j] = td;
            }
            this.tablaElem.appendChild(tr);
        }
    }

    ervenyes(x, y) {
        return (
            x >= 0 && x < this.sorok &&
            y >= 0 && y < this.oszlopok &&
            !this.tabla[x][y].classList.contains('doboz') &&
            !this.tabla[x][y].classList.contains('bomba')
        );
    }

    egyediPoziciok(db, tiltott = []) {
        const poz = [];
        while (poz.length < db) {
            const r = Math.floor(Math.random() * this.sorok);
            const c = Math.floor(Math.random() * this.oszlopok);
            if (
                !tiltott.some(p => p.r === r && p.c === c) &&
                !poz.some(p => p.r === r && p.c === c)
            ) {
                poz.push({ r, c });
            }
        }
        return poz;
    }

    objektumok(poziciok, osztaly) {
        poziciok.forEach(({ r, c }) => {
            this.tabla[r][c].classList.add(osztaly);
        });
    }
}
