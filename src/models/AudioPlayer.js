class AudioPlayer {

    constructor(params) {

        this.songs = []; //[{name:"Adele - Someone Like You.mp3", artist:"Adele", cover:"", file:"songs/Adele - Someone Like You.mp3"},{name:"Adele.mp3", artist:"Adele", cover:"", file:"songs/Adele.mp3"}];
        this.queue = [];
        this.player = new Audio();
        let src = "songs/David Guetta - Titanium ft. Sia.mp3";

        this._gui = {
            progressBar: { value: null, DOMElement: null },
            artistName: { value: null, DOMElement: null },
            songName: { value: null, DOMElement: null },
            currentTime: { value: null, DOMElement: null },
            totalTime: { value: null, DOMElement: null },
            albumCover: { value: null, DOMElement: null }
        };

        if (params.hasOwnProperty("gui")) {
            var { progressBar, artistName, songName, currentTime, totalTime, albumCover } = params.gui;
            this._initGUI(progressBar, artistName, songName, currentTime, totalTime, albumCover);
        }

        this._buttons = {
            queue: null,
            volume: null,
            back: null,
            playPause: null,
            next: null,
            add: null
        }

        this.addSong();
        this._loadSong(this.songs[0].file);
        
        if (params.hasOwnProperty("buttons")) {
            var { queue, volume, back, playPause, next, add } = params.buttons;
            this._initButtons(queue, volume, back, playPause, next, add);
        }
    }

    _loadSong(src) {
        this.player.src = src;
        this.player.onloadedmetadata = () => {
            this.gui = {
                totalTime: { value: this.getValueReloj(this.player.duration), DOMElement: this.gui.totalTime.DOMElement },
                currentTime: { value: this.getValueReloj(0), DOMElement: this.gui.currentTime.DOMElement }
            }
        }
        this.player.ontimeupdate = () => {
            this.gui = {
                currentTime: { value: this.getValueReloj(this.player.currentTime), DOMElement: this.gui.currentTime.DOMElement },
                totalTime :{value: this.getValueReloj(this.player.duration),DOMElement: this.gui.totalTime.DOMElement }
            }
            //Uso de variable auxiliar para separar el valor real.
            var currentAux={ value: this.player.currentTime, DOMElement: this.gui.currentTime.DOMElement };
            // cambio de valor this.gui.currentTime.value x this.player.duration, para recuperar valor inicial.
            var [totalTime, currentAux] = [this.player.duration, currentAux.value]; // Antes -> this.gui.currentTime.value
            var progress = (currentAux / totalTime) * 100;
            let pBar = this.gui.progressBar.DOMElement.querySelector("div");
            pBar.style.width = `${progress}%`;

             //Evalua si termina la cancion para colocar volver a icon Play, event Paused
             if(this.player.ended){
                this.player.pause();
                this._toggleIcon(this.buttons.playPause, "fa-play", "fa-pause");

                var nextSong = this.selectSong(1);
                this.player.src = nextSong;
                this.player.onloadedmetadata = () => {
                    this.gui = {
                        totalTime: { value: this.getValueReloj(this.player.duration), DOMElement: this.gui.totalTime.DOMElement },
                        currentTime: { value: this.getValueReloj(0), DOMElement: this.gui.currentTime.DOMElement }
                    }
                }
                console.log(this.player);
             }
        }

        //Prueba
        console.log(this.songs);
    }
    //Seleccionar cancion por index
    selectSong(numSong){
        return this.songs[numSong].file;
    }
    // Cargar lista canciones
    addSong(){
        this.songs = [
            {name:"Someone Like You", artist:"Adele", cover:"", file:"songs/Adele - Someone Like You.mp3"},
            {name:"Titanium ft. Sia", artist:"David Guetta", cover:"", file:"songs/David Guetta - Titanium ft. Sia.mp3"}
        ];
    }

    _initGUI(...params) {
        this.gui = {
            progressBar: params[0] || { value: null, DOMElement: null },
            artistName: params[1] || { value: null, DOMElement: null },
            songName: params[2] || { value: null, DOMElement: null },
            currentTime: params[3] || { value: null, DOMElement: null },
            totalTime: params[4] || { value: null, DOMElement: null },
            albumCover: params[5] || { value: null, DOMElement: null }
        };
    }

    _initButtons(...params) {
        this.buttons = {
            queue: params[0] || null,
            volume: params[1] || null,
            back: params[2] || null,
            playPause: params[3] || null,
            next: params[4] || null,
            add: params[5] || null
        };
    }

    _addClickEvent(element, callback) {
        //console.log(element);
        if (element instanceof HTMLElement) {
            element.onclick = callback;
        } else {
            if (element.hasOwnProperty("DOMElement")) {
                element = element.DOMElement;
                if (element instanceof HTMLElement) {
                    element.onclick = callback;
                }
            }
        }
    }

    _toggleIcon(el, aClass, bClass) {
        let i = el.querySelector("i");
        if (i.classList.contains(aClass)) {
            var [a, b] = [aClass, bClass];
        } else {
            var [b, a] = [aClass, bClass];
        }
        i.classList.remove(a);
        i.classList.add(b);
    }

    _assignValues(toAssign, elements, actions = []) {
        const keys = Object.keys(elements);

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (elements[key] != null) {
                toAssign[key] = elements[key];
                if (Object.keys(actions).length > 0) {
                    if (actions.hasOwnProperty(key)) {
                        //console.log(key);
                        this._addClickEvent(toAssign[key], actions[key]);
                    }
                }
            }
        }
    }

    set buttons(btns) {
        let actions = {
            playPause: () => {
                if (this.player.paused) {
                    this.player.play();
                } else {
                    this.player.pause();
                }
                this._toggleIcon(this.buttons.playPause, "fa-play", "fa-pause");
            },
            queue: () => false,
            volume: () => {
                this.player.volume = (this.player.volume != 0) ? 0 : 1
                this._toggleIcon(this.buttons.volume, "fa-volume-up", "fa-volume-mute");

            },
            back: () => false,
            next: () => false,
            add: () => false,

        }
        this._assignValues(this._buttons, btns, actions);
    }

    get buttons() {
        return this._buttons;
    }

    set gui(elments) {
        let actions = {
            progressBar: (e) => {
                let x = e.offsetX;
                let w = this.gui.progressBar.DOMElement.offsetWidth;
                // cambio de variable this.gui.totalTime x this.player.duration
                let newCurrentTime = this.player.duration * (x/w); 
                this.player.currentTime = newCurrentTime;
                
                this.gui = {
                    currentTime: {value: this.getValueReloj(newCurrentTime), DOMElement: this.gui.currentTime.DOMElement},
                    totalTime: {value: this.getValueReloj(this.player.duration), DOMElement: this.gui.totalTime.DOMElement}
                }
            }
        }
    
        this._assignValues(this._gui, elments, actions);
        this._updateBasigGUIElement(this.gui.totalTime);
        this._updateBasigGUIElement(this.gui.currentTime);
    }

    _updateBasigGUIElement(el) {
        //console.log(el);
        if (el.DOMElement instanceof HTMLElement) {
            el.DOMElement.innerHTML = el.value;
        }
    }

    get gui() {
        return this._gui;
    }

    getValueReloj(val){        
        let minute= val>60 ? Math.floor(val / 60) : 0;
        let second= Math.floor(val%60);  
        var result= (minute<10 ? '0'+ minute: minute) + ':' + (second<10 ? '0'+second: second);
        return result;
    }
}