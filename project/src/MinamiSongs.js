/* DEFINIZIONE DI ELEMENTI RUNTIME */

import { MinamiSongsJSON } from "./songsJSON.js";

const localStorageKey = "User_Minami";

const MinamiSongs = (localStorage.length > 0) ? initPage() : MinamiSongsJSON;

const subtitleText = `The are currently ("Albumless" included) ${MinamiSongs.length} Minami's Songs`;
const feedbackText = `The Songs which satisfy the Search Criteria are in total `;

const searchBarPlaceholder = `Search by Name, Album or Year...`;

const trackUpdateButtonText = `Change Status`;

const arrowDownImgPath = `./res/images/downArrow.svg`;
const arrowUpImgPath = `./res/images/upArrow.svg`;
const searchButtonPath = `./res/images/search-Button.png`;
const youtubeIconPath = `./res/images/youtubeIcon.svg`;

const switchStatusSearch = initSwitchStatusSearch();
const switchStatusTrack = initSwitchStatusTrack();
const switchStatusSort = initSwitchStatusSort();

let reverseSortStatus = false;



/* DEFINIZIONE DI ELEMENTI HTML */

const title = document.querySelector("#title");
const subtitle = document.querySelector("#subtitle");
const feedback = document.querySelector("#feedback");

const searchBar = document.querySelector("#searchBar");

const searchButtons = document.querySelectorAll(".searchButton");
const trackButtons = document.querySelectorAll(".trackButton");
const sortButtons = document.querySelectorAll(".sortButton");

const outputDiv = document.querySelector("#outputDiv");


/* FUNZIONI */

function initPage() {
    let storageObject;
    
    if(localStorage.getItem(localStorageKey)) {
        storageObject = JSON.parse(localStorage.getItem(localStorageKey));
        return (storageObject.length != MinamiSongsJSON.length) ? updateSongList(storageObject) : storageObject;
    }
    else {
        alert("If you had a previous Session, the data is now lost");
        return null;
    }
}

function updateSongList(storageSongList) {
    const updatedSongList = MinamiSongsJSON.map((elem) => {
        let temp = storageSongList.find(song => song["Title"] === elem["Title"]);
        elem["Check"] = temp ? temp["Check"] : elem["Check"];
        return elem;
    });

    return updatedSongList;
}

function initSwitchStatusSearch() {
    let switchStatusSearch = {};
    let propertiesStrings = [];
    const HTMLElementes = document.querySelectorAll(".searchButton");

    for(let elem of HTMLElementes) {
        propertiesStrings.push(elem.textContent);
    }

    for(let i=0; i < propertiesStrings.length; i++) {
        switchStatusSearch[propertiesStrings[i]] = false;
    }

    switchStatusSearch[propertiesStrings[0]] = true;
    HTMLElementes.item(0).classList.toggle("activeButton", true);

    return switchStatusSearch;
}

function initSwitchStatusTrack() {
    let switchStatusTrack = {};
    let propertiesStrings = [];
    const HTMLElementes = document.querySelectorAll(".trackButton");

    for(let elem of HTMLElementes) {
        propertiesStrings.push(elem.textContent);
    }

    for(let i=0; i < propertiesStrings.length; i++) {
        switchStatusTrack[propertiesStrings[i]] = false;
    }

    return switchStatusTrack;
}

function initSwitchStatusSort() {
    let switchStatusSort = {};
    let propertiesStrings = [];
    const HTMLElementes = document.querySelectorAll(".sortButton");

    for(let elem of HTMLElementes) {
        propertiesStrings.push(elem.textContent.trim());
    }

    for(let i=0; i < propertiesStrings.length; i++) {
        switchStatusSort[propertiesStrings[i]] = 0;
    }

    return switchStatusSort;
}

function activateOption(option, switchStatus, buttonsArray) {
    switchStatus[option] = !switchStatus[option];

    for(const key in switchStatus) {
        if(switchStatus[key] && key != option) {
            switchStatus[key] = false;
            buttonsArray.find(elem => elem.textContent == key).classList.toggle("activeButton", false);
        }    
    }

    const button = buttonsArray.find(elem => elem.textContent == option);
    button.classList.toggle("activeButton", switchStatus[option]);

    funzioneMaster();
}

