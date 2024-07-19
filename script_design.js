// script_design.js
let currentAspectRatio = '4:3';
let currentColor = 'cornflowerblue';

function loadHTML(url, elementId) {
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

    // Download functionality
    const downloadButton = document.getElementById('downloadButton');
    downloadButton.addEventListener('click', () => {
        if (confirm("정말 파일을 생성 하시겠습니까?")) {
            createAndDownloadZip();
        }
    });
});

function changeBackgroundColor(color) {
    currentColor = color;
    const resultPage = document.querySelector('#resultpage-container .resultpage');
    if (resultPage) {
        resultPage.style.backgroundColor = color;
    }
}

function saveBackgroundColor(color) {
    // Save to preview.html
    fetch('user/preview.html')
        .then(response => response.text())
        .then(html => {
            const updatedHtml = html.replace(/(<div class="resultpage"[^>]*style="[^"]*background-color:)[^;]+/, `$1 ${color}`);
            return fetch('user/preview.html', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'text/html'
                },
                body: updatedHtml
            });
        })
        .then(() => {
            console.log('Background color updated in preview.html');
        })
        .catch(error => {
            console.error('Error updating preview.html:', error);
        });

    // Save to styles.css
    fetch('user/styles.css')
        .then(response => response.text())
        .then(css => {
            const updatedCss = css.replace(/(body\s*{[^}]*background-color:)[^;]+/, `$1 ${color}`);
            return fetch('user/styles.css', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'text/css'
                },
                body: updatedCss
            });
        })
        .then(() => {
            console.log('Background color updated in styles.css');
        })
        .catch(error => {
            console.error('Error updating styles.css:', error);
        });
}

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
            //    elementCss += `${propName}: ${propValue}; `;
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