let map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let row = 4;
let column = 4;

const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}


const setLoc = () => {
    if (!navigator.geolocation) {
        alert("No geolocation.");
    }
    navigator.geolocation.getCurrentPosition(position => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        map.setView([lat, lon], 18);
    }, positionError => {
        console.error(positionError);
    });
}
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(e) {
    e.dataTransfer.setData('text', ev.target.id);
}

function drop(e) {
    e.preventDefault();
    if (e.target.nodeName !== 'DIV') {
        e.target.style.border = '0px';
        return;
    }
    let data = e.dataTransfer.getData('text');
    let element = document.getElementById(data);
    if (!e.target.hasChildNodes()) {
        e.target.appendChild(element);
        e.target.style.border = '0px';
        element.style.border = '0px';
    }
    validatePuzzles();
}

function dropBack(e) {
    e.preventDefault();
    let data = e.dataTransfer.getData('text');
    let element = document.getElementById(data);
    element.style.border = '1px solid black';
    e.target.appendChild(element);
    validatePuzzles();
}

const sendNotification = async (message) => {
    let permission = await Notification.requestPermission();
    if (permission === 'granted') {
        new Notification(message);
    }
};

const validatePuzzles = () => {
    let puzzlesOrder = [...document.querySelectorAll('#puzzle .puzzle')].map(
        (element) => Number(element.id)
    );
    if (puzzlesOrder.length == row*column) {
        let result = puzzlesOrder.every((element, index) => element === index);
        if (result) {
            console.log('Puzzle wykonane!');
            sendNotification('Puzzle wykonane!');
        }
    }
};

const generateDropZones = (width, height) => {
    let wrapper = document.querySelector('#puzzle');
    document.querySelectorAll('.drop_puzzle').forEach((e) => e.remove());
    Array.from({ length: row*column }).forEach((_, i) => {
        let div = document.createElement('div');
        div.classList.add('drop_puzzle');
        div.width = `${width}px`;
        div.height = `${height}px`;
        div.addEventListener('drop', drop);
        div.addEventListener('dragover', allowDrop);
        div.addEventListener('dragenter', (e) => {
            e.target.style.border = '2px dashed #7f7fe9';
        });
        div.addEventListener('dragleave', (e) => {
            e.target.style.border = '0px';
        });
        wrapper.appendChild(div);
    });
    let gridTemplateColumns = '';
    let gridTemplateRows = '';
    Array.from({ length: column }).forEach(() => {
        gridTemplateColumns += ` ${width}px `;
    });
    Array.from({ length: row }).forEach(() => {
        gridTemplateRows += ` ${height}px `;
    });
    document.querySelector('#puzzle').style.gridTemplateColumns =
        gridTemplateColumns;
    document.querySelector('#puzzle').style.gridTemplateRows = gridTemplateRows;
};

const generatePuzzles = (Puzzles) => {
    let container = document.querySelector('#puzzle_container');
    container.querySelectorAll('img').forEach((img) => img.remove());
    let shuffledArray = shuffle(Puzzles);
    shuffledArray.forEach(({ id, img }) => {
        let Image = document.createElement('img');
        Image.id = id;
        Image.style.border = '1px solid black';
        Image.classList.add('puzzle');
        Image.draggable = true;
        Image.ondragstart = (e) => {
            e.dataTransfer.setData('text', e.target.id);
        };
        Image.src = img;
        container.appendChild(Image);
    });
};

const generatePieces = (puzzleWidth, puzzleHeight) => {
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
    canvas.width = puzzleWidth;
    canvas.height = puzzleHeight;
    let counter = 0;
    let puzzles = [];
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < column; j++, counter++) {
            context.drawImage(
                rasterMap,
                puzzleWidth * j,
                puzzleHeight * i,
                puzzleWidth,
                puzzleHeight,
                0,
                0,
                canvas.width,
                canvas.height
            );
            puzzles.push({
                id: counter,
                img: canvas.toDataURL('image/jpeg'),
            });
        }
    }
    return puzzles;
};

const puzzle = () => {
    leafletImage(map, function (_, canvas) {
        let rasterMap = document.getElementById("rasterMap");
        let rasterContext = rasterMap.getContext("2d");
        rasterContext.drawImage(canvas, 0, 0, 800, 500);
        const puzzleWidth = rasterMap.width / row;
        const puzzleHeight = rasterMap.height / column;
        generateDropZones(puzzleWidth, puzzleHeight);
        let puzzles = generatePieces(puzzleWidth, puzzleHeight);
        generatePuzzles(puzzles);
    });
};

document.getElementById('getLocation').addEventListener('click', setLoc);
document.getElementById('saveButton').addEventListener('click', puzzle);