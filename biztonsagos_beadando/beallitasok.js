const KARAKTER_PRESET = {
    '0': { sebessegSzorzo: 1.2, alapPirosElet: 3, bombaido: 3000 },
    '1': { uszo: true, alapPirosElet: 2, nagyrobbanas: true },
    '2': { nagyrobbanas: true, sebessegSzorzo: 1, alapPirosElet: 3 },
    '3': { specialisRobbanas: true, alapPirosElet: 3 }
};

export class Beallitasok {
    constructor(main) {
        this.main = main;
    }

    megjelenitBeallitasok() {
        const ablak = this.nyitAblak(`
            <h2>Beállítások</h2>
            <div class="time-limit">
                <label for="time-limit">Időlimit (mp):</label>
                <input type="number" id="time-limit" value="${this.main.idokorlathoz > 0 ? this.main.idokorlathoz : ''}" min="0">
            </div>
            <div class="time-limit">
                <label for="tabla-meret">Pálya méret:</label>
                <select id="tabla-meret">
                    <option value="kicsi" ${this.main.meret === 'kicsi' ? 'selected' : ''}>Kicsi (15x15)</option>
                    <option value="kozepes" ${this.main.meret === 'kozepes' ? 'selected' : ''}>Közepes (24x24)</option>
                    <option value="nagy" ${this.main.meret === 'nagy' ? 'selected' : ''}>Nagy (30x30)</option>
                </select>
            </div>
            <button id="beallitas-alkalmaz">Beállítások alkalmazása</button>
            <button id="beallitas-megse">Mégse</button>
        `);

        this.kot('beallitas-alkalmaz', () => this.alkalmazBeallitasok());
        this.kot('beallitas-megse', () => this.bezarAblak(ablak));
    }

    alkalmazBeallitasok() {
        const limit = document.getElementById('time-limit');
        const meret = document.getElementById('tabla-meret')?.value || 'kozepes';
        this.main.idokorlathoz = limit?.value ? parseInt(limit.value, 10) : 0;
        this.main.frissitTablaMeret(meret);
        this.bezarAktivAblak();
    }

    palyak() {
        const ablak = this.nyitAblak(`
            <h2>Pálya gyakoriságok (1-10)</h2>
            <label>Téglák: <input type="range" id="freq-doboz" min="1" max="10" value="${this.main.freqDoboz || 5}"> <span id="freq-doboz-v">${this.main.freqDoboz || 5}</span></label><br>
            <label>Víz: <input type="range" id="freq-viz" min="1" max="10" value="${this.main.freqViz || 5}"> <span id="freq-viz-v">${this.main.freqViz || 5}</span></label><br>
            <label>Powerup: <input type="range" id="freq-powerup" min="1" max="10" value="${this.main.freqPowerup || 5}"> <span id="freq-powerup-v">${this.main.freqPowerup || 5}</span></label><br>
            <button id="palya-alkalmaz">Alkalmaz</button>
            <button id="palya-megse">Mégse</button>
        `);

        ['doboz', 'viz', 'powerup'].forEach((k) => {
            const input = document.getElementById(`freq-${k}`);
            const out = document.getElementById(`freq-${k}-v`);
            if (!input || !out) return;
            input.addEventListener('input', () => { out.textContent = input.value; });
        });

        this.kot('palya-alkalmaz', () => this.palyaKivalasztas());
        this.kot('palya-megse', () => this.bezarAblak(ablak));
    }

    palyaKivalasztas() {
        this.main.freqDoboz = Number(document.getElementById('freq-doboz')?.value || 5);
        this.main.freqViz = Number(document.getElementById('freq-viz')?.value || 5);
        this.main.freqPowerup = Number(document.getElementById('freq-powerup')?.value || 5);
        localStorage.setItem('freqDoboz', String(this.main.freqDoboz));
        localStorage.setItem('freqViz', String(this.main.freqViz));
        localStorage.setItem('freqPowerup', String(this.main.freqPowerup));
        this.bezarAktivAblak();
    }

