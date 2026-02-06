const sorok = 15;
const oszlopok = 15;
let tabla = [];
let jatekos1 = {nev: "Piros",x: 0, y: 0, pont: 0, elet: 1, utolsoMozgas: 0, bombaAktiv: false, veszelybenToltottIdo: 0, sebezhetetlen: false, nagyrobbanas: false, sebesseg: 250, alapsebesseg: 250};
let jatekos2 = {nev: "Kék",x: 14, y: 14, pont: 0, elet: 1, utolsoMozgas: 0, bombaAktiv: false, veszelybenToltottIdo: 0, sebezhetetlen: false, nagyrobbanas: false, sebesseg: 250, alapsebesseg: 250};
let nehezseg = 'alap';
let idokorlathoz = 0;
let hatralevoIdo = 0;
let idozito = null;
let powerUpEsely = 1;
let bombaSebesseg = 1000;
let veszelySzint = 0;
let veszelyInterval = null;
let jatekAktiv = false;
let felvehete = true;
let regisebesseg;
let valasztottKarakter = localStorage.getItem('karakter') || '0';
let karakter1 = localStorage.getItem('karakter1') || '0';
let karakter2 = localStorage.getItem('karakter2') || '0';
let valasztottPalya = localStorage.getItem('palya') || null;

const pontElem = document.createElement('div');
pontElem.id = 'pontszam';
document.body.prepend(pontElem);

function megjelenitBeallitasok() {
    const ablak = document.createElement('div');
    ablak.classList.add('beallitaskepernyo'); 
    ablak.innerHTML = `
        <h2>Beállítások</h2>
        <p>(bomba robbanásának sebessége, powerup esély)</p>
        <div class="nehezseg-beallitasa">
            <label for="konnyu">Könnyű</label>
            <input type="radio" id="konnyu" name="nehezseg" value="konnyu" ${nehezseg === 'konnyu' ? 'checked' : ''}>
        </div>
        <div class="nehezseg-beallitasa">
            <label for="alap">Alap</label>
            <input type="radio" id="alap" name="nehezseg" value="alap" ${nehezseg === 'alap' ? 'checked' : ''}>
        </div>
        <div class="nehezseg-beallitasa">
            <label for="nehez">Nehéz</label>
            <input type="radio" id="nehez" name="nehezseg" value="nehez" ${nehezseg === 'nehez' ? 'checked' : ''}>
        </div>
        <div class="time-limit">
            <label for="time-limit">Időlimit (másodperc, veszélyzóna):</label>
            <input type="number" id="time-limit" value="${idokorlathoz > 0 ? idokorlathoz : ''}" min="0">
        </div>
        <button onclick="alkalmazBeallitasok()">Beállítások alkalmazása</button>
        <button onclick="bezarBeallitasok()">Mégse</button>
    `;
    document.body.appendChild(ablak);
}

function bezarBeallitasok() {
    const ablak = document.querySelector('.beallitaskepernyo');
    if (ablak) ablak.remove();
}
function alkalmazBeallitasok() {
    const valasztott = document.querySelector('input[name="nehezseg"]:checked').value;
    nehezseg = valasztott;
    idokorlathoz = document.getElementById('time-limit').value ? parseInt(document.getElementById('time-limit').value) : 0;
    frissitBeallitasok();
    bezarBeallitasok();
}

function frissitBeallitasok() {
    switch (nehezseg) {
        case 'konnyu': beallitJatekParameterek(0.5, 1500); jatekos1.sebesseg = 300; jatekos2.sebesseg = 300;  break;
        case 'alap': beallitJatekParameterek(1, 1000); break;
        case 'nehez': beallitJatekParameterek(0.2, 500); jatekos1.sebesseg = 300; jatekos2.sebesseg = 300; break;
    }
}

function beallitJatekParameterek(esely, sebesseg) {
    powerUpEsely = esely;
    bombaSebesseg = sebesseg;
}

