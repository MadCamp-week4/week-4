document.addEventListener('DOMContentLoaded', () => {
    const designer = document.querySelector('.designer');
    const horizontalHandle = document.querySelector('.resize-handle-horizontal');
    const verticalHandle = document.querySelector('.resize-handle-vertical');
    const topRight = document.querySelector('.resizable.top-right');
    const bottomRight = document.querySelector('.resizable.bottom-right');
    let isResizingVertical = false;
    let isResizingHorizontal = false;

    // Horizontal resizing
    horizontalHandle.addEventListener('mousedown', (e) => {
        isResizingHorizontal = true;
        document.addEventListener('mousemove', resizeDesigner);
        document.addEventListener('mouseup', stopResizingHorizontal);
    });

    function resizeDesigner(e) {
        if (isResizingHorizontal) {
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth >= 100 && newWidth <= window.innerWidth) {
                designer.style.width = `${newWidth}px`;
            }
        }
    }

    function stopResizingHorizontal() {
        if (isResizingHorizontal) {
            document.removeEventListener('mousemove', resizeDesigner);
            document.removeEventListener('mouseup', stopResizingHorizontal);
            isResizingHorizontal = false;
        }
    }

    // Vertical resizing
    verticalHandle.addEventListener('mousedown', (e) => {
        isResizingVertical = true;
        document.addEventListener('mousemove', resizePanelsVertically);
        document.addEventListener('mouseup', stopResizingVertical);
    });

    function resizePanelsVertically(e) {
        if (isResizingVertical) {
            const designerRect = designer.getBoundingClientRect();
            const newHeight = e.clientY - designerRect.top;

            if (newHeight >= 50 && newHeight <= designerRect.height - 50) { // 최소 높이 50px 설정
                topRight.style.height = `${newHeight}px`;
                bottomRight.style.height = `${designerRect.height - newHeight}px`;
                verticalHandle.style.top = `${newHeight - 5}px`; // vertical handle 위치 조정
            }
        }
    }

    function stopResizingVertical() {
        if (isResizingVertical) {
            document.removeEventListener('mousemove', resizePanelsVertically);
            document.removeEventListener('mouseup', stopResizingVertical);
            isResizingVertical = false;
        }
    }
});
