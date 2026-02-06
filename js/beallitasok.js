const KARAKTER_PRESET = {
    '0': { sebesseg: 400, alapsebesseg: 400, bombaido: 3000 },
    '1': { bombaido: 0 },
    '2': { nagyrobbanas: true, sebesseg: 125, powerupInditas: true },
    '3': { specialisRobbanas: true, sebesseg: 140 }
};

export class Beallitasok {
    constructor(main) {
        this.main = main;
    }

    megjelenitBeallitasok() {
        const ablak = this.nyitAblak(`
            <h2>Beállítások</h2>
            <p>(nehézség, bomba idő, pályaméret)</p>
            <div class="nehezseg-beallitasa">
                <label><input type="radio" name="nehezseg" value="konnyu" ${this.main.nehezseg === 'konnyu' ? 'checked' : ''}> Könnyű</label>
                <label><input type="radio" name="nehezseg" value="alap" ${this.main.nehezseg === 'alap' ? 'checked' : ''}> Alap</label>
                <label><input type="radio" name="nehezseg" value="nehez" ${this.main.nehezseg === 'nehez' ? 'checked' : ''}> Nehéz</label>
            </div>
            <div class="time-limit">
                <label for="time-limit">Időlimit (mp):</label>
                <input type="number" id="time-limit" value="${this.main.idokorlathoz > 0 ? this.main.idokorlathoz : ''}" min="0">
            </div>
            <div class="time-limit">
                <label for="tabla-meret">Pálya méret:</label>
                <select id="tabla-meret">
                    <option value="kicsi" ${this.main.meret === 'kicsi' ? 'selected' : ''}>Kicsi (8x8)</option>
                    <option value="kozepes" ${this.main.meret === 'kozepes' ? 'selected' : ''}>Közepes (15x15)</option>
                    <option value="nagy" ${this.main.meret === 'nagy' ? 'selected' : ''}>Nagy (24x24)</option>
                </select>
            </div>
            <button id="beallitas-alkalmaz">Beállítások alkalmazása</button>
            <button id="beallitas-megse">Mégse</button>
        `);

        this.kot('beallitas-alkalmaz', () => this.alkalmazBeallitasok());
        this.kot('beallitas-megse', () => this.bezarAblak(ablak));
    }

    alkalmazBeallitasok() {
        const nehezseg = document.querySelector('input[name="nehezseg"]:checked')?.value || 'alap';
        const limit = document.getElementById('time-limit');
        const meret = document.getElementById('tabla-meret')?.value || 'kozepes';

        this.main.nehezseg = nehezseg;
        this.main.idokorlathoz = limit?.value ? parseInt(limit.value, 10) : 0;
        this.main.frissitTablaMeret(meret);

        this.frissitBeallitasok();
        this.bezarAktivAblak();
    }

    frissitBeallitasok() {
        switch (this.main.nehezseg) {
            case 'konnyu':
                this.beallitJatekParameterek(0.5, 1500);
                this.main.jatekos1.sebesseg = 300;
                this.main.jatekos2.sebesseg = 300;
                break;
            case 'nehez':
                this.beallitJatekParameterek(0.2, 500);
                this.main.jatekos1.sebesseg = 300;
                this.main.jatekos2.sebesseg = 300;
                break;
            default:
                this.beallitJatekParameterek(1, 1000);
                break;
        }
    }

    beallitJatekParameterek(esely, sebesseg) {
        this.main.powerUpEsely = esely;
        this.main.bombaSebesseg = sebesseg;
    }

    grafika() {
        const ablak = this.nyitAblak(`
            <h2>Grafikai beállítások</h2>
            <label><input type="checkbox" id="hattervaltas"> Szivárványos háttér</label><br>
            <label><input type="checkbox" id="kepeshatter1"> Természetes háttér</label><br>
            <label><input type="checkbox" id="kepeshatter2"> Esti háttér</label><br>
            <label>Játékos 1 színe: <input type="color" id="jatekos1Szin"></label><br>
            <label>Játékos 2 színe: <input type="color" id="jatekos2Szin"></label><br>
            <button id="grafika-alkalmaz">Alkalmaz</button>
            <button id="grafika-megse">Mégse</button>
        `);

        document.getElementById('hattervaltas').checked = localStorage.getItem('hatter') === 'igen';
        document.getElementById('kepeshatter1').checked = localStorage.getItem('kepeshatter1') === 'igen';
        document.getElementById('kepeshatter2').checked = localStorage.getItem('kepeshatter2') === 'igen';
        document.getElementById('jatekos1Szin').value = localStorage.getItem('jatekos1Szin') || '#ff0000';
        document.getElementById('jatekos2Szin').value = localStorage.getItem('jatekos2Szin') || '#0000ff';

        this.kot('grafika-alkalmaz', () => this.alkalmazGrafikaiBeallitasok());
        this.kot('grafika-megse', () => this.bezarAblak(ablak));
    }

    alkalmazGrafikaiBeallitasok() {
        localStorage.setItem('hatter', document.getElementById('hattervaltas').checked ? 'igen' : 'nem');
        localStorage.setItem('kepeshatter1', document.getElementById('kepeshatter1').checked ? 'igen' : 'nem');
        localStorage.setItem('kepeshatter2', document.getElementById('kepeshatter2').checked ? 'igen' : 'nem');
        localStorage.setItem('jatekos1Szin', document.getElementById('jatekos1Szin').value);
        localStorage.setItem('jatekos2Szin', document.getElementById('jatekos2Szin').value);
        this.alkalmazGrafikaiBeallitasokValoban();
        this.bezarAktivAblak();
    }

