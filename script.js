//================================
// SDA TONIC SOLFA
// PURE STRINGS ENSEMBLE (SLOW TEMPO)
//================================

const audio = new (window.AudioContext || window.webkitAudioContext)();

const notes = {
    D: 261.63,
    R: 293.66,
    M: 329.63,
    F: 349.23,
    S: 392.00,
    L: 440.00,
    T: 493.88
};

let playing = false;
let stopSong = false;
let caps = true;

//================================
// SIMPLE REVERB
//================================

function createReverb() {
    let delay = audio.createDelay();
    let feedback = audio.createGain();

    delay.delayTime.value = 0.3;
    feedback.gain.value = 0.28;

    delay.connect(feedback);
    feedback.connect(delay);

    return delay;
}

const reverb = createReverb();
reverb.connect(audio.destination);


//================================
// PURE STRINGS VOICE
//================================

function playNote(freq, duration = 1.2, isStressed = false) {
    let now = audio.currentTime;

    // Layered oscillators for a rich string ensemble effect
    let stringMain = audio.createOscillator();
    let stringSub  = audio.createOscillator();

    // Lowpass filter to give strings warmth
    let filter = audio.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(isStressed ? 1500 : 1200, now);

    stringMain.type = "sawtooth";
    stringSub.type  = "sawtooth";

    stringMain.frequency.value = freq;
    stringSub.frequency.value  = freq * Math.pow(2, 4 / 1200); // 4 cents detune chorus

    let stringGain = audio.createGain();

    stringMain.connect(filter);
    stringSub.connect(filter);
    filter.connect(stringGain);

    stringGain.connect(audio.destination);
    stringGain.connect(reverb);

    // Stressed last note gets a fuller volume peak & longer tail
    let peakVolume = isStressed ? 0.38 : 0.22;
    let releaseTime = isStressed ? duration + 1.5 : duration + 0.8;

    stringGain.gain.setValueAtTime(0.0001, now);
    stringGain.gain.linearRampToValueAtTime(peakVolume, now + (isStressed ? 0.35 : 0.2));
    stringGain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);

    stringMain.start(now);
    stringSub.start(now);

    stringMain.stop(now + releaseTime);
    stringSub.stop(now + releaseTime);
}


//================================
// WAIT
//================================

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


//================================
// PLAY HYMN
//================================

async function togglePlay(btn) {

    if (playing) {
        stopSong = true;
        playing = false;
        btn.innerHTML = "▶ Play";
        return;
    }

    let hymn = btn.closest(".tonic-solfa");
    if (!hymn) return;

    let p = hymn.querySelector("p");
    if (!p) return;

    if (audio.state === "suspended") {
        await audio.resume();
    }

    playing = true;
    stopSong = false;
    btn.innerHTML = "⏸ Pause";

    // 1. Process HTML: 
    // - Remove <b> tags AND all content inside them completely
    // - Convert <br> tags to unique markers '|'
    // - Strip any remaining HTML tags
    let rawHtml = p.innerHTML;
    let cleanText = rawHtml
        .replace(/<b\b[^>]*>[\s\S]*?<\/b>/gi, "") // Delete <b>...</b> content
        .replace(/<br\s*[\/]?>/gi, "|")            // Replace <br> with '|' break marker
        .replace(/<[^>]+>/g, "");                  // Strip out any remaining HTML tags

    // 2. Find the index of the very last valid solfa note
    let lastNoteIndex = -1;
    for (let i = cleanText.length - 1; i >= 0; i--) {
        if (notes[cleanText[i]]) {
            lastNoteIndex = i;
            break;
        }
    }

    // 3. Play sequence
    for (let i = 0; i < cleanText.length; i++) {

        if (stopSong) break;

        let char = cleanText[i];

        // 1-second pause on <br> (represented by '|')
        if (char === "|") {
            await wait(1000);
            continue;
        }

        // Short breaks
        if (char === ">" || char === "/") {
            await wait(250);
            continue;
        }

        // Phrase pause
        if (char === ":") {
            await wait(600);
            continue;
        }

        // Play matching solfa notes (Slower overall tempo)
        if (notes[char]) {
            let isLastNote = (i === lastNoteIndex);

            if (isLastNote) {
                // Stressed final note: held out long with deep swell
                playNote(notes[char], 2.2, true);
                await wait(1200);
            } else {
                playNote(notes[char], 1.2, false);
                await wait(550); // Slower tempo between notes
            }
        }
    }

    // Ending sustain
    await wait(800);

    playing = false;
    stopSong = false;
    btn.innerHTML = "▶ Play";
}
//================================
// FAVORITE HYMNS SYSTEM
//================================

window.favorites = JSON.parse(
    localStorage.getItem("favorites") || "[]"
);


