// script_design.js
let currentAspectRatio = '16:9';
let currentColor = 'cornflowerblue';

let btn_num = 1;
let btn_curclick = null;

let txtbox_num = 1;

let windowCount = 1;
let currentWindow = 'window1';

let cssMap = {
    '#window1': {},
    '.resultpage': {
        'position': 'absolute',
        'overflow': 'auto',
        'background-color': 'cornflowerblue',
        'border': '1px solid #ccc'
    },
    '.custom-button': {
        'display': 'inline-block',
        'resize': 'both',
        'background-color': 'white',
        'max-height': '300px',
        'max-width': '400px'
    },
    '.custom-textbox': {
        'border': '1px solid #000',
        'background-color': 'white',
        'resize': 'both',
        'text-align': 'center',
        'max-height': '300px',
        'max-width': '400px'
    },
    '.custom-textbox[contenteditable]:empty:before': {
        'content': 'attr(data-placeholder)',
        'color': 'grey',
        'pointer-events': 'none'
    }
};

// @load_preview_html
function loadHTML(url, elementId) {

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
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


// @adjust_resultpage_size
function adjustResultPageSize() {
    const topRight = document.querySelector('.resizable.top-right');
    const resultPage = document.getElementById(currentWindow);
    const resultRect = resultPage.getBoundingClientRect();

    if (topRight && resultPage) {
        const topRightRect = topRight.getBoundingClientRect();
        const aspectRatio = getAspectRatio(currentAspectRatio);
        let newWidth, newHeight, newRatio;

        if (topRightRect.width / topRightRect.height > aspectRatio) {
            newHeight = topRightRect.height;
            newWidth = newHeight * aspectRatio;
            newRatio = newHeight /  resultRect.width;
        } else {
            newWidth = topRightRect.width;
            newHeight = newWidth / aspectRatio;
            newRatio = newWidth / resultRect.width;
        }

        resultPage.style.width = `${newWidth}px`;
        resultPage.style.height = `${newHeight}px`;

        cssId = '#' + currentWindow;
        cssMap[cssId]['width'] = window.getComputedStyle(resultPage).getPropertyValue('width');
        cssMap[cssId]['height'] = window.getComputedStyle(resultPage).getPropertyValue('height');
        // resultPage.style.top = `${(topRightRect.height - newHeight) / 2}px`;
        // resultPage.style.left = `${(topRightRect.width - newWidth) / 2}px`;
    }
}

///////////////// save style attributes as .css file ////////////////////////////////////////////////////////////////////////

// @parse_css_to_json
function parseCssMapToJson(cssMap) {
    return new Promise((resolve) => {
        let cssString = 'html, body {\n    margin: 0;\n    padding: 0;\n    width: 100%;\n    height: 100%;\n    overflow: hidden;\n}\n\n';

        for (const [selector, styles] of Object.entries(cssMap)) {
            cssString += `${selector} {\n`;

            // Border properties
            if (styles['border-radius-input']) {
                cssString += `    border-radius: ${styles['border-radius-input']};\n`;
                delete styles['border-radius-input'];
            }

            for (const [property, value] of Object.entries(styles)) {
                if (selector.match(/^#window\d+$/)) {
                    if (property === 'width' || property === 'height') {
                        cssString += `    ${property}: 100%;\n`;
                        continue;
                    }
                }
                if (property === 'backgroundColor') {
                    cssString += `    background-color: ${value};\n`;
                } else if (property === 'fontSize') {
                    cssString += `    font-size: ${value};\n`;
                } else if (property === 'fontFamily') {
                    cssString += `    font-family: ${value};\n`;
                } else if (property === 'opacity') {
                    cssString += `    opacity: ${value};\n`;
                } else {
                    cssString += `    ${property}: ${value};\n`;
                }
            }
            cssString += '}\n';
        }
        console.log(cssString);

        resolve(cssString);
    });
}

function getCleanedResultPageHTML() {
    const resultPageContainer = document.getElementById('resultpage-container');
    const resultPages = resultPageContainer.querySelectorAll('.resultpage');

    resultPages.forEach(resultPage => {
        resultPage.style.width = '';
        resultPage.style.height = '';
    });

    return resultPageContainer.innerHTML;
}

// @create_download_src_zip
function createAndDownloadZip() {
    const zip = new JSZip();
    const folder = zip.folder("user");

    // extractStylesFromResultPage()
    parseCssMapToJson(cssMap)
        .then(cssContent => {
            folder.file("styles.css", cssContent);

            // Fetch and add main.html from the DOM
            const resultPageHTML = getCleanedResultPageHTML();
            const mainHtmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>User Web HTML</title>
                    <link rel="stylesheet" href="./styles.css" type="text/css">
                    <script src = "script.js"> </script>
                </head>
                <body>
                    ${resultPageHTML}
                </body>
                </html>
            `;
            folder.file("main.html", mainHtmlContent);
            folder.file("script.js",JS_code_sucess);
            /*// Fetch and add script.js
            return fetch('user/script.js');
        })
        .then(response => response.text())
        .then(scriptJs => {
            folder.file("script.js", scriptJs);
*/
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



///////////////// @window_controls ////////////////////////////////////////////////////////////////////////

function addWindow() {
    windowCount++;
    const newWindow = document.createElement('div');
    newWindow.classList.add('resultpage');
    newWindow.id = 'window' + windowCount;
    newWindow.style.position = "relative";
    document.getElementById('resultpage-container').appendChild(newWindow);
    updateWindowButtons();
    document.querySelectorAll('.resultpage').forEach(win => {
        win.style.display = win.id === currentWindow ? 'block' : 'none';
    });
    cssId = '#window' + windowCount;
    cssMap[cssId] = {};
}

function getWindowNumber(windowId) {
    const match = windowId.match(/\d+/); // 숫자에 매칭되는 정규 표현식
    return match ? parseInt(match[0], 10) : null; // 매칭된 숫자를 반환, 없으면 null 반환
}

function deleteWindow() {
    if (currentWindow !== 'window1') {
        const windowToDelete = document.getElementById(currentWindow);
        const windowNumToDelete = getWindowNumber(windowToDelete.id);
        cssIdToDelete = '#window' + windowNumToDelete;
        delete cssMap[cssIdToDelete];

        windowToDelete.parentNode.removeChild(windowToDelete);
        windowCount--;
        currentWindow = 'window1';
        updateWindowButtons();
        document.querySelectorAll('.resultpage').forEach(win => {
            var winId = getWindowNumber(win.id);
            if (winId > windowNumToDelete) {
                cssOldId = '#window' + winId;
                win.id = 'window' + --winId;
                cssNewId = '#window' + winId;
                cssMap[cssNewId] = cssMap[cssOldId]
                delete cssMap[cssOldId];
            }
            win.style.display = win.id === currentWindow ? 'block' : 'none';
        });
    }
}

function updateWindowButtons() {
    const windowButtonsContainer = document.getElementById('window-buttons');
    windowButtonsContainer.innerHTML = '';
    for (let i = 1; i <= windowCount; i++) {
        const windowButton = document.createElement('button');
        windowButton.textContent = 'Window ' + i;
        windowButton.id = 'button-window' + i;
        windowButton.addEventListener('click', () => {
            currentWindow = 'window' + i;
            document.querySelectorAll('.resultpage').forEach(win => {
                win.style.display = win.id === currentWindow ? 'block' : 'none';
            });
            adjustResultPageSize();
        });
        windowButtonsContainer.appendChild(windowButton);
    }
}


///////////////// design attributes ////////////////////////////////////////////////////////////////////////

// @change_bg_color
function changeBackgroundColor(color) {
    currentColor = color;
    const resultPage = document.getElementById(currentWindow);
    if (resultPage) {
        resultPage.style.backgroundColor = color;
    }
    cssId = '#' + currentWindow;
    if (!cssMap[cssId]) {
        cssMap[cssId] = {};
    }
    cssMap[cssId]['background-color'] = color;
}


// @add_btn
function addButtonToResultPage() {
    const btn = document.createElement('button');
    const btnText = document.createTextNode('Button ' + btn_num);
    btn.appendChild(btnText);

    btn.style.position = "absolute";
    btn.style.width = "20%";
    btn.style.height = "15%";
    btn.style.top = `${btn_num * 11}%`;
    btn.style.left = "10%";
    btn.style.resize = "true";
    btn.style.fontSize = "14px";
    btn.style.fontFamily = "Arial";

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

    cssId = '#' + btn.id;
    cssMap[cssId] = {
        'position': "absolute",
        'width': "20%",
        'height': "15%",
        'top': `${btn_num * 11}%`,
        'left': "10%",
        'resize': "true",
        'fontSize': "14px",
        'fontFamily': "Arial",
        "border-color-input": document.getElementById("border-color-input").value,
        "border-width-input": document.getElementById("border-width-input").value,
        "border-radius-input": document.getElementById("border-radius-input").value,
        "background-color": 'white',
        "opacity": document.getElementById("element-background-opacity").value
    }

    // document.querySelector(".resultpage").appendChild(btn);
    document.getElementById(currentWindow).appendChild(btn);
    dragElement(document.getElementById('btn' + String(btn_num)));
    document.getElementById('btn' + String(btn_num)).style.zIndex = btn_num;
    btn_num += 1;


    updateDropdownOptions(btn.id);
    // scaleElements();
}


// @add_textbox
let isDraggingText = false;
function addTextboxToResultPage() {
    const txtbox = document.createElement('div');
    txtbox.contentEditable = true;
    txtbox.dataset.placeholder = "textbox " + txtbox_num;
    txtbox.style.position = "absolute";
    txtbox.style.width = "30%";
    txtbox.style.height = "20%";
    txtbox.style.top = `${txtbox_num * 11}%`;
    txtbox.style.left = "30%"; 
    txtbox.style.backgroundColor = "white"; 
    txtbox.style.border = "1px solid #000";
    txtbox.style.zIndex = txtbox_num;
    txtbox.style.fontSize = "14px";
    txtbox.style.fontFamily = "Arial";

    txtbox.id = 'txtbox' + String(txtbox_num);
    txtbox.classList.add("resizable", "custom-textbox");

    txtbox.addEventListener('click', function(event) {
        event.stopPropagation(); 
        btn_curclick = event.target;
        console.log('Selected textbox ID:', btn_curclick.id);
        document.getElementById("border-color-input").value = rgbToHex(window.getComputedStyle(event.target).getPropertyValue('border-color'));
        document.getElementById("border-width-input").value = extractFirstPxValue(window.getComputedStyle(event.target).getPropertyValue('border-width'));
        document.getElementById("border-radius-input").value = window.getComputedStyle(event.target).getPropertyValue('border-radius').replace('px', '');
        document.getElementById("background-color-input").value = rgbToHex(window.getComputedStyle(event.target).getPropertyValue('background-color'));
        document.getElementById("element-background-opacity").value = window.getComputedStyle(event.target).getPropertyValue('opacity') * 100;
        document.getElementById('name-input').value = btn_curclick.id; 

        document.getElementById('font-size-input').value = getFontSize(window.getComputedStyle(event.target).getPropertyValue('font'));
        document.getElementById('fontname-select').value = getFont(window.getComputedStyle(event.target).getPropertyValue('font'));

        txtbox.contentEditable = false; 
        isDraggingText = false;
        txtbox.focus();
    });
    
    cssId = '#' + txtbox.id;
    cssMap[cssId] = {
        'position': "absolute",
        'width': "30%",
        'height': "20%",
        'top': `${txtbox_num * 11}%`,
        'left': "30%",
        'background-color': 'white',
        'border': "1px solid #000",
        'zIndex': txtbox_num,
        'fontSize': "14px",
        'fontFamily': "Arial",
        "border-color-input": document.getElementById("border-color-input").value,
        "border-width-input": document.getElementById("border-width-input").value,
        "border-radius-input": document.getElementById("border-radius-input").value,
        "opacity": document.getElementById("element-background-opacity").value,
        'name-input': document.getElementById('name-input').value,
    }

    txtbox.addEventListener('dblclick', function(event) {
        event.stopPropagation();
        btn_curclick = event.target;
        
        txtbox.contentEditable = true;
        isDraggingText = true;
        txtbox.focus();

        // for cursor to locate at the end of the text
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(txtbox);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    });

    txtbox.addEventListener('blur', function() {
        if (txtbox.textContent.trim() === "") {
            txtbox.innerHTML = "";
        }
        txtbox.setAttribute('readonly', true);
        isDraggingText = false;
        cssMap[cssId]['text'] = txtbox.textContent;
    });

    // document.querySelector(".resultpage").appendChild(txtbox);
    document.getElementById(currentWindow).appendChild(txtbox);

    dragElement(txtbox);
    txtbox_num += 1;
    // scaleElements();
}


// @utilities
function rgbToHex(rgb) {
    const rgbArray = rgb.match(/\d+/g).map(Number);
    return `#${((1 << 24) + (rgbArray[0] << 16) + (rgbArray[1] << 8) + rgbArray[2]).toString(16).slice(1).toUpperCase()}`;
}

function extractFirstPxValue(value) {
    const match = value.match(/(\d+\.?\d*)px/);
    return match ? match[1] : '';
}

function getFontSize(fontString) {
    const match = fontString.match(/(\d+)px\s+["]?([^"]+)["]?$/);
    const fontSize = match[1];
    return fontSize;
}

function getFont(fontString) {
    const match = fontString.match(/(\d+)px\s+["]?([^"]+)["]?$/);
    const fontName = match[2];
    return fontName;
}

// @utilities_drag_element
function dragElement(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const resultPage = document.getElementById(currentWindow);
    let isResizing = false;


    if (element) {
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        if (isDraggingText) {
            element.contentEditable = true;
            element.focus();
            return
        }
        e = e || window.event;
        const rect = element.getBoundingClientRect();
        isResizing = e.clientX > rect.right - 10 && e.clientY > rect.bottom - 10;


        if (isResizing) {
            document.onmousemove = elementResize;
            document.onmouseup = closeResizeElement;
        } else {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmousemove = elementDrag;
            document.onmouseup = closeDragElement;
        }
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        const newTop = Math.max(0, Math.min(resultPage.offsetHeight - element.offsetHeight, element.offsetTop - pos2));
        const newLeft = Math.max(0, Math.min(resultPage.offsetWidth - element.offsetWidth, element.offsetLeft - pos1));

        topPercent = newTop * 100 / resultPage.offsetHeight;
        leftPercent = newLeft * 100 / resultPage.offsetWidth;

        element.style.top = topPercent + '%';
        element.style.left = leftPercent + '%';
    }

    function elementResize(e) {
        e.preventDefault();
        const rect = element.getBoundingClientRect();
        const resultRect = resultPage.getBoundingClientRect();

        widthPercent = (e.clientX - rect.left) * 100 / resultRect.width;
        heightPercent = (e.clientY - rect.top) * 100 / resultRect.height;
        element.style.width = widthPercent + '%';
        element.style.height = heightPercent + '%';
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        isResizing = false;

        cssId = '#' + element.id;
        if (cssMap[cssId]) {
            cssMap[cssId]['top'] = window.getComputedStyle(element).getPropertyValue('top');
            cssMap[cssId]['left'] = window.getComputedStyle(element).getPropertyValue('left');
        }
    }

    function closeResizeElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        isResizing = false;

        cssId = '#' + element.id;
        if (cssMap[cssId]) {
            cssMap[cssId]['width'] = window.getComputedStyle(element).getPropertyValue('width');
            cssMap[cssId]['height'] = window.getComputedStyle(element).getPropertyValue('height');
        }
    }
}

// @utilities_remove_element
function removeElement() {
    if (btn_curclick && btn_curclick.id !== currentWindow) {
        btn_curclick.remove();
        btn_curclick = null; // 선택된 요소 초기화
    }
    cssId = '#' + btn_curclick.id;
    if (cssMap[cssId]) {
        delete cssMap[cssId];
    }
}


///////////////// addEventClickListenr after all contents are loaded ///////////////////////////////


document.addEventListener('DOMContentLoaded', () => {
    // Call the function to load the HTML into the resultpage element
    loadHTML('../static/user/preview.html', 'resultpage-container');

    // Adjust the resultpage size on window resize
    window.addEventListener('resize', adjustResultPageSize);

    const addWindowButton = document.getElementById('addWindow');
    addWindowButton.addEventListener('click', addWindow);

    const deleteWindowButton = document.getElementById('deleteWindow');
    deleteWindowButton.addEventListener('click', deleteWindow);

    // Initial adjustment
    window.addEventListener('load', () => {
        currentAspectRatio = '16:9';
        adjustResultPageSize();
        updateWindowButtons();
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

    const deleteElementButton = document.getElementById('deleteElement');
    deleteElementButton.addEventListener('click', () => {
        removeElement();
    });

    // @element_formatter
    document.getElementById('border-radius-input').addEventListener('change', function() {
        if (btn_curclick && btn_curclick.id !== currentWindow) {
            btn_curclick.style.borderRadius = this.value + 'px';
            cssId = '#' + btn_curclick.id;
            if (!cssMap[cssId]) {
                cssMap[cssId] = {};
            }
            cssMap[cssId]['border-radius-input'] = this.value + 'px';
        }
    });

    document.getElementById('border-color-input').addEventListener('change', function() {
        if (btn_curclick && btn_curclick.id !== currentWindow) {
            btn_curclick.style.borderColor = this.value;
            cssId = '#' + btn_curclick.id;
            if (!cssMap[cssId]) {
                cssMap[cssId] = {};
            }
            cssMap[cssId]['border-color-input'] = this.value;
        }
    });

    document.getElementById('border-width-input').addEventListener('change', function() {
        if (btn_curclick && btn_curclick.id !== currentWindow) {
            btn_curclick.style.borderWidth = this.value + 'px';
            cssId = '#' + btn_curclick.id;
            if (!cssMap[cssId]) {
                cssMap[cssId] = {};
            }
            cssMap[cssId]['border-width-input'] = this.value + 'px';
        }
    });

    document.getElementById('background-color-input').addEventListener('change', function() {
        if (btn_curclick && btn_curclick.id !== currentWindow) {
            btn_curclick.style.backgroundColor = this.value;
            cssId = '#' + btn_curclick.id;
            if (!cssMap[cssId]) {
                cssMap[cssId] = {};
            }
            cssMap[cssId]['background-color'] = this.value;
        }
    });

    document.getElementById('element-background-opacity').addEventListener('change', function() {
        if (btn_curclick && btn_curclick.id !== currentWindow) {
            btn_curclick.style.opacity = this.value / 100;
            cssId = '#' + btn_curclick.id;
            if (!cssMap[cssId]) {
                cssMap[cssId] = {};
            }
            cssMap[cssId]['opacity'] = this.value / 100;
        }
    });

    document.getElementById('z-index-up').addEventListener('click', function() {
        if (!btn_curclick || btn_curclick.id === currentWindow) {
            alert('Select an Element');
            return;
        }
        let zIndex = parseInt(window.getComputedStyle(btn_curclick).getPropertyValue('z-index'));
        btn_curclick.style.zIndex = zIndex + 1;
        
        cssId = '#' + btn_curclick.id;
        if (!cssMap[cssId]) {
            cssMap[cssId] = {};
        }
        cssMap[cssId]['zIndex'] = zIndex + 1;
    });

    document.getElementById('z-index-down').addEventListener('click', function() {
        if (!btn_curclick || btn_curclick.id === currentWindow) {
            alert('Select an Element');
            return;
        }
        let zIndex = parseInt(window.getComputedStyle(btn_curclick).getPropertyValue('z-index'));
        btn_curclick.style.zIndex = Math.max(0, zIndex - 1);

        cssId = '#' + btn_curclick.id;
        if (!cssMap[cssId]) {
            cssMap[cssId] = {};
        }
        cssMap[cssId]['zIndex'] = zIndex - 1;
    });

    // @text_formatter
    document.getElementById('text-input').addEventListener('change', function() {
        if (btn_curclick && btn_curclick.id !== currentWindow && btn_curclick.tagName !== "DIV") {
            btn_curclick.innerHTML = this.value;
        }
    });

    document.getElementById('font-size-input').addEventListener('change', function() {
        if (btn_curclick && btn_curclick.id !== currentWindow) {
            const selection = window.getSelection(); 
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                if (range && !range.collapsed) {
                    const parentElement = range.commonAncestorContainer.parentElement;
                    if (parentElement.tagName === 'SPAN') {
                        parentElement.style.fontSize = this.value + "px";
                    } else {
                        const span = document.createElement('span');
                        span.style.fontSize = this.value + "px";
                        span.appendChild(range.extractContents());
                        range.insertNode(span);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
            else {
                btn_curclick.style.fontSize = this.value + "px";
            }

            cssId = '#' + btn_curclick.id;
            if (!cssMap[cssId]) {
                cssMap[cssId] = {};
            }
            cssMap[cssId]['fontSize'] = this.value + "px";
        }
    });

    document.getElementById('font-color-input').addEventListener('change', function() {
        if (btn_curclick && btn_curclick.id !== currentWindow) {
            const selection = window.getSelection(); 
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                if (range && !range.collapsed) {
                    const parentElement = range.commonAncestorContainer.parentElement;
                    if (parentElement.tagName === 'SPAN') {
                        parentElement.style.color = this.value;
                    } else {
                        const span = document.createElement('span');
                        span.style.color = this.value;
                        span.appendChild(range.extractContents());
                        range.insertNode(span);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
            else {
                btn_curclick.style.color = this.value;
            }

            cssId = '#' + btn_curclick.id;
            if (!cssMap[cssId]) {
                cssMap[cssId] = {};
            }
            cssMap[cssId]['color'] = this.value;
        }
    });

    document.getElementById('fontname-select').addEventListener('change', function() {
        if (btn_curclick && btn_curclick.id !== currentWindow) {
            const selection = window.getSelection(); 
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                if (range && !range.collapsed) {
                    const parentElement = range.commonAncestorContainer.parentElement;
                    if (parentElement.tagName === 'SPAN') {
                        parentElement.style.fontFamily = this.value;
                    } else {
                        const span = document.createElement('span');
                        span.style.fontFamily = this.value;
                        span.appendChild(range.extractContents());
                        range.insertNode(span);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
            else {
                btn_curclick.style.fontFamily = this.value;
            }

            cssId = '#' + btn_curclick.id;
            if (!cssMap[cssId]) {
                cssMap[cssId] = {};
            }
            cssMap[cssId]['fontFamily'] = this.value;
        }
    });

    document.getElementById('boldButton').addEventListener('click', function() {
        if (btn_curclick && btn_curclick.id !== currentWindow) {
            const selection = window.getSelection(); 
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                if (range && !range.collapsed) {
                    const parentElement = range.commonAncestorContainer.parentElement;
                    if (parentElement.tagName === 'SPAN') {
                        parentElement.style.fontWeight = span.style.fontWeight === 'bold' ? 'normal' : 'bold';
                    } else {
                        const span = document.createElement('span');
                        span.style.fontWeight = span.style.fontWeight === 'bold' ? 'normal' : 'bold';
                        span.appendChild(range.extractContents());
                        range.insertNode(span);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
            else {
                btn_curclick.style.fontWeight = btn_curclick.style.fontWeight === 'bold' ? 'normal' : 'bold';
            }
            
            cssId = '#' + btn_curclick.id;
            if (!cssMap[cssId]) {
                cssMap[cssId] = {};
            }
            cssMap[cssId]['fontWeight'] = btn_curclick.style.fontWeight === 'bold' ? 'normal' : 'bold';
        }
    });

    document.getElementById('italicButton').addEventListener('click', function() {
        if (btn_curclick && btn_curclick.id !== currentWindow) {
            const selection = window.getSelection(); 
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                if (range && !range.collapsed) {
                    const parentElement = range.commonAncestorContainer.parentElement;
                    if (parentElement.tagName === 'SPAN') {
                        parentElement.style.fontStyle = parentElement.style.fontStyle === 'italic' ? 'normal' : 'italic';
                    } else {
                        const span = document.createElement('span');
                        span.style.fontStyle = span.style.fontStyle === 'italic' ? 'normal' : 'italic';
                        span.appendChild(range.extractContents());
                        range.insertNode(span);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
            else {
                btn_curclick.style.fontStyle = btn_curclick.style.fontStyle === 'italic' ? 'normal' : 'italic';
            }

            cssId = '#' + btn_curclick.id;
            if (!cssMap[cssId]) {
                cssMap[cssId] = {};
            }
            cssMap[cssId]['fontStyle'] = btn_curclick.style.fontStyle === 'italic' ? 'normal' : 'italic';
        }
    });

    document.getElementById('superscriptButton').addEventListener('click', function() {
        if (btn_curclick && btn_curclick.id !== currentWindow) {
            const selection = window.getSelection(); 
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                if (range && !range.collapsed) {
                    const parentElement = range.commonAncestorContainer.parentElement;
                    if (parentElement.tagName === 'SPAN') {
                        parentElement.style.verticalAlign = parentElement.style.verticalAlign === 'super' ? 'baseline' : 'super';
                        parentElement.style.fontSize = parentElement.style.verticalAlign === 'super' ? 'smaller' : 'inherit';
                    } else {
                        const span = document.createElement('span');
                        span.style.verticalAlign = span.style.verticalAlign === 'super' ? 'baseline' : 'super';
                        span.style.fontSize = span.style.verticalAlign === 'super' ? 'smaller' : 'inherit';
                        span.appendChild(range.extractContents());
                        range.insertNode(span);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
            else {
                btn_curclick.style.verticalAlign = btn_curclick.style.verticalAlign === 'super' ? 'baseline' : 'super';
                btn_curclick.style.fontSize = btn_curclick.style.verticalAlign === 'super' ? 'smaller' : 'inherit';
            }

            cssId = '#' + btn_curclick.id;
            if (!cssMap[cssId]) {
                cssMap[cssId] = {};
            }
            cssMap[cssId]['verticalAlign'] = btn_curclick.style.verticalAlign === 'super' ? 'baseline' : 'super';
            cssMap[cssId]['fontSize'] = btn_curclick.style.verticalAlign === 'super' ? 'smaller' : 'inherit';
        }
    });

    document.getElementById('subscriptButton').addEventListener('click', function() {
        if (btn_curclick && btn_curclick.id !== currentWindow) {
            const selection = window.getSelection(); 
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                if (range && !range.collapsed) {
                    const parentElement = range.commonAncestorContainer.parentElement;
                    if (parentElement.tagName === 'SPAN') {
                        parentElement.style.verticalAlign = parentElement.style.verticalAlign === 'sub' ? 'baseline' : 'sub';
                        parentElement.style.fontSize = parentElement.style.verticalAlign === 'sub' ? 'smaller' : 'inherit';
                    } else {
                        const span = document.createElement('span');
                        span.style.verticalAlign = span.style.verticalAlign === 'sub' ? 'baseline' : 'sub';
                        span.style.fontSize = span.style.verticalAlign === 'sub' ? 'smaller' : 'inherit';
                        span.appendChild(range.extractContents());
                        range.insertNode(span);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
            else {
                btn_curclick.style.verticalAlign = btn_curclick.style.verticalAlign === 'sub' ? 'baseline' : 'sub';
                btn_curclick.style.fontSize = btn_curclick.style.verticalAlign === 'sub' ? 'smaller' : 'inherit';
            }

            cssId = '#' + btn_curclick.id;
            if (!cssMap[cssId]) {
                cssMap[cssId] = {};
            }
            cssMap[cssId]['verticalAlign'] = btn_curclick.style.verticalAlign === 'super' ? 'baseline' : 'sub';
            cssMap[cssId]['fontSize'] = btn_curclick.style.verticalAlign === 'super' ? 'smaller' : 'inherit';
        }
    });

});