function inditIdozito() {
    hatralevoIdo = idokorlathoz;
    let kijelzo = document.getElementById('timeDisplay');
    if (!kijelzo) {
    kijelzo = document.createElement('div');
    kijelzo.id = 'timeDisplay';
    document.body.appendChild(kijelzo);
    }

    kijelzo.innerText = `Hátralévő idő: ${hatralevoIdo}s`;
    document.body.appendChild(kijelzo);
    idozito = setInterval(() => {
        hatralevoIdo--;
        kijelzo.innerText = `Idő hátra: ${hatralevoIdo}s`;
        if (hatralevoIdo <= 0) {
            clearInterval(idozito);
            idovegeEffekt();
        }
    }, 1000);
}

function megallitIdozito() {
    clearInterval(idozito);
    const kijelzo = document.getElementById('timeDisplay');
    if (kijelzo) kijelzo.remove();
}

function frissitPontszam() {
    if (!jatekAktiv) return;
    pontElem.innerHTML = `Játékos 1: ${jatekos1.pont} - Játékos 2: ${jatekos2.pont}`;
    if (jatekos1.pont >= 2 && karakter1 == 1 || jatekos2.pont >= 2 && karakter2 == 1) {
        jatekVege(jatekos1.pont >= 3 ? 'Játékos 1' : 'Játékos 2');
    }
    if (jatekos1.pont >= 3 || jatekos2.pont >= 3) {
        jatekVege(jatekos1.pont >= 3 ? 'Játékos 1' : 'Játékos 2');
    }
}

function jatekVege(gysz) {
    jatekAktiv = false;
    const vegeAblak = document.createElement('div');
    vegeAblak.classList.add('jatekvegekepernyo');
    vegeAblak.innerHTML = `<h2>${gysz} nyert!</h2><button onclick="ujrainditas()">Új játék</button>`;
    document.body.appendChild(vegeAblak);
    megallitIdozito();
    document.getElementById('jatekter').style.opacity = '0.2';
}

function ujrainditas() {
    location.reload();
}

function jatekTablaLetrehoz() {
    jatekAktiv = true;
    karakter1 = localStorage.getItem('karakter1') || '0';
    karakter2 = localStorage.getItem('karakter2') || '0';
    const tablaElem = document.getElementById('jatekter');
    tablaElem.innerHTML = '';
    tabla = Array.from({ length: sorok }, () => Array.from({ length: oszlopok }));

    for (let i = 0; i < sorok; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < oszlopok; j++) {
            const td = document.createElement('td');
            tr.appendChild(td);
            tabla[i][j] = td;
        }
        tablaElem.appendChild(tr);
    }

    document.getElementById('menu').style.display = 'none';
    document.getElementById('focim').style.display = 'none';

    const biztonsagosMezok = [
        { r: 0, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 1 },
        { r: 13, c: 14 }, { r: 14, c: 13 }, { r: 14, c: 14 }
    ];

    let ures = egyediPoziciok(5, biztonsagosMezok);
    let dobozok = [];
    let powerupok = [];

    switch (valasztottPalya) {
        case 'palya1': 
            dobozok = egyediPoziciok(50, [...ures, ...biztonsagosMezok]);
            powerupok = egyediPoziciok(30, [...ures, ...dobozok]);
            break;
        case 'palya2': 
            dobozok = egyediPoziciok(180, [...ures, ...biztonsagosMezok]);
            powerupok = egyediPoziciok(5, [...ures, ...dobozok]);
            break;
        case 'palya3':
            dobozok = egyediPoziciok(40, [...ures, ...biztonsagosMezok]);
            powerupok = egyediPoziciok(5, [...ures, ...dobozok]);
            break;
        default: // véletlenszerű
            dobozok = egyediPoziciok(130, [...ures, ...biztonsagosMezok]);
            powerupok = egyediPoziciok(Math.floor(Math.random() * 15) + 1, [...ures, ...dobozok]);
    }


    objektumokatHozzaad(dobozok, 'doboz');
    objektumokatHozzaad(powerupok, 'powerup');

    const div1 = document.createElement('div');
    div1.classList.add('jatekosDiv', 'jatekos1');
    tabla[jatekos1.x][jatekos1.y].appendChild(div1);

    const div2 = document.createElement('div');
    div2.classList.add('jatekosDiv', 'jatekos2');
    tabla[jatekos2.x][jatekos2.y].appendChild(div2);

    if (jatekos1.powerupInditas) {
        jatekos1.nagyrobbanas = true;
        jatekos1.powerupInditas = false;
    }
    
    if (jatekos2.powerupInditas) {
        jatekos2.nagyrobbanas = true;
        jatekos2.powerupInditas = false;
    }

    if (idokorlathoz > 0) inditIdozito();
}