// GET HYMN NUMBER
function getHymnNumber(hymn){

    let title = hymn.querySelector("span");

    if(!title) return "";

    let number = title.textContent.match(/\d+/);

    return number ? number[0] : "";

}


// TOGGLE HEART
function toggleFavorite(icon){

    let hymn = icon.closest(".tonic-solfa");

    if(!hymn) return;


    let number = getHymnNumber(hymn);

    if(number==="") return;


    let index = window.favorites.indexOf(number);


    if(index !== -1){

        window.favorites.splice(index,1);

        icon.classList.remove("bxs-heart");
        icon.classList.add("bx-heart");

        icon.style.color="";


    }else{


        window.favorites.push(number);

        icon.classList.remove("bx-heart");
        icon.classList.add("bxs-heart");

        icon.style.color="red";

    }


    localStorage.setItem(
        "favorites",
        JSON.stringify(window.favorites)
    );

}



// LOAD HEART STATE
function loadFavorites(){

    document.querySelectorAll(".favorite-btn")
    .forEach(icon=>{


        let hymn = icon.closest(".tonic-solfa");

        let number = getHymnNumber(hymn);


        if(window.favorites.includes(number)){


            icon.classList.remove("bx-heart");

            icon.classList.add("bxs-heart");

            icon.style.color="red";


        }

    });

}



//================================
// SHOW FAVORITE HYMNS
//================================
function showFavorites(){

    hideAllHymns();
    closePads();
    hideInterface();

    document.getElementById("favoriteTitle").style.display = "block";

    let found = false;

    document.querySelectorAll(".tonic-solfa").forEach(hymn => {

        let number = getHymnNumber(hymn);

        if(window.favorites.includes(number)){
            hymn.style.display = "block";
            found = true;
        }

    });

    if(!found){
        document.getElementById("favoriteTitle").style.display = "none";
        alert("NO FAVORITE HYMNS");
        showInterface();
    }
}
//================================
// FAVORITE TITLE
//================================
function showFavoriteTitle(){

    let title = document.getElementById("favoriteTitle");

    if(title){
        title.style.display = "flex";
    }

}

function hideFavoriteTitle(){

    let title = document.getElementById("favoriteTitle");

    if(title){
        title.style.display = "none";
    }

}
//=========================
// ELEMENTS
//=========================
const searchBox=document.getElementById("searchBox");
const keypad=document.getElementById("keypad");
const textpad=document.getElementById("textpad");
const navMenu=document.getElementById("navMenu");
const menuIcon=document.getElementById("menuIcon");

//=========================
// MENU
//=========================
function toggleMenu(){

    let open = navMenu.style.right === "0px";

    if(open){

        navMenu.style.right="-250px";
        menuIcon.className="bx bx-menu";

        showInterface();

    }else{

        navMenu.style.right="0px";
        menuIcon.className="bx bx-x";

        hideInterface();

    }

}

//=========================
// INTERFACE
//=========================
function hideInterface(){

    let box=document.querySelector(".interface-flex");

    if(box)
        box.style.display="none";

}


function showInterface(){

    let box=document.querySelector(".interface-flex");

    let hymnVisible=[...document.querySelectorAll(".tonic-solfa")]
    .some(h=>h.style.display==="block");

    if(box && !hymnVisible && searchBox.value.trim()===""){
        box.style.display="flex";
    }

}

//=========================
// NUMBER KEYPAD
//=========================
function showKeypad(){

    keypad.style.display=
    keypad.style.display==="grid"
    ?"none":"grid";

    textpad.style.display="none";

    hideInterface();

}

function addNumber(n){

    searchBox.value+=n;

}

function clearNumber(){

    searchBox.value="";

}


//=========================
// TEXT KEYPAD
//=========================
function showTextpad(){

    textpad.style.display=
    textpad.style.display==="block"
    ?"none":"block";

    keypad.style.display="none";

    hideInterface();

}


//=========================
// LETTERS
//=========================
function addLetter(letter){

    searchBox.value+=caps
    ?letter.toUpperCase()
    :letter.toLowerCase();

    caps=false;

    updateKeyboard();

}


//=========================
// SPACE
//=========================
function addSpace(){

    if(searchBox.value!==""){

        searchBox.value+=" ";

        caps=true;

        updateKeyboard();

    }

}


//=========================
// BACKSPACE
//=========================
function backspace(){

    searchBox.value=
    searchBox.value.slice(0,-1);

    let txt=searchBox.value;

    caps=
    txt===""||
    txt.endsWith(" ");

    updateKeyboard();

}


//=========================
// CLEAR
//=========================
function clearText(){

    searchBox.value="";

    caps=true;

    updateKeyboard();

}