function activateSortOption(option, switchStatus=switchStatusSort, buttonsArray=[...sortButtons]) {
    switchStatus[option] === 2 ? switchStatus[option] = 0 : switchStatus[option]++;

    for(const key in switchStatus) {
        if(switchStatus[key] !== 0 && key != option) {
            switchStatus[key] = 0;
            let tempButton = buttonsArray.find(elem => elem.textContent.trim() == key);
            tempButton.classList.toggle("activeButton", false);
            tempButton.querySelector("img").src = "";
            tempButton.querySelector("img").style.display = "None";
        }    
    }

    const button = buttonsArray.find(elem => elem.textContent.trim() == option);

    switch(switchStatus[option]) {
        case 0:
            button.classList.toggle("activeButton", false);
            reverseSortStatus = false;
            button.querySelector("img").src = "";
            button.querySelector("img").style.display = "None";
            break;
        case 1:
            button.classList.toggle("activeButton", true);
            reverseSortStatus = false;
            button.querySelector("img").src = arrowDownImgPath;
            button.querySelector("img").style.display = "block";
            break;
        case 2:
            //button.classList.toggle("activeButton", true);
            reverseSortStatus = true;
            button.querySelector("img").src = arrowUpImgPath;
            button.querySelector("img").style.display = "block";
            break;
        default:
            console.error("Errore Impossibile");
    }

    funzioneMaster();
}

function searchSongs(songsArray=MinamiSongs, reverse=false, inputString) {
    let resArr = [];
    const searchCriteria = getSearchCriteria();

    resArr = songsArray.filter(elem => elem[searchCriteria] ? elem[searchCriteria].toLowerCase().includes(inputString.toLowerCase()) : null);

    resArr = applyStatusFilter(resArr, getTrackStatusFilter());

    resArr = applySortCriteria(resArr, getSortCriteria(), reverse);

    feedback.innerHTML = feedbackText + `<span>${resArr.length}</span>`;

    return resArr;
}

function getSearchCriteria() {
    let criteria;

    for(const key in switchStatusSearch) {
        if(switchStatusSearch[key]) {
            criteria = key;
        }
    }
    
    switch(criteria) {
        case "Search by Name":
            return "Title";
        case "Search by Album/Single":
            return "Single/Album";
        case "Search by Year":
            return "Year";
        default:
            return "Title";
    }
}

function applyStatusFilter(songsArray=MinamiSongs, trackStatusCriteria) {
    if(trackStatusCriteria) {
        songsArray = songsArray.filter(elem => getTrackStatus(elem) === trackStatusCriteria);
        
        feedback.innerHTML = feedbackText + `<span>${songsArray.length}</span>`;
    }
    
    return songsArray;
}

function getTrackStatusFilter() {
    let criteria = null;

    for(const key in switchStatusTrack) {
        if(switchStatusTrack[key]) {
            criteria = key;
        }
    }
    
    switch(criteria) {
        case "Unheard Songs":
            return "Unheard";
        case "Heard Songs":
            return "Heard";
        case "Playlist Songs":
            return "Playlist";
        default:
            return criteria;
    }
}

function getSortCriteria() {
    let criteria;

    for(const key in switchStatusSort) {
        if(switchStatusSort[key]) {
            criteria = key;
        }
    }
    
    switch(criteria) {
        case "Song":
            return "Title";
        case "Album":
            return "Single/Album";
        case "Year":
            return "Year";
        default:
            return "Title";
    }
}

function applySortCriteria(songsArray, sortCriteria, reverse) {
    songsArray.sort((a, b) => a[sortCriteria].toLowerCase() > b[sortCriteria].toLowerCase() ? 1 : -1);

    if(reverse)     songsArray.reverse();

    return songsArray;
}

function fillOutputDiv(songsArray=MinamiSongs) {
    outputDiv.innerHTML = "";

    for(const song of songsArray) {
        const songDiv = createSongBox(song);
        outputDiv.appendChild(songDiv);
    }
}

function createSongBox(song) {
    const songDiv = document.createElement("div");
    songDiv.classList.add("songDiv");
    assignSongDivClass(songDiv, song["Check"]);

    const songNameP = createSongNameP(song["Title"]);
    const songInfoDiv = createSongInfoDiv(song);
    const trackUpdateButtonP = createTrackUpdateButtonP(song);

    songDiv.appendChild(songNameP);
    songDiv.appendChild(songInfoDiv);
    songDiv.appendChild(trackUpdateButtonP);

    return songDiv;
}

function assignSongDivClass(songDiv, trackStatus) {
    switch(trackStatus) {
        case 0:
            songDiv.classList.add("statusUnheard");
            break;
        case 1:
            songDiv.classList.add("statusHeard");
            break;
        case 2:
            songDiv.classList.add("statusPlaylist");
            break;
        default:
            return "Errore Impossibile";
    }
}

function createSongNameP(songName) {
    const songNameP = document.createElement("p");
    songNameP.classList.add("songNameP");

    songNameP.textContent = songName;
    
    return songNameP;
}

