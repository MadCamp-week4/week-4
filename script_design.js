// script_design.js

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
});