//=========================
// UPDATE KEYS
//=========================
function updateKeyboard(){

    document.querySelectorAll(".letter")
    .forEach(key=>{

        let l=key.dataset.letter;

        key.textContent=
        caps
        ?l.toUpperCase()
        :l.toLowerCase();

    });

}


//=========================
// CLOSE KEYPADS
//=========================
function closePads(){

    keypad.style.display="none";

    textpad.style.display="none";

}

//=========================// CLICK OUTSIDE
//=========================
document.addEventListener("click",e=>{

    if(
        !searchBox.contains(e.target)&&
        !keypad.contains(e.target)&&
        !textpad.contains(e.target)&&
        !e.target.closest("#searchIcon")&&
        !e.target.closest("#menuIcon")&&
        !e.target.closest("#navMenu")
    ){

        closePads();

        if(navMenu.style.right!=="0px")
            showInterface();

    }

});

//=========================
// INITIAL KEYBOARD STATE
//=========================
updateKeyboard();

//=========================
// SEARCH HYMN (TEXT)
//=========================
function searchHymn(){
hideFavoriteTitle();
    let input=searchBox.value.trim().toLowerCase();

    if(input===""){
        hideAllHymns();
        showInterface();
        return;
    }

    let found=false;

    document.querySelectorAll(".tonic-solfa").forEach(hymn=>{

        let text=hymn.textContent.toLowerCase();

        if(text.includes(input)){
            hymn.style.display="block";
            found=true;
        }else{
            hymn.style.display="none";
        }

    });

    finishSearch(found);

}


//=========================
// SEARCH NUMBER (EXACT)
//=========================
function numberSearch(){
hideFavoriteTitle();
    let input=searchBox.value.trim();

    if(input===""){
        hideAllHymns();
        showInterface();
        return;
    }

    let found=false;

    document.querySelectorAll(".tonic-solfa").forEach(hymn=>{

        let span=hymn.querySelector("span");

        if(!span)return;

        let number=span.textContent.replace(/\D/g,"");

        if(number===input){
            hymn.style.display="block";
            found=true;
        }else{
            hymn.style.display="none";
        }

    });

    finishSearch(found);

}


//=========================
// AFTER SEARCH
//=========================
function finishSearch(found){

    closePads();

    hideInterface();

    searchBox.value="";

    caps=true;

    updateKeyboard();

}

//=========================
// HIDE ALL HYMNS
//=========================
function hideAllHymns(){

    document.querySelectorAll(".tonic-solfa").forEach(hymn=>{

        hymn.style.display="none";

    });

}


//=========================
// HYMN OF THE DAY
//=========================
function openHymn(id){
hideFavoriteTitle();
    hideAllHymns();

    let hymn=document.getElementById(id);

    if(hymn){

        hymn.style.display="block";

        hideInterface();

        closePads();

        hymn.scrollIntoView({
            behavior:"smooth",
            block:"start"
        });

    }

}


//=========================
// INPUT EVENTS
//=========================
searchBox.addEventListener("focus",()=>{
hideFavoriteTitle();
    hideInterface();

    let title = document.getElementById("favoriteTitle");
    if(title){
        title.style.display = "none";
    }

    if(searchBox.placeholder.includes("NUMBER"))
        showKeypad();
    else
        showTextpad();

});

//=========================
// ENTER KEY
//=========================
searchBox.addEventListener("keydown",e=>{

    if(e.key==="Enter"){

        if(searchBox.placeholder.includes("NUMBER"))
            numberSearch();
        else
            searchHymn();

    }

});


//=========================
// SEARCH ICONS
//=========================
function searchNow(){

    if(searchBox.placeholder.includes("NUMBER"))
        numberSearch();
    else
        searchHymn();

}


//=========================
// RESET
//=========================
function resetSearch(){
hideFavoriteTitle();
    searchBox.value="";

    hideAllHymns();

    closePads();

    caps=true;

    updateKeyboard();

    showInterface();

}

// START
hideAllHymns();

showInterface();

updateKeyboard();

loadFavorites();

window.onload = function () {
    loadFavorites();
};

// =========================
// PWA INSTALL PROMPT
// =========================

let deferredPrompt;

const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = "block";
});

installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
        console.log("App installed");
    }

    deferredPrompt = null;
    installBtn.style.display = "none";
});

window.addEventListener("appinstalled", () => {
    installBtn.style.display = "none";
});

// =========================
// SERVICE WORKER
// =========================

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {

        navigator.serviceWorker
            .register("./sw.js")

            .then(registration => {
                console.log("Service Worker Registered", registration);
            })

            .catch(error => {
                console.error("Service Worker Failed:", error);
            });

    });
}