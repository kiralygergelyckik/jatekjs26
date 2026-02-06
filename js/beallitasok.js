export const Beallitasok = {
    nehezseg: 'alap',
    bombaSebesseg: 1000,
    powerupEsely: 1,
    idokorlat: 0,

    alkalmaz() {
        switch (this.nehezseg) {
            case 'konnyu':
                this.bombaSebesseg = 1500;
                this.powerupEsely = 1.5;
                break;
            case 'nehez':
                this.bombaSebesseg = 500;
                this.powerupEsely = 0.5;
                break;
            default:
                this.bombaSebesseg = 1000;
                this.powerupEsely = 1;
        }
    },

    ment() {
        localStorage.setItem('beallitasok', JSON.stringify(this));
    },

    betolt() {
        const adat = localStorage.getItem('beallitasok');
        if (adat) Object.assign(this, JSON.parse(adat));
    }
};