function egyediPoziciok(db, kizart = []) {
    let poziciok = [];
    while (poziciok.length < db) {
        let r = Math.floor(Math.random() * sorok);
        let c = Math.floor(Math.random() * oszlopok);
        if (!kizart.some(p => p.r === r && p.c === c) && !poziciok.some(p => p.r === r && p.c === c)) {
            poziciok.push({ r, c });
        }
    }
    return poziciok;
}

function objektumokatHozzaad(poziciok, osztaly) {
    poziciok.forEach(({ r, c }) => {
        tabla[r][c].classList.add(osztaly);
    });
}

function ervenyesLepes(x, y) {
    return x >= 0 && x < sorok && y >= 0 && y < oszlopok &&
           !tabla[x][y].classList.contains('doboz') &&
           !tabla[x][y].classList.contains('bomba');
}

function jatekosMozog(jatekos, dx, dy) {
    if (!jatekAktiv) return;
    const most = Date.now();
    if (most - jatekos.utolsoMozgas < jatekos.sebesseg) return;

    let ujX = jatekos.x + dx;
    let ujY = jatekos.y + dy;
    const masik = (jatekos === jatekos1) ? jatekos2 : jatekos1;
    if (masik.x === ujX && masik.y === ujY) return;

    if (ervenyesLepes(ujX, ujY)) {
        const regiCella = tabla[jatekos.x][jatekos.y];
        const regiDiv = regiCella.querySelector('.jatekosDiv');
        if (regiDiv) regiDiv.remove();

        jatekos.x = ujX;
        jatekos.y = ujY;

        const ujDiv = document.createElement('div');
        ujDiv.classList.add('jatekosDiv', jatekos === jatekos1 ? 'jatekos1' : 'jatekos2');
        tabla[ujX][ujY].appendChild(ujDiv);

        if (tabla[ujX][ujY].classList.contains('powerup') && felvehete == true) {
            const random = Math.floor(Math.random() * 3);
            let tipus;
            felvehete = false
            if(random == 0)
                {
                    jatekos.nagyrobbanas = true;
                    tipus = "Nagyrobbanás";
                }
                else if(random == 1)
                {
                    jatekos.elet++;
                    tipus = "Plusz élet";
                }
                else
                {
                    jatekos.regisebesseg = jatekos.sebesseg
                    tipus = "Gyorsító"
                    jatekos.sebesseg = 125;
                    const idozito = setTimeout(function(){sebessegvissza(jatekos,idozito,regisebesseg)},5000);

                }
            tabla[ujX][ujY].classList.remove('powerup');
            const uzenet = `${jatekos.nev} felvette a ${tipus} powerupot!`;
            kiirKarakterenkent(uzenet, "uzenet");
        }

        jatekos.utolsoMozgas = most;
    }
    ellenorizVeszelyHalal(jatekos);
}

function kiirKarakterenkent(szoveg, celElemId) {
    const elem = document.getElementById(celElemId);
    elem.style.display = "inline";
    elem.innerHTML = "";
    let i = 0;
    const intervallum = setInterval(() => {
        if (i < szoveg.length) {
            elem.innerHTML += szoveg[i];
            i++;
        } else {
            clearInterval(intervallum);
            let idozito = setTimeout(function(){eltunes(elem,idozito)},500);
        }
    }, 30);
}

