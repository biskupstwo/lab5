let map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0){
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

const puzzle = () => {
    leafletImage(map, function (err, canvas){
        // here we have the canvas
        let rasterMap = document.getElementById("rasterMap");
        let rasterContext = rasterMap.getContext("2d");
        rasterContext.drawImage(canvas, 0, 0, 800, 500);
        const puzzleWidth = rasterMap.width / 4;
        const puzzleHeight = rasterMap.height / 4; 
    });
};



var arr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
shuffle(arr);
console.log(arr);
        
const setLoc = () => {
    if (! navigator.geolocation) {
        alert("No geolocation.");
    }
    navigator.geolocation.getCurrentPosition(position => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        map.setView([lat, lon],18);
    }, positionError => {
        console.error(positionError);
    });
}

document.getElementById('getLocation').addEventListener('click', setLoc);
document.getElementById('saveButton').addEventListener('click', puzzle);