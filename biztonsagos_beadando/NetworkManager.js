export class NetworkManager {
    constructor(main) {
        this.main = main;
        this.ws = null;
        this.role = 'offline';
        this.room = null;
        this.connected = false;
        this.remoteConnected = false;
        this.remoteKeysByPlayer = { 2: {}, 3: {}, 4: {} };
        this.snapshotInterval = null;
        this.lastStateSig = '';
        this.selfId = null;
        this.selfSlot = 1;
        this.clientSlotById = {};
        this.connectedPeers = 0;
    }

    connect(role, room) {
        const proto = location.protocol === 'https:' ? 'wss' : 'ws';
        this.ws = new WebSocket(`${proto}://${location.host}`);

        this.ws.addEventListener('open', () => {
            this.ws.send(JSON.stringify({ type: role, room }));
        });

        this.ws.addEventListener('message', (event) => this.onMessage(event.data));
        this.ws.addEventListener('close', () => {
            this.connected = false;
            this.remoteConnected = false;
            if (this.snapshotInterval) clearInterval(this.snapshotInterval);
            this.main.mutatHalozatUzenet('Kapcsolat bontva.');
        });
    }

    onMessage(raw) {
        let msg;
        try { msg = JSON.parse(raw); } catch { return; }

        if (msg.type === 'joined') {
            this.connected = true;
            this.role = msg.role;
            this.room = msg.room;
            this.selfId = msg.id || null;
            this.selfSlot = Math.max(1, Math.min(4, Number(msg.slot) || 1));
            this.main.mutatHalozatUzenet(`Csatlakozva: ${msg.room} (${msg.role})`);

            if (this.role === 'host') {
                this.connectedPeers = 0;
                this.main.setActivePlayers(2);
                this.snapshotInterval = setInterval(() => this.sendState(), 50);
            }
            return;
        }

        if (msg.type === 'peer-joined') {
            this.remoteConnected = true;
            this.main.mutatHalozatUzenet('Ellenfél csatlakozott.');
            if (this.role === 'host') {
                const slot = Math.max(2, Math.min(4, Number(msg.slot) || 2));
                if (msg.peerId) this.clientSlotById[msg.peerId] = slot;
                this.connectedPeers = Math.min(3, this.connectedPeers + 1);
                this.remoteConnected = this.connectedPeers > 0;
                this.main.setActivePlayers(Math.min(4, 1 + this.connectedPeers));
            }
            return;
        }

        if (msg.type === 'peer-left') {
            if (this.role === 'host') {
                const slot = msg.peerId ? this.clientSlotById[msg.peerId] : null;
                if (msg.peerId) delete this.clientSlotById[msg.peerId];
                if (slot && this.remoteKeysByPlayer[slot]) this.remoteKeysByPlayer[slot] = {};
                this.connectedPeers = Math.max(0, this.connectedPeers - 1);
                this.remoteConnected = this.connectedPeers > 0;
                this.main.setActivePlayers(Math.max(2, 1 + this.connectedPeers));
            }
            return;
        }

        if (msg.type !== 'relay' || !msg.payload) return;

        const payload = msg.payload;
        if (payload.kind === 'input' && this.role === 'host') {
            const slot = this.clientSlotById[msg.from] || 2;
            if (!this.remoteKeysByPlayer[slot]) this.remoteKeysByPlayer[slot] = {};
            this.remoteKeysByPlayer[slot][payload.key] = payload.down;
            return;
        }

        if (payload.kind === 'bomb' && this.role === 'host') {
            const slot = this.clientSlotById[msg.from] || 2;
            const jatekos = this.main.players[slot - 1];
            if (jatekos) jatekos.bombaLetesz(this.main);
            return;
        }

        if (payload.kind === 'state' && this.role === 'client') {
            this.main.applyRemoteState(payload.state);
        }
    }

    getRemoteKey(playerIndex, key) {
        return !!this.remoteKeysByPlayer[playerIndex]?.[key];
    }

    sendRelay(payload) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        this.ws.send(JSON.stringify({ type: 'relay', payload }));
    }

    sendInput(key, down) {
        if (this.role !== 'client') return;
        this.sendRelay({ kind: 'input', key, down });
    }

    sendBomb() {
        if (this.role !== 'client') return;
        this.sendRelay({ kind: 'bomb' });
    }

    cellChecksum(cells = []) {
        let sum = 0;
        for (let i = 0; i < cells.length; i++) {
            const row = cells[i] || [];
            for (let j = 0; j < row.length; j++) {
                sum = (sum + ((Number(row[j]) || 0) * (i + 1) * (j + 1))) % 1000000007;
            }
        }
        return sum;
    }

    sendState() {
        if (this.role !== 'host' || !this.remoteConnected) return;
        if (!this.main.palya?.tabla?.length) return;
        const state = this.main.captureState();
        const sig = `${state.jatekAktiv ? 1 : 0}|${state.gameOverText || ''}|${state.dangerLevel || 0}|${state.dangerActive ? 1 : 0}|${state.activePlayers}|${state.j1.x},${state.j1.y},${state.j1.pont},${state.j1.karakterKod || '0'}|${state.j2.x},${state.j2.y},${state.j2.pont},${state.j2.karakterKod || '0'}|${state.j3.x},${state.j3.y},${state.j3.pont},${state.j3.karakterKod || '0'}|${state.j4.x},${state.j4.y},${state.j4.pont},${state.j4.karakterKod || '0'}|${this.cellChecksum(state.cells)}`;
        if (sig === this.lastStateSig) return;
        this.lastStateSig = sig;
        this.sendRelay({ kind: 'state', state });
    }

    isHost() {
        return this.role === 'host';
    }

    isClient() {
        return this.role === 'client';
    }
}