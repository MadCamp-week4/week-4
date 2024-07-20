// script_design.js
let currentAspectRatio = '4:3';
let currentColor = 'cornflowerblue';

let btn_num = 1;
let btn_curclick = null;

let txtbox_num = 1;

function loadHTML(url, elementId) {
    //console.log(updateDropdownOptions);
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            console.log('Loaded HTML:', data); // Debugging line
            document.getElementById(elementId).innerHTML = data;
            adjustResultPageSize();
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}



///////////////// adjust result page ratio ////////////////////////////////////////////////////////////////////////

function getAspectRatio(aspectRatio) {
    const [width, height] = aspectRatio.split(':').map(Number);
    return width / height;
}


function adjustResultPageSize() {
    const topRight = document.querySelector('.resizable.top-right');
    const resultPage = document.getElementById('resultpage');

    if (topRight && resultPage) {
        const topRightRect = topRight.getBoundingClientRect();
        const aspectRatio = getAspectRatio(currentAspectRatio);
        let newWidth, newHeight;

        if (topRightRect.width / topRightRect.height > aspectRatio) {
            newHeight = topRightRect.height;
            newWidth = newHeight * aspectRatio;
        } else {
            newWidth = topRightRect.width;
            newHeight = newWidth / aspectRatio;
        }

        resultPage.style.width = `${newWidth}px`;
        resultPage.style.height = `${newHeight}px`;
        resultPage.style.top = `${(topRightRect.height - newHeight) / 2}px`;
        resultPage.style.left = `${(topRightRect.width - newWidth) / 2}px`;
    }
}

///////////////// save style attributes as .css file ////////////////////////////////////////////////////////////////////////

function extractStylesFromResultPage() {
    const resultPage = document.querySelector('#resultpage-container .resultpage');
    if (!resultPage) {
        return Promise.resolve('');
    }

    const elements = [resultPage, ...resultPage.querySelectorAll('*')];
    let cssContent = '';

    elements.forEach(element => {
        const style = window.getComputedStyle(element);
        let elementCss = `${element.tagName.toLowerCase()}`;

        if (element.id) {
            elementCss += `#${element.id}`;
        }

        if (element.className) {
            elementCss += `.${element.className.split(' ').join('.')}`;
        }

        elementCss += ' {';

        for (let i = 0; i < style.length; i++) {
            const propName = style[i];
            const propValue = style.getPropertyValue(propName);
            //if (!['width', 'height', 'top', 'left'].includes(propName)) {
            elementCss += `${propName}: ${propValue}; `;
            //}
        }

        elementCss += '}';
        cssContent += elementCss + '\n';
    });

    return Promise.resolve(cssContent);
}