function eltunes(elem,idozito)
{
    elem.style.display = "none"
    clearTimeout(idozito)
    felvehete = true

}

function sebessegvissza(jatekos,idozito,regisebesseg)
{
    jatekos.sebesseg = jatekos.regisebesseg || 250;
    console.log("vissza")
    clearTimeout(idozito)
}

function bombaLetesz(jatekos) {
    if (jatekos.bombaido) {
        setTimeout(() => jatekos.bombaAktiv = false, jatekos.bombaido);
    } else {
        jatekos.bombaAktiv = false;
    }
    if (!jatekAktiv) return;
    if (jatekos.bombaAktiv) return;
    jatekos.bombaAktiv = true;
    const { x, y } = jatekos;
    const bombaDiv = document.createElement('div');
    bombaDiv.classList.add('bombaDiv', 'bomba');
    bombaDiv.dataset.bomba = 'true';
    tabla[x][y].appendChild(bombaDiv);

    setTimeout(() => {
        bombaDiv.remove(); 

        const explozioDiv = document.createElement('div');
        explozioDiv.classList.add('explozioDiv', 'explozio');
        tabla[x][y].appendChild(explozioDiv);

        tabla[x][y].classList.add('romok');
        BombaRobbanas(jatekos,x, y);
        jatekosSebzes(jatekos,x, y);

        setTimeout(() => {
            document.querySelectorAll('.explozioDiv').forEach(div => div.remove());
            jatekos.bombaAktiv = false;
        }, 500);
    }, bombaSebesseg);
}

