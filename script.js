/* Inicializační funkce, přidělí hlavním ovládacím tlačítkům listenery */
(function init(){
    document.querySelector("#new-game").addEventListener("click", evt => {
        newGame();
    });
    document.querySelector("#help").addEventListener("click", evt => {
        showHelp();
    });
})();

/* na začátku není otočené žádné políčko */
let pocetOtocenych = 0;
/* úvodní hodnoty, nemají hlubší význam */
let otocene = {first: -1, second: -1};
/* hráč má na začátku 0 bodů */
let skore = 0;
/* nejvyšší možný počet bodů */
let max = 80;

/* seznam url adres obrázků */
let obrazek = new Array("https://upload.wikimedia.org/wikipedia/commons/2/2f/Giraffe_Walking_Square%2C_flip.jpg",
                        "https://upload.wikimedia.org/wikipedia/commons/4/44/Jelly_cc11.jpg",
                        "https://theearthorganization.org/wp-content/uploads/2016/04/zebra.jpg",
                        "https://upload.wikimedia.org/wikipedia/commons/d/d6/Bald_Eagle_Head_2_%286021915997%29.jpg",
                        "https://i2-prod.mirror.co.uk/incoming/article11682518.ece/ALTERNATES/s615/Emperor-penguins-on-ice.jpg",
                        "https://live.staticflickr.com/8764/17107896065_aa1f292a88_b.jpg",
                        "https://upload.wikimedia.org/wikipedia/commons/4/41/Siberischer_tiger_de_edit02.jpg",
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Eastern_Bluebird-27527-2.jpg/768px-Eastern_Bluebird-27527-2.jpg");

let hraciplocha = new Array();

/* Vynuluje ukazatel počtu bodů a zakryje všechna políčka */
function newGame() {
    skore = 0;
    aktualizujStav(0);
    document.getElementById("show").innerHTML="Body: " + skore;
    /* naplnění pole hrací plochy, logická hodnota otočení políčka a url obrázku */
    hraciplocha = [[false, obrazek[0]],
                    [false, obrazek[1]],
                    [false, obrazek[2]],
                    [false, obrazek[3]],
                    [false, obrazek[4]],
                    [false, obrazek[5]],
                    [false, obrazek[6]],
                    [false, obrazek[7]],
                    [false, obrazek[0]],
                    [false, obrazek[1]],
                    [false, obrazek[2]],
                    [false, obrazek[3]],
                    [false, obrazek[4]],
                    [false, obrazek[5]],
                    [false, obrazek[6]],
                    [false, obrazek[7]]];

    /* Zamíchá obrázky */
    shuffle(hraciplocha);

    /* Zakryje všechna otevřená políčka */
    for (i=1; i<=16; i++) {
        ukazNeboSchovObrazek(i);
    }
    
    /* Aktivuje možnost klikat na políčka */
    for (i=1; i<=16; i++) {
        document.getElementById(i).setAttribute("onClick", "otoc(" + i + ")")
    }
}

/* Přičte k dosavadnímu počtu bodů nové body a zobrazí výsledek výpočtu */
function aktualizujStav(novebody) {
    skore = skore + novebody;
    document.getElementById("show").innerHTML="Body: " + skore;
    /* když hráč dosáhne maximálního skóre (otočí všechny obrázky) vypíše se hláška o ukončení hry */
    if (skore == max) {
        document.getElementById("show").innerHTML="Body: " + skore + " Vyhráli jste! Gratulujeme!!!";
    }
}

/* Zobrazí nebo schová obrázek v závislosi na logické hodnotě, zda je políčko odkryté */
async function ukazNeboSchovObrazek(id) {
    let index = id - 1;
    if (hraciplocha[index][0] == true) {
        let url = hraciplocha[index][1];
        /* vyšle požadavek na získání obrázku */
        let response = await fetch(url);
        /* chytá odpověď jako objekt blob, něco jako soubor */
        let blob = await response.blob();
        /* vytvoří element obrázku */
        let img = document.createElement("img");
        /* nastaví styl obrázku */
        img.setAttribute("class", "obsah")
        img.style = "height: 142px; width: 142px";
        /* do elementu políčka vloží obrázek */
        document.getElementById(id).append(img);
        /* přidělí elementu obrázku získaný zdroj */
        img.src = URL.createObjectURL(blob);
    }
    else {
        /* udělá element prázdným */
        document.getElementById(id).innerHTML="";
    }
}

/* Program chvíli nebude dělat nic */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* Zabrání použití funkce. Tady je to použito tak, aby se nedalo klikat */
avoidClicking = function(e) {
    e.stopPropagation();
};

/* Zavolá se kliknutím na políčko.  */
async function otoc(id) {
    let index = id - 1;
    
    /* DRUHÉ POLÍČKO K OTOČENÍ */
    if(pocetOtocenych === 1){
        hraciplocha[index][0] = true;
        ukazNeboSchovObrazek(index + 1);
        /* zabrání v klikání na obrázky */
        document.querySelector(".container").addEventListener("click", avoidClicking, true);
        /* Program chvíli počká, aby hráč měl možnost vidět obrázky */
        await sleep(2000);
        otocene.second = index;        
        /* Zjistí, zda se shoduje první s druhým */
        nechOtoceno(otocene.first, otocene.second);
        /* vynuluje počeet otočených */
        pocetOtocenych = 0;
        document.querySelector(".container").removeEventListener("click", avoidClicking, true)
        return;
    }
    /* PRVNÍ POLÍČKO K OTOČENÍ */
    if(pocetOtocenych === 0){
        hraciplocha[index][0] = true;
        ukazNeboSchovObrazek(index + 1);
        otocene.first = index;
        /* tímto se zvýší hodnota počtu otočených */
        pocetOtocenych++;
    }
}


/* Funkce, která zjistí zda jsou obrázky stejné a pokud ano, nechá je otočené a přište body. Pokud nejsou stejné, schová je.  */
function nechOtoceno(prvniid, druhyid) {
    /* porovná jestli se shodují url obrázků */
    if (hraciplocha[prvniid][1] === hraciplocha[druhyid][1]) {
        /* pokud jsou obrázky stejné, už na ně nelze kliknout */
        document.getElementById(prvniid + 1).setAttribute("onClick", "");
        document.getElementById(druhyid + 1).setAttribute("onClick", "");
        /* přičtou se body */
        aktualizujStav(10);
    }
    else {
        /* když stejné nejsou, otočí se zpět */
        hraciplocha[prvniid][0] = false;
        hraciplocha[druhyid][0] = false;
        ukazNeboSchovObrazek(prvniid + 1);
        ukazNeboSchovObrazek(druhyid + 1);
    }
}

/* funkce náhody, zamíchá pole s adresami obrázků */
function shuffle(pole) {
    var j, x, i;
    for (i = pole.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = pole[i];
        pole[i] = pole[j];
        pole[j] = x;
    }
    return pole;
}

/* Zobrazí vyskakovací okno s textem nápovědy */
function showHelp() {
    alert("Tohle je pexeso, otáčej kartičky. Když budou dvě stejné, zůstanou otočené a přičtou se ti body. " + 
    "Když ne, obrázky se skryjí a máš další pokus. Tvým úkolem je najít všechny dvojice. " + 
    "Za každou dvojici získáš 10 bodů. Maximum je tedy 80 bodů.");
}