function createAndDownloadZip() {
    const zip = new JSZip();
    const folder = zip.folder("user");

    extractStylesFromResultPage()
        .then(cssContent => {
            folder.file("styles.css", cssContent);

            // Fetch and add main.html from the DOM
            const resultPageHTML = document.querySelector('#resultpage-container').innerHTML;
            const mainHtmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>User Web HTML</title>
                    <link rel="stylesheet" href="./styles.css" type="text/css">
                </head>
                <body>
                    ${resultPageHTML}
                </body>
                </html>
            `;
            folder.file("main.html", mainHtmlContent);

            // Fetch and add script.js
            return fetch('user/script.js');
        })
        .then(response => response.text())
        .then(scriptJs => {
            folder.file("script.js", scriptJs);

            // Generate zip file
            return zip.generateAsync({ type: "blob" });
        })
        .then(content => {
            // Create a link element for download
            const url = URL.createObjectURL(content);
            const downloadLink = document.getElementById('downloadLink');
            downloadLink.href = url;
            downloadLink.download = 'user_files.zip';
            downloadLink.style.display = 'block';
            downloadLink.click();
            downloadLink.style.display = 'none';

        })
        .catch(error => {
            console.error('Error creating zip file:', error);
        });
}



///////////////// design attributes ////////////////////////////////////////////////////////////////////////

function changeBackgroundColor(color) {
    currentColor = color;
    const resultPage = document.querySelector('#resultpage-container .resultpage');
    if (resultPage) {
        resultPage.style.backgroundColor = color;
    }
}


/* buttons **************************/
function addButtonToResultPage() {

    const btn = document.createElement('button');
    const btnText = document.createTextNode('Button ' + btn_num);
    btn.appendChild(btnText);

    btn.style.position = "absolute";
    btn.style.width = "100px";
    btn.style.height = "30px";
    btn.style.top = `${btn_num * 40}px`;  // 예제: 버튼이 겹치지 않게 아래로 쌓이도록 위치 설정
    btn.style.left = "10px";  // 예제: 좌측 여백 설정

    btn.id = 'btn' + String(btn_num);
    btn.classList.add("resizable", "custom-button");

    // 버튼 생성 시 클릭 이벤트 리스너 추가
    btn.addEventListener('click', function(event) {
        event.stopPropagation();  // 이벤트 버블링 방지
        btn_curclick = event.target;
        console.log('Selected button ID:', btn_curclick.id);
        document.getElementById("border-color-input").value = rgbToHex(window.getComputedStyle(event.target).getPropertyValue('border-color'));
        document.getElementById("border-width-input").value = extractFirstPxValue(window.getComputedStyle(event.target).getPropertyValue('border-width'));
        document.getElementById("border-radius-input").value = window.getComputedStyle(event.target).getPropertyValue('border-radius').replace('px', '');
        document.getElementById("background-color-input").value = rgbToHex(window.getComputedStyle(event.target).getPropertyValue('background-color'));
        document.getElementById("element-background-opacity").value = window.getComputedStyle(event.target).getPropertyValue('opacity') * 100;
    });

    document.querySelector(".resultpage").appendChild(btn);
    dragElement(document.getElementById('btn' + String(btn_num)));
    document.getElementById('btn' + String(btn_num)).style.zIndex = btn_num;
    btn_num += 1;

    updateDropdownOptions(btn.id);
}


/* text boxes **************************/

function addTextboxToResultPage() {
    const txtbox = document.createElement('textarea');
    txtbox.placeholder = "textbox " + txtbox_num;  // 기본 placeholder 설정
    txtbox.style.position = "absolute";
    txtbox.style.width = "200px";
    txtbox.style.height = "100px";
    txtbox.style.top = `${txtbox_num * 40}px`;
    txtbox.style.left = "120px";  // 버튼과 겹치지 않게 위치 설정
    txtbox.style.backgroundColor = "white";  // 기본 배경색
    txtbox.style.border = "1px solid #000";  // 기본 테두리
    txtbox.style.zIndex = txtbox_num;

    txtbox.id = 'txtbox' + String(txtbox_num);
    txtbox.classList.add("resizable", "custom-textbox");

    // 텍스트 박스 생성 시 클릭 이벤트 리스너 추가
    txtbox.addEventListener('click', function(event) {
        event.stopPropagation(); 
        btn_curclick = event.target;
        console.log('Selected textbox ID:', btn_curclick.id);
        document.getElementById("border-color-input").value = rgbToHex(window.getComputedStyle(event.target).getPropertyValue('border-color'));
        document.getElementById("border-width-input").value = extractFirstPxValue(window.getComputedStyle(event.target).getPropertyValue('border-width'));
        document.getElementById("border-radius-input").value = window.getComputedStyle(event.target).getPropertyValue('border-radius').replace('px', '');
        document.getElementById("background-color-input").value = rgbToHex(window.getComputedStyle(event.target).getPropertyValue('background-color'));
        document.getElementById("element-background-opacity").value = window.getComputedStyle(event.target).getPropertyValue('opacity') * 100;

        txtbox.focus();
    });

    document.querySelector(".resultpage").appendChild(txtbox);
    dragElement(document.getElementById('txtbox' + String(txtbox_num)));
    txtbox_num += 1;
}


/* facilities **************************/
function rgbToHex(rgb) {
    const rgbArray = rgb.match(/\d+/g).map(Number);
    return `#${((1 << 24) + (rgbArray[0] << 16) + (rgbArray[1] << 8) + rgbArray[2]).toString(16).slice(1).toUpperCase()}`;
}

function extractFirstPxValue(value) {
    const match = value.match(/(\d+\.?\d*)px/);
    return match ? match[1] : '';
}


function dragElement(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (element) {
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

///////////////// addEventClickListenr after all contents are loaded ///////////////////////////////


document.addEventListener('DOMContentLoaded', () => {
    // Call the function to load the HTML into the resultpage element
    loadHTML('user/preview.html', 'resultpage-container');

    // Adjust the resultpage size on window resize
    window.addEventListener('resize', adjustResultPageSize);

    // Initial adjustment
    window.addEventListener('load', () => {
        currentAspectRatio = '4:3';
        adjustResultPageSize();
    });

    // Adjust the resultpage size on aspect ratio change
    document.getElementById('aspectRatioSelector').addEventListener('change', (e) => {
        currentAspectRatio = e.target.value;
        adjustResultPageSize();
    });

    // Color picker functionality
    const colorPickerButton = document.getElementById('colorPickerButton');
    const colorPickerContainer = document.getElementById('colorPickerContainer');
    const colorPicker = document.getElementById('colorPicker');
    const hexColorInput = document.getElementById('hexColorInput');
    const applyColorButton = document.getElementById('applyColorButton');
    const closeColorPickerButton = document.getElementById('closeColorPickerButton');

    colorPickerButton.addEventListener('click', () => {
        colorPickerContainer.style.display = 'block';
    });

    applyColorButton.addEventListener('click', () => {
        const color = colorPicker.value;
        const hexColor = hexColorInput.value || color;
        changeBackgroundColor(hexColor);
        // saveBackgroundColor(hexColor);
    });

    closeColorPickerButton.addEventListener('click', () => {
        colorPickerContainer.style.display = 'none';
    });

    const downloadButton = document.getElementById('downloadButton');
    downloadButton.addEventListener('click', () => {
        if (confirm("정말 파일을 생성 하시겠습니까?")) {
            createAndDownloadZip();
        }
    });

    const addButton = document.getElementById('addButton');
    addButton.addEventListener('click', () => {
        addButtonToResultPage();
    });

    const addTextboxButton = document.getElementById('addTextBox');
    addTextboxButton.addEventListener('click', () => {
        addTextboxToResultPage();
    });

    // 스타일 조절 이벤트 핸들러 추가
    document.getElementById('border-radius-input').addEventListener('change', function() {
        console.log(btn_curclick.id)

        if (btn_curclick && btn_curclick.id !== "resultpage") {
            btn_curclick.style.borderRadius = this.value + 'px';
        }
    });

    document.getElementById('border-color-input').addEventListener('change', function() {
        if (btn_curclick && btn_curclick.id !== "resultpage") {
            btn_curclick.style.borderColor = this.value;
        }
    });

    document.getElementById('border-width-input').addEventListener('change', function() {
        if (btn_curclick && btn_curclick.id !== "resultpage") {
            btn_curclick.style.borderWidth = this.value + 'px';
        }
    });

    document.getElementById('background-color-input').addEventListener('change', function() {
        if (btn_curclick && btn_curclick.id !== "resultpage") {
            btn_curclick.style.backgroundColor = this.value;
        }
    });

    document.getElementById('element-background-opacity').addEventListener('change', function() {
        if (btn_curclick && btn_curclick.id !== "resultpage") {
            btn_curclick.style.opacity = this.value / 100;
        }
    });

    document.getElementById('z-index-up').addEventListener('click', function() {
        if (!btn_curclick || btn_curclick.id === "resultpage") {
            alert('Select an Element');
            return;
        }
        let zIndex = parseInt(window.getComputedStyle(btn_curclick).getPropertyValue('z-index'));
        btn_curclick.style.zIndex = zIndex + 1;
    });

    document.getElementById('z-index-down').addEventListener('click', function() {
        if (!btn_curclick || btn_curclick.id === "resultpage") {
            alert('Select an Element');
            return;
        }
        let zIndex = parseInt(window.getComputedStyle(btn_curclick).getPropertyValue('z-index'));
        btn_curclick.style.zIndex = Math.max(0, zIndex - 1);
    });
});