function createSongInfoDiv(song) {
    const songInfoDiv = document.createElement("div");
    songInfoDiv.classList.add("songInfoDiv");
    
    const kanjiTitleP = document.createElement("p");
    kanjiTitleP.classList.add("songInfoElement");
    kanjiTitleP.innerHTML = `Kanji Title: <span>${song["Kanji Title"]}</span>`;

    const albumP = document.createElement("p");
    albumP.classList.add("songInfoElement");
    albumP.innerHTML = `Album/Single: <span>${song["Single/Album"]}</span>`;


    const songLinkP = document.createElement("p");
    songLinkP.classList.add("songInfoElement");
    songLinkP.textContent = `Song Youtube Link: `;

    const tempLinkElement1 = document.createElement("a");
    tempLinkElement1.href = song["Song"];
    tempLinkElement1.target = "_blank";
    tempLinkElement1.rel = "noopener noreferrer";   //idk
    //tempLinkElement1.textContent = "Song Youtube Link";
    tempLinkElement1.innerHTML = `<span><img src=${youtubeIconPath} class="yt"></span>`;
    songLinkP.appendChild(tempLinkElement1);


    const SearchYTP = document.createElement("p");
    SearchYTP.classList.add("songInfoElement");
    SearchYTP.textContent = `Youtube Search: `;

    const tempLinkElement2 = document.createElement("a");
    tempLinkElement2.href = song["Search on YT"];
    tempLinkElement2.target = "_blank";
    tempLinkElement2.rel = "noopener noreferrer";   //idk
    //tempLinkElement2.textContent = "Song Search Link";
    tempLinkElement2.innerHTML = `<img src=${searchButtonPath}>`;
    SearchYTP.appendChild(tempLinkElement2);


    const yearP = document.createElement("p");
    yearP.classList.add("songInfoElement");
    yearP.innerHTML = `Year: <span>${song["Year"]}</span>`;

    const trackStatusP = document.createElement("p");
    trackStatusP.classList.add("songInfoElement");
    trackStatusP.innerHTML = `Status: <span class="Status">${getTrackStatus(song)}</span>`;

    songInfoDiv.appendChild(kanjiTitleP);
    songInfoDiv.appendChild(albumP);
    songInfoDiv.appendChild(songLinkP);
    songInfoDiv.appendChild(SearchYTP);
    songInfoDiv.appendChild(yearP);
    songInfoDiv.appendChild(trackStatusP);

    return songInfoDiv;
}

function createTrackUpdateButtonP(song) {
    const trackUpdateButtonP = document.createElement("p");
    trackUpdateButtonP.classList.add("trackUpdateButtonP");

    const trackUpdateButton = document.createElement("button");
    trackUpdateButton.classList.add("trackUpdateButton");
    trackUpdateButton.textContent = trackUpdateButtonText;

    trackUpdateButton.addEventListener("click", () => { updateTrackStatus(MinamiSongs, song, trackUpdateButton.parentElement) });

    trackUpdateButtonP.appendChild(trackUpdateButton);

    return trackUpdateButtonP;
}

function getTrackStatus(song) {
    const trackStatus = song["Check"];

    switch(trackStatus) {
        case 0:
            return "Unheard";
        case 1:
            return "Heard";
        case 2:
            return "Playlist";
        default:
            return "Errore Impossibile";
    }
}

function updateTrackStatus(songList=MinamiSongs, song, songDiv) {
    const trackStatus = song["Check"];
    const songIndex = songList.findIndex(elem => elem["Title"] === song["Title"]);

    switch(trackStatus) {
        case 0:
            songList[songIndex]["Check"]++;
            break;
        case 1:
            songList[songIndex]["Check"]++;
            break;
        case 2:
            songList[songIndex]["Check"] = 0;
            break;
        default:
            return "Errore Impossibile";
    }

    saveSession(songList);
    funzioneMaster();
}

function saveSession(songList=MinamiSongs) {
    const sessionObject = JSON.stringify(songList);
    localStorage.setItem(localStorageKey, sessionObject);
}

function funzioneMaster() {
    const inputString = document.querySelector("#searchBar").value;

    if(!inputString) {
        feedback.innerHTML = "";
        fillOutputDiv(applySortCriteria(applyStatusFilter(MinamiSongs, getTrackStatusFilter()), getSortCriteria(), reverseSortStatus));
        return;
    }

    const resSongsArr = searchSongs(MinamiSongs, reverseSortStatus, inputString);

    fillOutputDiv(resSongsArr);
}


/* ESECUZIONE */

subtitle.textContent = subtitleText;

searchBar.placeholder = searchBarPlaceholder;

for(const elem of searchButtons) {
    elem.addEventListener("click", () => { activateOption(elem.textContent, switchStatusSearch, [...searchButtons]) });
}
for(const elem of trackButtons) {
    elem.addEventListener("click", () => { activateOption(elem.textContent, switchStatusTrack, [...trackButtons]) });
}
for(const elem of sortButtons) {
    elem.addEventListener("click", () => { activateSortOption(elem.textContent.trim(), switchStatusSort, [...sortButtons]) });
}

searchBar.addEventListener("input", funzioneMaster);

funzioneMaster();


