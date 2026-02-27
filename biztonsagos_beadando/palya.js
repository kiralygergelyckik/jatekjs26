class FakeClassList {
    constructor(initial = []) {
        this._set = new Set(initial);
    }

    add(...classes) {
        classes.forEach((c) => this._set.add(c));
    }

    remove(...classes) {
        classes.forEach((c) => this._set.delete(c));
    }

    contains(cls) {
        return this._set.has(cls);
    }

    toArray() {
        return [...this._set];
    }

    replaceAll(next = []) {
        this._set = new Set(next);
    }
}

class CellaModel {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.classList = new FakeClassList(['cella']);
    }
}

export class Palya {
    constructor(main, sorok, oszlopok) {
        this.main = main;
        this.sorok = sorok;
        this.oszlopok = oszlopok;
        this.tabla = [];
        this.veszelySzint = 0;
        this.veszelyInterval = null;
        this.jatekos1 = null;
        this.jatekos2 = null;
        this.canvas = null;
        this.ctx = null;
    }

    beallitJatekosok(jatekosok) {
        this.jatekos1 = jatekosok[0] || null;
        this.jatekos2 = jatekosok[1] || null;
    }

    tablaLetrehoz() {
        const tablaElem = document.getElementById('jatekter');
        tablaElem.innerHTML = '';

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'jatek-canvas';
        tablaElem.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.tabla = Array.from({ length: this.sorok }, (_, i) =>
            Array.from({ length: this.oszlopok }, (_, j) => new CellaModel(i, j))
        );
        this.resizeCanvas();
        this.render();
    }

    resizeCanvas() {
        if (!this.canvas) return;
        const meret = this.sorok <= 15 ? 46 : this.sorok >= 30 ? 24 : 30;
        const width = this.oszlopok * meret;
        const height = this.sorok * meret;
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
    }

    cella(x, y) {
        if (x < 0 || y < 0 || x >= this.sorok || y >= this.oszlopok) return null;
        if (!this.tabla || !this.tabla[x] || !this.tabla[x][y]) return null;
        return this.tabla[x][y];
    }

    biztonsagosMezok() {
        return [
            { r: 0, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 1 },
            { r: this.sorok - 1, c: this.oszlopok - 1 },
            { r: this.sorok - 2, c: this.oszlopok - 1 }, { r: this.sorok - 1, c: this.oszlopok - 2 },
            { r: this.sorok - 1, c: 0 }, { r: this.sorok - 2, c: 0 }, { r: this.sorok - 1, c: 1 },
            { r: 0, c: this.oszlopok - 1 }, { r: 0, c: this.oszlopok - 2 }, { r: 1, c: this.oszlopok - 1 }
        ];
    }

    egyediPoziciok(db, kizart = []) {
        const max = this.sorok * this.oszlopok - kizart.length;
        const celDb = Math.max(0, Math.min(db, max));
        const poziciok = [];

        while (poziciok.length < celDb) {
            const r = Math.floor(Math.random() * this.sorok);
            const c = Math.floor(Math.random() * this.oszlopok);
            const marLetezik = poziciok.some((p) => p.r === r && p.c === c);
            const tiltott = kizart.some((p) => p.r === r && p.c === c);
            if (!marLetezik && !tiltott) poziciok.push({ r, c });
        }
        return poziciok;
    }

    objektumokatHozzaad(poziciok, osztaly) {
        poziciok.forEach(({ r, c }) => this.tabla[r][c].classList.add(osztaly));
    }

    ervenyesLepes(x, y, jatekos = null) {
        if (x < 0 || x >= this.sorok || y < 0 || y >= this.oszlopok) return false;
        if (this.tabla[x][y].classList.contains('bomba')) return false;
        if (this.tabla[x][y].classList.contains('doboz') && !(jatekos && jatekos.arnyekAktiv())) return false;
        if (this.tabla[x][y].classList.contains('viz') && !(jatekos && jatekos.uszasAktiv())) return false;
        return true;
    }

    jatekosRajzol() {}
    jatekosTorol() {}

    kozelbenUresPozicio(halalX, halalY, tav = 3) {
        const lehetseges = [];
        for (let dx = -tav; dx <= tav; dx++) {
            for (let dy = -tav; dy <= tav; dy++) {
                const x = halalX + dx;
                const y = halalY + dy;
                const occupied = this.main.osszesJatekos().some((jatekos) => jatekos.x === x && jatekos.y === y);
                if (
                    x >= 0 && x < this.sorok
                    && y >= 0 && y < this.oszlopok
                    && this.ervenyesLepes(x, y)
                    && !occupied
                    && !this.tabla[x][y].classList.contains('veszelyzona')
                ) {
                    lehetseges.push({ x, y });
                }
            }
        }
        return lehetseges.length > 0 ? lehetseges[Math.floor(Math.random() * lehetseges.length)] : null;
    }

