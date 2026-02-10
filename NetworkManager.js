export class NetworkManager {
    constructor(main) {
        this.main = main;
        this.ws = null;
        this.role = 'offline';
        this.room = null;
        this.connected = false;
        this.remoteConnected = false;
        this.remoteKeys = {};
        this.snapshotInterval = null;
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
            this.main.mutatHalozatUzenet(`Csatlakozva: ${msg.room} (${msg.role})`);

            if (this.role === 'host') {
                this.snapshotInterval = setInterval(() => this.sendState(), 90);
            }
            return;
        }

        if (msg.type === 'peer-joined') {
            this.remoteConnected = true;
            this.main.mutatHalozatUzenet('Ellenfél csatlakozott.');
            return;
        }

        if (msg.type !== 'relay' || !msg.payload) return;

        const payload = msg.payload;
        if (payload.kind === 'input' && this.role === 'host') {
            this.remoteKeys[payload.key] = payload.down;
            return;
        }

        if (payload.kind === 'bomb' && this.role === 'host') {
            this.main.jatekos2.bombaLetesz(this.main);
            return;
        }

        if (payload.kind === 'state' && this.role === 'client') {
            this.main.applyRemoteState(payload.state);
        }
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

    sendState() {
        if (this.role !== 'host') return;
        const state = this.main.captureState();
        this.sendRelay({ kind: 'state', state });
    }

    isHost() {
        return this.role === 'host';
    }

    isClient() {
        return this.role === 'client';
    }
}
