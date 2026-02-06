export const Erositesek = {
    nagyrobbanas(jatekos) {
        jatekos.nagyrobbanas = true;
        return "Nagyrobbanás";
    },

    extraElet(jatekos) {
        jatekos.elet++;
        return "Extra élet";
    },

    gyorsitas(jatekos) {
        jatekos.gyorsitas();
        return "Gyorsítás";
    },

    random(jatekos) {
        const lista = [
            this.nagyrobbanas,
            this.extraElet,
            this.gyorsitas
        ];
        const valasztott = lista[Math.floor(Math.random() * lista.length)];
        return valasztott.call(this, jatekos);
    }
};