    alkalmazVeszelyZona(szint) {
        for (let i = 0; i < this.sorok; i++) {
            for (let j = 0; j < this.oszlopok; j++) {
                if (i < szint || i >= this.sorok - szint || j < szint || j >= this.oszlopok - szint) {
                    this.tabla[i][j].classList.add('veszelyzona');
                    this.tabla[i][j].classList.remove('powerup');
                }
            }
        }
    }

    resetVeszelyZona() {
        this.veszelySzint = 0;
        if (this.veszelyInterval) {
            clearInterval(this.veszelyInterval);
            this.veszelyInterval = null;
        }
    }

    idovegeEffekt() {
        if (this.veszelyInterval) return;
        const kijelzo = document.getElementById('timeDisplay');
        if (kijelzo) {
            kijelzo.innerText = '⏱ Lejárt az idő! A pálya szűkül...';
            setTimeout(() => { kijelzo.style.display = 'none'; }, 5000);
        }
        document.body.style.background = '#080808';

        this.veszelyInterval = setInterval(() => {
            this.veszelySzint += 1;
            if (this.sorok - this.veszelySzint * 2 < 3) {
                clearInterval(this.veszelyInterval);
                this.veszelyInterval = null;
                return;
            }
            this.alkalmazVeszelyZona(this.veszelySzint);
        }, 5000);
    }

    ellenorizVeszelyHalal(jatekos) {
        if (!this.tabla[jatekos.x][jatekos.y].classList.contains('veszelyzona')) return;
        jatekos.jatekosHal(this.main);
    }

    frissitVeszelySebzes(jatekos, delta) {
        const aktualisCella = this.cella(jatekos.x, jatekos.y);
        if (!aktualisCella) {
            jatekos.veszelybenToltottIdo = 0;
            return;
        }

        if (!aktualisCella.classList.contains('veszelyzona')) {
            jatekos.veszelybenToltottIdo = 0;
            return;
        }

        jatekos.veszelybenToltottIdo += delta;
        if (jatekos.veszelybenToltottIdo < 3000) return;

        jatekos.veszelybenToltottIdo = 0;

        jatekos.sebezodik(this.main);
    }

    render() {
        if (!this.ctx || !this.canvas) return;
        const ctx = this.ctx;
        const t = Date.now() / 1000;
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const latoKozep = this.main.getLathatoKozep();
        const latoszogAktiv = !!latoKozep;
        const view = latoszogAktiv ? (this.main.getLatoszogMeret() || 6) : this.sorok;
        const startX = latoszogAktiv ? Math.max(0, Math.min(this.sorok - view, latoKozep.x - 2)) : 0;
        const startY = latoszogAktiv ? Math.max(0, Math.min(this.oszlopok - view, latoKozep.y - 2)) : 0;
        const endX = latoszogAktiv ? Math.min(this.sorok - 1, startX + view - 1) : this.sorok - 1;
        const endY = latoszogAktiv ? Math.min(this.oszlopok - 1, startY + view - 1) : this.oszlopok - 1;
        const visibleRows = endX - startX + 1;
        const visibleCols = endY - startY + 1;
        const cellW = cw / visibleCols;
        const cellH = ch / visibleRows;

        ctx.fillStyle = '#101010';
        ctx.fillRect(0, 0, cw, ch);

        for (let i = startX; i <= endX; i++) {
            for (let j = startY; j <= endY; j++) {
                const x = (j - startY) * cellW;
                const y = (i - startX) * cellH;
                const cella = this.tabla[i][j];
                this.drawSketchCell(ctx, x, y, cellW, cellH);

                if (cella.classList.contains('doboz')) this.drawDoboz(ctx, x, y, cellW, cellH);
                if (cella.classList.contains('viz')) this.drawViz(ctx, x, y, cellW, cellH, t);
                if (cella.classList.contains('powerup')) this.drawPowerup(ctx, x, y, cellW, cellH, t);
                if (cella.classList.contains('bomba')) this.drawBomba(ctx, x, y, cellW, cellH, t);
                if (cella.classList.contains('perzseles')) this.drawPerzseles(ctx, x, y, cellW, cellH);
                if (cella.classList.contains('veszelyzona')) this.drawVeszely(ctx, x, y, cellW, cellH, t);
            }
        }

        const szinek = ['#b8382f', '#2a5caa', '#ad8a1f', '#2e7d4d'];
        this.main.osszesJatekos().forEach((jatekos, idx) => {
            const lathato = !latoszogAktiv || (jatekos.x >= startX && jatekos.x <= endX && jatekos.y >= startY && jatekos.y <= endY);
            if (!lathato) return;
            const rajzJatekos = {
                ...jatekos,
                x: jatekos.x - startX,
                y: jatekos.y - startY
            };
            this.drawPlayer(ctx, rajzJatekos, szinek[idx % szinek.length], cellW, cellH, t + idx * 0.6);
        });
    }