    alkalmazGrafikaiBeallitasokValoban() {
        const hatter = localStorage.getItem('hatter') === 'igen';
        const kepeshatter1 = localStorage.getItem('kepeshatter1') === 'igen';
        const kepeshatter2 = localStorage.getItem('kepeshatter2') === 'igen';

        if (kepeshatter1) {
            document.body.style.background = 'url("grafika/fak.png")';
            document.body.style.backgroundSize = 'cover';
        } else if (kepeshatter2) {
            document.body.style.background = 'url("grafika/este.jpg")';
            document.body.style.backgroundSize = 'cover';
        } else if (hatter) {
            document.body.style.background = 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)';
        } else {
            document.body.style.background = '';
        }

        const szin1 = localStorage.getItem('jatekos1Szin') || '#ff0000';
        const szin2 = localStorage.getItem('jatekos2Szin') || '#0000ff';
        let stilus = document.getElementById('grafika-stilus');
        if (!stilus) {
            stilus = document.createElement('style');
            stilus.id = 'grafika-stilus';
            document.head.appendChild(stilus);
        }
        stilus.innerHTML = `.jatekos1 { background-color: ${szin1} !important; } .jatekos2 { background-color: ${szin2} !important; }`;
    }

    palyak() {
        const ablak = this.nyitAblak(`
            <h2>Pályatipus választás</h2>
            <label><input type="radio" name="palya" value="palya1" ${this.main.valasztottPalya === 'palya1' ? 'checked' : ''}> POWERUP</label><br>
            <label><input type="radio" name="palya" value="palya2" ${this.main.valasztottPalya === 'palya2' ? 'checked' : ''}> WALLUP</label><br>
            <label><input type="radio" name="palya" value="palya3" ${this.main.valasztottPalya === 'palya3' ? 'checked' : ''}> Mező</label><br>
            <label><input type="radio" name="palya" value="" ${!this.main.valasztottPalya ? 'checked' : ''}> Véletlenszerű</label><br>
            <button id="palya-alkalmaz">Alkalmaz</button>
            <button id="palya-megse">Mégse</button>
        `);

        this.kot('palya-alkalmaz', () => this.palyaKivalasztas());
        this.kot('palya-megse', () => this.bezarAblak(ablak));
    }

    palyaKivalasztas() {
        const valasztott = document.querySelector('input[name="palya"]:checked')?.value || '';
        this.main.valasztottPalya = valasztott || null;
        localStorage.setItem('palya', this.main.valasztottPalya || '');
        this.bezarAktivAblak();
    }

    karakterek() {
        const ablak = this.nyitAblak(`
            <h2>Karakterválasztás</h2>
            <h3>Játékos 1</h3>
            ${this.karakterHTML('karakter1', this.main.karakter1)}
            <h3>Játékos 2</h3>
            ${this.karakterHTML('karakter2', this.main.karakter2)}
            <button id="karakter-alkalmaz">Alkalmaz</button>
            <button id="karakter-megse">Mégse</button>
        `);

        this.kot('karakter-alkalmaz', () => this.karakterKivalasztas());
        this.kot('karakter-megse', () => this.bezarAblak(ablak));
    }

    karakterHTML(name, selected) {
        return `
            <label><input type="radio" name="${name}" value="0" ${selected === '0' ? 'checked' : ''}> Express</label><br>
            <label><input type="radio" name="${name}" value="1" ${selected === '1' ? 'checked' : ''}> Szakértő</label><br>
            <label><input type="radio" name="${name}" value="2" ${selected === '2' ? 'checked' : ''}> Törött</label><br>
            <label><input type="radio" name="${name}" value="3" ${selected === '3' ? 'checked' : ''}> Köret</label><br>
        `;
    }

    karakterKivalasztas() {
        this.main.karakter1 = document.querySelector('input[name="karakter1"]:checked')?.value || '0';
        this.main.karakter2 = document.querySelector('input[name="karakter2"]:checked')?.value || '0';
        localStorage.setItem('karakter1', this.main.karakter1);
        localStorage.setItem('karakter2', this.main.karakter2);
        this.bezarAktivAblak();
    }

    karakterAlkalmazas() {
        this.karakterPresetAlkalmaz(this.main.jatekos1, this.main.karakter1);
        this.karakterPresetAlkalmaz(this.main.jatekos2, this.main.karakter2);
        this.main.frissitJatekosPanelok();
    }

    karakterPresetAlkalmaz(jatekos, karakterKod) {
        const preset = KARAKTER_PRESET[karakterKod];
        if (!preset) return;
        Object.entries(preset).forEach(([kulcs, ertek]) => { jatekos[kulcs] = ertek; });
    }

    nyitAblak(innerHtml) {
        this.bezarAktivAblak();
        const ablak = document.createElement('div');
        ablak.classList.add('beallitaskepernyo');
        ablak.innerHTML = innerHtml;
        document.body.appendChild(ablak);
        return ablak;
    }

    kot(id, callback) {
        const elem = document.getElementById(id);
        if (elem) elem.addEventListener('click', callback);
    }

    bezarAblak(ablak) {
        if (ablak) ablak.remove();
    }

    bezarAktivAblak() {
        const ablak = document.querySelector('.beallitaskepernyo');
        if (ablak) ablak.remove();
    }
}