    karakterek() {
        const ablak = this.nyitAblak(`
            <h2>Karakterválasztás</h2>
            <div class="karakter-grid">
                <div><h3>Játékos 1</h3>${this.karakterHTML('karakter1', this.main.karakter1)}</div>
                <div><h3>Játékos 2</h3>${this.karakterHTML('karakter2', this.main.karakter2)}</div>
                <div><h3>Játékos 3</h3>${this.karakterHTML('karakter3', this.main.karakter3)}</div>
                <div><h3>Játékos 4</h3>${this.karakterHTML('karakter4', this.main.karakter4)}</div>
            </div>
            <div class="karakter-stats">
                <p><b>Express:</b> 1.2x sebesség.</p>
                <p><b>Úszó:</b> vízen is átmegy, 2 piros szívvel kezd, nagyrobbanással indul.</p>
                <p><b>Törött:</b> nagyrobbanás induláskor.</p>
                <p><b>Köret:</b> csak körbebomba (speciális robbanás).</p>
            </div>
            <button id="karakter-alkalmaz">Alkalmaz</button>
            <button id="karakter-megse">Mégse</button>
        `);

        this.kot('karakter-alkalmaz', () => this.karakterKivalasztas());
        this.kot('karakter-megse', () => this.bezarAblak(ablak));
    }

    karakterHTML(name, selected) {
        return `
            <label><input type="radio" name="${name}" value="0" ${selected === '0' ? 'checked' : ''}> Express</label><br>
            <label><input type="radio" name="${name}" value="1" ${selected === '1' ? 'checked' : ''}> Úszó</label><br>
            <label><input type="radio" name="${name}" value="2" ${selected === '2' ? 'checked' : ''}> Törött</label><br>
            <label><input type="radio" name="${name}" value="3" ${selected === '3' ? 'checked' : ''}> Köret</label><br>
        `;
    }

    karakterKivalasztas() {
        this.main.karakter1 = document.querySelector('input[name="karakter1"]:checked')?.value || '0';
        this.main.karakter2 = document.querySelector('input[name="karakter2"]:checked')?.value || '0';
        this.main.karakter3 = document.querySelector('input[name="karakter3"]:checked')?.value || '0';
        this.main.karakter4 = document.querySelector('input[name="karakter4"]:checked')?.value || '0';
        localStorage.setItem('karakter1', this.main.karakter1);
        localStorage.setItem('karakter2', this.main.karakter2);
        localStorage.setItem('karakter3', this.main.karakter3);
        localStorage.setItem('karakter4', this.main.karakter4);
        this.bezarAktivAblak();
    }

    karakterAlkalmazas() {
        this.karakterPresetAlkalmaz(this.main.jatekos1, this.main.karakter1);
        this.karakterPresetAlkalmaz(this.main.jatekos2, this.main.karakter2);
        this.karakterPresetAlkalmaz(this.main.jatekos3, this.main.karakter3);
        this.karakterPresetAlkalmaz(this.main.jatekos4, this.main.karakter4);
        this.main.frissitJatekosPanelok();
    }

    karakterPresetAlkalmaz(jatekos, karakterKod) {
        jatekos.sebesseg = jatekos.alapsebesseg || 250;
        jatekos.bombaido = 0;
        jatekos.nagyrobbanas = false;
        jatekos.specialisRobbanas = false;
        jatekos.powerupInditas = false;
        jatekos.uszo = false;
        jatekos.alapPirosElet = 3;
        jatekos.karakterKod = karakterKod;

        const preset = KARAKTER_PRESET[karakterKod];
        if (preset) {
            Object.entries(preset).forEach(([kulcs, ertek]) => {
                if (kulcs === 'sebessegSzorzo') {
                    jatekos.sebesseg = Math.max(80, Math.floor((jatekos.alapsebesseg || 250) / ertek));
                    return;
                }
                jatekos[kulcs] = ertek;
            });
        }

        jatekos.pirosElet = jatekos.alapPirosElet || 3;
        jatekos.kekElet = 0;
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