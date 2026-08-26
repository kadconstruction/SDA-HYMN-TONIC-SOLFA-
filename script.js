//================================
// SDA TONIC SOLFA
// MP3 HYMN PLAYER
//================================

let currentAudio = null;
let currentButton = null;
let caps = true;

//================================
// GET HYMN NUMBER
//================================

function getHymnNumber(hymn) {

    if (!hymn) return "";

    const title = hymn.querySelector("span");

    if (!title) return "";

    const match = title.textContent.match(/\d+/);

    return match ? match[0] : "";
}


//================================
// PLAY HYMN MP3
//================================

async function togglePlay(btn) {

    const hymn = btn.closest(".tonic-solfa");

    if (!hymn) return;

    const hymnNumber = getHymnNumber(hymn);

    if (!hymnNumber) {
        alert("Hymn number not found.");
        return;
    }


    //================================
    // IF THIS HYMN IS CURRENTLY PLAYING
    //================================

    if (
        currentAudio &&
        currentButton === btn &&
        !currentAudio.paused
    ) {

        currentAudio.pause();

        btn.innerHTML = "▶ Play";

        return;
    }


    //================================
    // STOP PREVIOUS HYMN
    //================================

    if (currentAudio) {

        currentAudio.pause();

        currentAudio.currentTime = 0;

        if (currentButton) {
            currentButton.innerHTML = "▶ Play";
        }
    }


    //================================
    // CREATE MP3 PATH
    //================================

    const audioPath = `audio/${hymnNumber}.mp3`;

    const hymnAudio = new Audio(audioPath);

    hymnAudio.preload = "auto";

    currentAudio = hymnAudio;

    currentButton = btn;


    //================================
    // PLAY
    //================================

    try {

        await hymnAudio.play();

        btn.innerHTML = "⏸ Pause";

    } catch (error) {

        console.error("Audio playback error:", error);

        btn.innerHTML = "▶ Play";

        alert(
            `Could not play hymn ${hymnNumber}.\n\n` +
            `Make sure audio/${hymnNumber}.mp3 exists.`
        );

        currentAudio = null;
        currentButton = null;

        return;
    }


    //================================
    // WHEN SONG FINISHES
    //================================

    hymnAudio.addEventListener("ended", () => {

        btn.innerHTML = "▶ Play";

        if (currentAudio === hymnAudio) {
            currentAudio = null;
            currentButton = null;
        }

    });


    //================================
    // AUDIO ERROR
    //================================

    hymnAudio.addEventListener("error", () => {

        console.error(
            `Could not load audio/${hymnNumber}.mp3`
        );

        btn.innerHTML = "▶ Play";

        alert(
            `Audio file not found:\n\n` +
            `audio/${hymnNumber}.mp3`
        );

        if (currentAudio === hymnAudio) {
            currentAudio = null;
            currentButton = null;
        }

    });

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