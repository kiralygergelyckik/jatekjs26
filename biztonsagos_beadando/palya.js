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
        const meret = this.sorok <= 8 ? 78 : this.sorok >= 24 ? 30 : 48;
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

    idovegeEffekt() {
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

        if (jatekos.kekElet > 0) {
            jatekos.sebezodik(this.main);
            return;
        }

        jatekos.pirosElet = 0;
        jatekos.jatekosHal(this.main);
    }

    render() {
        if (!this.ctx || !this.canvas) return;
        const ctx = this.ctx;
        const t = Date.now() / 1000;
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const cellW = cw / this.oszlopok;
        const cellH = ch / this.sorok;

        ctx.fillStyle = '#f6f6f6';
        ctx.fillRect(0, 0, cw, ch);

        for (let i = 0; i < this.sorok; i++) {
            for (let j = 0; j < this.oszlopok; j++) {
                const x = j * cellW;
                const y = i * cellH;
                const cella = this.tabla[i][j];
                this.drawSketchCell(ctx, x, y, cellW, cellH, i, j, t);

                if (cella.classList.contains('doboz')) this.drawDoboz(ctx, x, y, cellW, cellH, t);
                if (cella.classList.contains('powerup')) this.drawPowerup(ctx, x, y, cellW, cellH, t);
                if (cella.classList.contains('bomba')) this.drawBomba(ctx, x, y, cellW, cellH, t);
                if (cella.classList.contains('perzseles')) this.drawPerzseles(ctx, x, y, cellW, cellH, t);
                if (cella.classList.contains('veszelyzona')) this.drawVeszely(ctx, x, y, cellW, cellH, t);
            }
        }

        const szinek = ['#b8382f', '#2a5caa', '#ad8a1f', '#2e7d4d'];
        this.main.osszesJatekos().forEach((jatekos, idx) => {
            this.drawPlayer(ctx, jatekos, szinek[idx % szinek.length], cellW, cellH, t + idx * 0.6);
        });
    }

    drawSketchCell(ctx, x, y, w, h, i, j, t) {
        const jitter = Math.sin(t * 2 + i * 0.4 + j * 0.3) * 1.8;
        ctx.strokeStyle = '#0f0f0f';
        ctx.lineWidth = 1 + Math.abs(Math.sin(t + i + j)) * 1.4;
        ctx.beginPath();
        ctx.moveTo(x + 2 + jitter, y + 2);
        ctx.lineTo(x + w - 3, y + 2 - jitter * 0.3);
        ctx.lineTo(x + w - 2 - jitter, y + h - 2);
        ctx.lineTo(x + 2, y + h - 2 + jitter * 0.2);
        ctx.closePath();
        ctx.stroke();

        const hatch = 2 + Math.sin(t * 3 + i + j) * 1.5;
        ctx.strokeStyle = 'rgba(20,20,20,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 4, y + h / 2 + hatch);
        ctx.lineTo(x + w - 4, y + h / 2 - hatch);
        ctx.stroke();
    }

    drawDoboz(ctx, x, y, w, h, t) {
        const wobble = Math.sin(t * 4 + x * 0.02 + y * 0.03) * 1.2;
        ctx.fillStyle = '#e6e6e6';
        ctx.fillRect(x + 6 + wobble, y + 6, w - 12, h - 12);
        ctx.strokeStyle = '#0f0f0f';
        ctx.lineWidth = 2.4;
        ctx.strokeRect(x + 6 + wobble, y + 6, w - 12, h - 12);
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

    drawPerzseles(ctx, x, y, w, h, t) {
        ctx.strokeStyle = `rgba(40,40,40,${0.4 + Math.sin(t * 5) * 0.2})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + h - 8);
        ctx.lineTo(x + w - 8, y + 8);
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
            const textY = y + cellH * 0.14;
            const fontSize = Math.max(12, Math.floor(cellW * 0.24));
            ctx.save();
            ctx.globalAlpha = jatekos.powerupOpacity;
            ctx.font = `bold ${fontSize}px Georgia, serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const metrics = ctx.measureText(jatekos.powerupPopup);
            const padX = 8;
            const boxW = metrics.width + padX * 2;
            const boxH = fontSize + 8;

            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(cx - boxW / 2, textY - boxH / 2, boxW, boxH);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#000';
            ctx.fillText(jatekos.powerupPopup, cx, textY + 1);
            ctx.restore();
        }
    }
}