    drawSketchCell(ctx, x, y, w, h) {
        ctx.fillStyle = '#3b7d2d';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = 'rgba(16,40,12,0.45)';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    }

    drawDoboz(ctx, x, y, w, h) {
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
        ctx.strokeStyle = '#5c3a1a';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    }

    drawViz(ctx, x, y, w, h, t) {
        ctx.fillStyle = `rgba(40,110,190,${0.7 + Math.sin(t * 2) * 0.1})`;
        ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
        ctx.strokeStyle = 'rgba(170,210,255,0.7)';
        ctx.beginPath();
        ctx.moveTo(x + 3, y + h * 0.4);
        ctx.lineTo(x + w - 3, y + h * 0.5);
        ctx.stroke();
    }

    drawPowerup(ctx, x, y, w, h, t) {
        const pulse = 6 + Math.sin(t * 6 + x * 0.1) * 2;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + w / 2 - pulse, y + h / 2);
        ctx.lineTo(x + w / 2 + pulse, y + h / 2);
        ctx.moveTo(x + w / 2, y + h / 2 - pulse);
        ctx.lineTo(x + w / 2, y + h / 2 + pulse);
        ctx.stroke();
    }

    drawBomba(ctx, x, y, w, h, t) {
        const r = Math.min(w, h) * 0.25 + Math.sin(t * 8) * 1.5;
        ctx.fillStyle = '#1b1b1b';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + h / 2 - r);
        ctx.lineTo(x + w / 2 + r * 0.7, y + h / 2 - r * 1.3);
        ctx.stroke();
    }

    drawPerzseles(ctx, x, y, w, h) {
        ctx.strokeStyle = '#9e9e9e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 4, y + h - 4);
        ctx.lineTo(x + w - 4, y + 4);
        ctx.stroke();
    }

    drawVeszely(ctx, x, y, w, h, t) {
        ctx.fillStyle = `rgba(210,25,25,${0.2 + Math.abs(Math.sin(t * 3)) * 0.35})`;
        ctx.fillRect(x, y, w, h);
    }

    drawPlayer(ctx, jatekos, color, cellW, cellH, t) {
        const x = jatekos.y * cellW;
        const y = jatekos.x * cellH;
        const bob = Math.sin(t * 6) * 2;
        const cx = x + cellW / 2;
        const cy = y + cellH / 2 + bob;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2.6;

        ctx.beginPath();
        ctx.arc(cx, cy - cellH * 0.18, Math.min(cellW, cellH) * 0.12, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx, cy - cellH * 0.05);
        ctx.lineTo(cx, cy + cellH * 0.2);
        ctx.moveTo(cx, cy + cellH * 0.2);
        ctx.lineTo(cx - cellW * 0.12, cy + cellH * 0.35);
        ctx.moveTo(cx, cy + cellH * 0.2);
        ctx.lineTo(cx + cellW * 0.12, cy + cellH * 0.35);
        ctx.moveTo(cx - cellW * 0.14, cy + cellH * 0.02);
        ctx.lineTo(cx + cellW * 0.14, cy + cellH * 0.08);
        ctx.stroke();


        if (jatekos.powerupPopup && jatekos.powerupOpacity > 0) {
            const txtY = y + cellH * 0.12;
            const txt = jatekos.powerupPopup.toUpperCase();
            ctx.save();
            ctx.globalAlpha = Math.max(0.2, jatekos.powerupOpacity);
            ctx.font = `bold ${Math.max(12, Math.floor(cellW * 0.24))}px Georgia, serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const m = ctx.measureText(txt);
            const pad = 6;
            const bw = m.width + pad * 2;
            const bh = Math.max(16, Math.floor(cellH * 0.24));

            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.rect(cx - bw / 2, txtY - bh / 2, bw, bh);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#000';
            ctx.fillText(txt, cx, txtY + 1);
            ctx.restore();
        }
    }
}