function BombaRobbanas(jatekos,x, y) {
    let iranyok = [];
    if (jatekos.specialisRobbanas) {
        iranyok = [
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: -1 }, { dx: -1, dy: 1 },
            { dx: 1, dy: -1 }, { dx: 1, dy: 1 }
        ];
    }

    if(jatekos.nagyrobbanas == false)
        {
            iranyok = [
                { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
                { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
            ];
        }
        else
        {
            iranyok = [
                { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
                { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
                { dx: -2, dy: 0 }, { dx: 2, dy: 0 },
                { dx: 0, dy: -2 }, { dx: 0, dy: 2 }
            ];
        }

    iranyok.forEach(({ dx, dy }) => {
        let ujX = x + dx;
        let ujY = y + dy;
        if (ujX >= 0 && ujX < sorok && ujY >= 0 && ujY < oszlopok) {
            tabla[ujX][ujY].classList.remove('doboz');
            tabla[ujX][ujY].classList.add('perzseles');

            const explozioDiv = document.createElement('div');
            explozioDiv.classList.add('explozioDiv', 'explozio');
            tabla[ujX][ujY].appendChild(explozioDiv);
        }
    });
}

function jatekosSebzes(jatekos,x, y) {
    let terulet = [];
    if(jatekos.nagyrobbanas == false)
        {
            terulet = [
                { x, y }, { x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }, { x, y: y + 1 }
            ];
        }
        else
        {
            terulet = [
                { x, y }, { x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }, { x, y: y + 1 },{ x: x - 2, y }, { x: x + 2, y }, { x, y: y - 2 }, { x, y: y + 2 }
            ];
            jatekos.nagyrobbanas = false;
        }

    [jatekos1, jatekos2].forEach(j => {
        terulet.forEach(p => {
            if (j.x === p.x && j.y === p.y && !j.sebezhetetlen) {
                j.elet--;
                console.log(j.elet)
                if (j.elet <= 0) {
                    jatekosHal(j);
                }
                frissitPontszam();
            }
        });
    });
}

function jatekosHal(jatekos) {
    const cella = tabla[jatekos.x][jatekos.y];
    const halalozasiX = jatekos.x;
    const halalozasiY = jatekos.y;

    const div = cella.querySelector('.jatekosDiv');
    if (div) div.remove();

    cella.classList.add('jatekosHalal');
    setTimeout(() => cella.classList.remove('jatekosHalal'), 1000);

    if (jatekos === jatekos1) jatekos2.pont++;
    else jatekos1.pont++;

    frissitPontszam();

    const ujHely = kozelbenUresPozicio(halalozasiX, halalozasiY, 3);
    if (ujHely) {
        jatekos.x = ujHely.x;
        jatekos.y = ujHely.y;
    } 
    else {
        jatekos.x = jatekos === jatekos1 ? 1 : 13;
        jatekos.y = jatekos === jatekos1 ? 1 : 13;
    }
    jatekos.elet = 1;
    jatekos.sebesseg = jatekos.alapsebesseg || 250;
    jatekos.sebezhetetlen = true;

    const ujDiv = document.createElement('div');
    ujDiv.classList.add('jatekosDiv', jatekos === jatekos1 ? 'jatekos1' : 'jatekos2');
    tabla[jatekos.x][jatekos.y].appendChild(ujDiv);

    ujDiv.classList.add('sebezhetetlen');
    setTimeout(() => {
    jatekos.sebezhetetlen = false;
    ujDiv.classList.remove('sebezhetetlen');
    }, 1000);
}

function kozelbenUresPozicio(halalX, halalY, tav = 3) {
    let lehetseges = [];

    for (let dx = -tav; dx <= tav; dx++) {
        for (let dy = -tav; dy <= tav; dy++) {
            let x = halalX + dx;
            let y = halalY + dy;

            if (
                x >= 0 && x < sorok && y >= 0 && y < oszlopok &&
                ervenyesLepes(x, y) &&
                !tabla[x][y].querySelector('.jatekosDiv') &&
                !tabla[x][y].classList.contains("veszelyzona")
            ) {
                lehetseges.push({ x, y });
            }
        }
    }

    if (lehetseges.length > 0) {
        return lehetseges[Math.floor(Math.random() * lehetseges.length)];
    }

    return null;
}

const lenyomott = {};

document.addEventListener('keydown', (e) => {
    if (!lenyomott[e.key]) {
        if (e.key === 'q') bombaLetesz(jatekos1);
        if (e.key === 'm') bombaLetesz(jatekos2);
    }
    lenyomott[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    delete lenyomott[e.key];
});

setInterval(() => {
    if (lenyomott['w']) jatekosMozog(jatekos1, -1, 0);
    if (lenyomott['s']) jatekosMozog(jatekos1, 1, 0);
    if (lenyomott['a']) jatekosMozog(jatekos1, 0, -1);
    if (lenyomott['d']) jatekosMozog(jatekos1, 0, 1);

    if (lenyomott['ArrowUp']) jatekosMozog(jatekos2, -1, 0);
    if (lenyomott['ArrowDown']) jatekosMozog(jatekos2, 1, 0);
    if (lenyomott['ArrowLeft']) jatekosMozog(jatekos2, 0, -1);
    if (lenyomott['ArrowRight']) jatekosMozog(jatekos2, 0, 1);

    frissitVeszelySebzes(jatekos1, 70);
    frissitVeszelySebzes(jatekos2, 70);
}, 70);


function idovegeEffekt() {
    const kijelzo = document.getElementById('timeDisplay');
    document.getElementById('jatekter').classList.add('jatekter-veszely');
    kijelzo.innerText = '⏱ Lejárt az idő! A pálya szűkül...';
    setTimeout(() => {
        kijelzo.style.display = 'none';
    }, 5000);
    document.body.style.background = 'black';

    veszelyInterval = setInterval(() => {
        veszelySzint++;
        if (sorok - veszelySzint * 2 < 3) {
            clearInterval(veszelyInterval);
            return;
        }
        alkalmazVeszelyZona(veszelySzint);
    }, 5000);
}

function alkalmazVeszelyZona(szint) {
    for (let i = 0; i < sorok; i++) {
        for (let j = 0; j < oszlopok; j++) {
            if (
                i < szint || i >= sorok - szint ||
                j < szint || j >= oszlopok - szint
            ) 
            {
                tabla[i][j].classList.add('veszelyzona');

                if (tabla[i][j].classList.contains('powerup')) {
                    tabla[i][j].classList.remove('powerup');
                }
            }
        }
    }
}

function ellenorizVeszelyHalal(jatekos) {
    if (!jatekAktiv) return;
    const cella = tabla[jatekos.x][jatekos.y];
    if (cella.classList.contains('veszelyzona')) {
        jatekos.elet = 0;
        jatekosHal(jatekos);
        if (jatekos === jatekos1) jatekos2.pont++;
        else jatekos1.pont++;
        frissitPontszam();
    }
}

function frissitVeszelySebzes(jatekos, delta) {
    if(jatekAktiv){
    const cella = tabla[jatekos.x][jatekos.y];
    if (cella.classList.contains('veszelyzona')) {
        jatekos.veszelybenToltottIdo += delta;
        if (jatekos.veszelybenToltottIdo >= 3000) {
            jatekos.veszelybenToltottIdo = 0;
            jatekos.elet--;
            jatekosHal(jatekos);
            if (jatekos.elet <= 0) {
                (jatekos === jatekos1 ? jatekos2 : jatekos1).pont++;
                jatekos.x = jatekos === jatekos1 ? 1 : 13;
                jatekos.y = jatekos === jatekos1 ? 1 : 13;
                jatekos.elet = 1;
            }
            frissitPontszam();
        }
    } else {
        jatekos.veszelybenToltottIdo = 0;
    }
}
}

// ----------------------------------------------------------------------

function grafika() {
    const ablak = document.createElement('div');
    ablak.classList.add('beallitaskepernyo');
    ablak.innerHTML = `
        <h2>Grafikai beállítások</h2>
        <label>
            <input type="checkbox" id="hattervaltas"> Szivárványos háttér kikapcsolása
        </label><br>
        <label>
            <input type="checkbox" id="kepeshatter1"> Természetes háttérre váltás
        </label><br>
        <label>
            <input type="checkbox" id="kepeshatter2"> Esti hangulat
        </label><br>
        <label>
            Játékos 1 háttérszíne: <input type="color" id="jatekos1Szin">
        </label><br>
        <label>
            Játékos 2 háttérszíne: <input type="color" id="jatekos2Szin">
        </label><br>
        <button onclick="alkalmazGrafikaiBeallitasok()">Alkalmaz</button>
        <button onclick="bezarGrafika()">Mégse</button>
    `;
    document.body.appendChild(ablak);

    document.getElementById('hattervaltas').checked = localStorage.getItem('hatter') === 'igen';
    document.getElementById('kepeshatter1').checked = localStorage.getItem('kepeshatter1') === 'igen';
    document.getElementById('kepeshatter2').checked = localStorage.getItem('kepeshatter2') === 'igen';
    document.getElementById('jatekos1Szin').value = localStorage.getItem('jatekos1Szin') || '#ff0000';
    document.getElementById('jatekos2Szin').value = localStorage.getItem('jatekos2Szin') || '#0000ff';
}

function bezarGrafika() {
    const ablak = document.querySelector('.beallitaskepernyo');
    if (ablak) ablak.remove();
}

function alkalmazGrafikaiBeallitasok() {
    const hatter = document.getElementById('hattervaltas').checked;
    const kepeshatter1 = document.getElementById('kepeshatter1').checked;
    const kepeshatter2 = document.getElementById('kepeshatter2').checked;
    const szin1 = document.getElementById('jatekos1Szin').value;
    const szin2 = document.getElementById('jatekos2Szin').value;

    localStorage.setItem('hatter', hatter ? 'igen' : 'nem');
    localStorage.setItem('kepeshatter1', kepeshatter1 ? 'igen' : 'nem');
    localStorage.setItem('kepeshatter2', kepeshatter2 ? 'igen' : 'nem');
    localStorage.setItem('jatekos1Szin', szin1);
    localStorage.setItem('jatekos2Szin', szin2);

    alkalmazGrafikaiBeallitasokValoban();
    bezarGrafika();
}

function alkalmazGrafikaiBeallitasokValoban() {
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

    stilus.innerHTML = `
        .jatekos1 { background-color: ${szin1} !important; }
        .jatekos2 { background-color: ${szin2} !important; }
    `;
}

window.addEventListener('load', alkalmazGrafikaiBeallitasokValoban);

// ------------------------------------------------------------------


function palyak() {
    const ablak = document.createElement('div');
    ablak.classList.add('beallitaskepernyo');
    ablak.innerHTML = `
        <h2>Pályatipus választás</h2>
        <label><input type="radio" name="palya" value="palya1" ${valasztottPalya === 'palya1' ? 'checked' : ''}> POWERUP</label><br>
        <label><input type="radio" name="palya" value="palya2" ${valasztottPalya === 'palya2' ? 'checked' : ''}> WALLUP</label><br>
        <label><input type="radio" name="palya" value="palya3" ${valasztottPalya === 'palya3' ? 'checked' : ''}> Mező</label><br>
        <label><input type="radio" name="palya" value="" ${!valasztottPalya ? 'checked' : ''}> Véletlenszerű</label><br>
        <button onclick="palyaKivalasztas()">Alkalmaz</button>
        <button onclick="bezarBeallitasok()">Mégse</button>
    `;
    document.body.appendChild(ablak);
}

function palyaKivalasztas() {
    const valasztott = document.querySelector('input[name="palya"]:checked').value;
    valasztottPalya = valasztott || null;
    localStorage.setItem('palya', valasztottPalya);
    bezarBeallitasok();
}

// -------------------------------------------------------------------

function karakterek() {
    const ablak = document.createElement('div');
    ablak.classList.add('beallitaskepernyo');
    ablak.innerHTML = `
        <h2>Karakterválasztás</h2>
        <h3>Játékos 1</h3>
        ${karakterHTML('karakter1', karakter1)}
        <h3>Játékos 2</h3>
        ${karakterHTML('karakter2', karakter2)}
        <button onclick="karakterKivalasztas()">Alkalmaz</button>
        <button onclick="bezarBeallitasok()">Mégse</button>
    `;
    document.body.appendChild(ablak);
}

function karakterHTML(name, selected) {
    return `
        <label><input type="radio" name="${name}" value="0" ${selected === '0' ? 'checked' : ''}>
            Express</label><br>
        <label><input type="radio" name="${name}" value="1" ${selected === '1' ? 'checked' : ''}>
            Szakértő</label><br>
        <label><input type="radio" name="${name}" value="2" ${selected === '2' ? 'checked' : ''}>
            Törött</label><br>
        <label><input type="radio" name="${name}" value="3" ${selected === '3' ? 'checked' : ''}>
            Köret</label><br>
    `;
}

function karaktervalasztas(karakter) {
    switch (karakter2) {
        case '0':
            jatekos2.sebesseg = 400;
            jatekos2.alapsebesseg = 400;
            jatekos2.bombaido = 3000;
            break;
        case '1':
            jatekos2.elet = 2;
            jatekos2.bombaido = 0;
            break;
        case '2':
            jatekos2.elet = 1;
            jatekos2.nagyrobbanas = true;
            jatekos2.sebesseg = 125;
            jatekos2.powerupInditas = true;
            break;
        case '3':
            jatekos2.specialisRobbanas = true;
            jatekos2.sebesseg = 140;
            break;
        default:
            break;
    }
}

function karakterKivalasztas() {
    karakter1 = document.querySelector('input[name="karakter1"]:checked').value;
    karakter2 = document.querySelector('input[name="karakter2"]:checked').value;
    localStorage.setItem('karakter1', karakter1);
    localStorage.setItem('karakter2', karakter2);
    bezarBeallitasok();
}

window.addEventListener('load', () => {
    const gyik = document.getElementById('gyik-doboz');
    if (gyik) gyik.style.display = 'block';
  });