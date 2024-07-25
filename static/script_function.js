let workspace;
let customVariables = [];
let windowVariables = [];

var HTML_values = ["innerText","backgroundColor"];
// 키 리스트
const keyOptions = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', // 알파벳 소문자
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', // 알파벳 대문자
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', // 숫자
    'Enter', 'Tab', 'Backspace', 'Delete', 'Escape', 'Shift', 'Control', 'Alt', 'Meta', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', // 제어 키
    ' ', '!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~' // 특수 문자
];

// 코드 리스트
const codeOptions = [
    'KeyA', 'KeyB', 'KeyC', 'KeyD', 'KeyE', 'KeyF', 'KeyG', 'KeyH', 'KeyI', 'KeyJ', 'KeyK', 'KeyL', 'KeyM', 'KeyN', 'KeyO', 'KeyP', 'KeyQ', 'KeyR', 'KeyS', 'KeyT', 'KeyU', 'KeyV', 'KeyW', 'KeyX', 'KeyY', 'KeyZ', // 알파벳
    'Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', // 숫자
    'Enter', 'Tab', 'Backspace', 'Delete', 'Escape', 'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', // 제어 키
    'Space', 'Minus', 'Equal', 'BracketLeft', 'BracketRight', 'Backslash', 'Semicolon', 'Quote', 'Backquote', 'Comma', 'Period', 'Slash', // 특수 문자
    'CapsLock', 'ContextMenu', 'NumLock', 'ScrollLock', 'Pause', 'Insert', 'Home', 'PageUp', 'PageDown', 'End', // 잠금 및 내비게이션 키
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', // 기능 키
    'Numpad0', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad7', 'Numpad8', 'Numpad9', // 숫자 패드 키
    'NumpadAdd', 'NumpadSubtract', 'NumpadMultiply', 'NumpadDivide', 'NumpadDecimal', 'NumpadEnter', 'NumpadEqual' // 숫자 패드 연산 키
];

var JS_code = "";

const pre_defined_func = `
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
`;
var JS_code_sucess = "";

const API_ENDPOINT = 'http://127.0.0.1:50585'; // Flask 서버 주소

async function submitCode(HTML, jsCode) {
    const response = await fetch('/submit_code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ htmlCode: HTML, jsCode: jsCode })
    });

    const result = await response.json();
    return result;
}

// 서버에 요청중인 팝업 띄우고 닫기 @show_loading_popup
function showPopup() {
    document.getElementById('loading_popup').style.display = 'flex';
    document.getElementById('loading_spinner').style.display = 'block';
    document.getElementById('loading_text').style.display = 'block';
    document.getElementById('result_text').style.display = 'none';
    document.getElementById('confirm_button').style.display = 'none';
}

// 팝업 닫기 @hide_loading_popup
function hidePopup() {
    document.getElementById('loading_popup').style.display = 'none';
}

// 팝업에 요청 결과 띄우기 @show_server_result
function showResult(message) {
    document.getElementById('loading_spinner').style.display = 'none';
    document.getElementById('loading_text').style.display = 'none';
    document.getElementById('result_text').style.display = 'block';
    document.getElementById('result_text').innerText = message;
    document.getElementById('confirm_button').style.display = 'block';
}

const createDropdownOptions = (variables) => {
    return variables.map(variable => [variable, variable]);
};

function createDropdownOptions_forstyles(elements) {
    return elements.map(element => [element.name, element.name]);
}

// 드롭다운 업데이트 함수
var updateDropdownOptions = (elementId) => {
    customVariables.push(elementId);
    const blocks = workspace.getAllBlocks();
    blocks.forEach(block => {
        if (block.type === 'html_component_id') {
            const dropdown = block.getField('HTML_COMPONENT');
            if (dropdown) {
                dropdown.menuGenerator_ = createDropdownOptions(customVariables);
                dropdown.setValue(elementId); // 새로 추가된 항목을 기본값으로 설정
            }
        }
    });
};

var deleteDropdownOptions = (elementId) => {
    const index = customVariables.indexOf(elementId);
    if (index > -1) {
        customVariables.splice(index, 1);
    }

    const blocks = workspace.getAllBlocks();
    blocks.forEach(block => {
        if (block.type === 'html_component_id') {
            const dropdown = block.getField('HTML_COMPONENT');
            if (dropdown) {
                dropdown.menuGenerator_ = createDropdownOptions(customVariables);
                if (dropdown.getValue() === elementId) {
                    dropdown.setValue(customVariables.length ? customVariables[0] : ''); // 기본값을 설정하거나 빈 값으로 설정
                }
            }
        }
    });
};

// 드롭다운 업데이트 함수 (윈도우)
var updateDropdownWindows = (windowId) => {
    windowVariables.push(windowId);
    const blocks = workspace.getAllBlocks();
    blocks.forEach(block => {
        if (block.type === 'window_id') {
            const dropdown = block.getField('WINDOW');
            if (dropdown) {
                dropdown.menuGenerator_ = createDropdownOptions(windowVariables);
                dropdown.setValue(windowId); // 새로 추가된 항목을 기본값으로 설정
            }
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loading_popup').style.display = 'none';
    const blocklyDiv = document.querySelector('#blocklyDiv');
    const generateCodeButton = document.getElementById('generateCodeButton');

    // 현재 preview안의 id가 있는 component들을 받아와서 변수로 설정, 기본 블럭은 해당 컴포넌트의 id를 text로 반환함
    const resultpageContainer = document.getElementById('resultpage-container');

    // JavaScript 상의 변수 목록
    let childElements = resultpageContainer.querySelectorAll('[id]');
    customVariables = Array.from(childElements).map(v => v.id);

    window.updateDropdownOptions = updateDropdownOptions;
    document.getElementById('confirm_button').addEventListener('click', hidePopup);

    fetch('/static/toolbox.xml')
      .then(response => response.text())
      .then(toolboxXml => {
        const parser = new DOMParser();
        const toolboxDom = parser.parseFromString(toolboxXml, 'text/xml');

        // component의 id가져오기, @html_component_id
        Blockly.Blocks['html_component_id'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("")
                    .appendField(new Blockly.FieldDropdown(createDropdownOptions(customVariables)),'HTML FIELD');
                this.setOutput(true, 'HTML_COMPONENT');
                this.setColour(160);
                this.setTooltip("Returns the id of the HTML component.");
                this.setHelpUrl("");
            }
        };

        // 코드 생성기
        Blockly.JavaScript.forBlock['html_component_id'] = function(block,generator) {
            var variable = block.getFieldValue('HTML FIELD');
            var code = `'${variable}'`;
            return [code, Blockly.JavaScript.ORDER_NONE];
        };

        //스타일 요소 블럭 정의 @html_component_styles
        // 스타일 요소와 tooltip 배열
        const styleElements = [
            { name: 'innerText', tooltip: 'Text of HTML Component', isStyle: false, isNumber: false },
            { name: 'backgroundColor', tooltip: 'Background color of HTML Component', isStyle: true, isNumber: false },
            { name: 'color', tooltip: 'Text color of HTML Component', isStyle: true, isNumber: false },
            { name: 'fontSize', tooltip: 'Font size of HTML Component', isStyle: true, isNumber: false },
            { name: 'fontWeight', tooltip: 'Font weight of HTML Component', isStyle: true, isNumber: false },
            { name: 'textAlign', tooltip: 'Text alignment of HTML Component', isStyle: true, isNumber: false },
            { name: 'width', tooltip: 'Width of HTML Component', isStyle: true, isNumber: false },
            { name: 'height', tooltip: 'Height of HTML Component', isStyle: true, isNumber: false },
            { name: 'margin', tooltip: 'Margin of HTML Component', isStyle: true, isNumber: false },
            { name: 'padding', tooltip: 'Padding of HTML Component', isStyle: true, isNumber: false },
            { name: 'border', tooltip: 'Border of HTML Component', isStyle: true, isNumber: false },
            { name: 'display', tooltip: 'Display style of HTML Component', isStyle: true, isNumber: false },
            { name: 'visibility', tooltip: 'Visibility of HTML Component', isStyle: true, isNumber: false },
            { name: 'position', tooltip: 'Position of HTML Component', isStyle: true, isNumber: false },
            { name: 'top', tooltip: 'Top position of HTML Component', isStyle: true, isNumber: false },
            { name: 'right', tooltip: 'Right position of HTML Component', isStyle: true, isNumber: false },
            { name: 'bottom', tooltip: 'Bottom position of HTML Component', isStyle: true, isNumber: false },
            { name: 'left', tooltip: 'Left position of HTML Component', isStyle: true, isNumber: false },
            { name: 'zIndex', tooltip: 'Z-index of HTML Component', isStyle: true, isNumber: true },
            { name: 'opacity', tooltip: 'Opacity of HTML Component', isStyle: true, isNumber: true },
            { name: 'overflow', tooltip: 'Overflow of HTML Component', isStyle: true, isNumber: false },
            { name: 'cursor', tooltip: 'Cursor style of HTML Component', isStyle: true, isNumber: false }
        ];

        styleElements.forEach(element => {
            // 블럭 정의
            Blockly.Blocks[`html_component_${element.name}`] = {
                init: function() {
                    this.appendValueInput("NAME")
                        .setCheck("HTML_COMPONENT")
                        .appendField(`${element.name} of`);
                    this.setOutput(true, element.isNumber ? 'Number' : 'String');
                    this.setColour(160);
                    this.setTooltip(element.tooltip);
                    this.setHelpUrl("");
                }
            };

            // JavaScript 코드 생성기 정의
            Blockly.JavaScript.forBlock[`html_component_${element.name}`] = function(block,generator) {
                var htmlComponent = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
                // 텍스트로 반환
                var code = element.isStyle ? `window.getComputedStyle(document.getElementById(${htmlComponent})).${element.name}` : `document.getElementById(${htmlComponent}).${element.name}`;
                return [code, Blockly.JavaScript.ORDER_NONE];
            };
        });

        //blockly 블럭 정의 @define_event_blocks
        const events = [
            { name: 'click', tooltip: 'On click of HTML Component' },
            { name: 'dblclick', tooltip: 'On double click of HTML Component' },
            { name: 'mouseover', tooltip: 'On mouse over of HTML Component' },
            { name: 'mouseout', tooltip: 'On mouse out of HTML Component' },
            { name : 'focus', tooltip : 'When HTML Component got focus'}
        ];
        
        events.forEach(event => {
            // 블럭 정의
            Blockly.Blocks[`html_component_${event.name}`] = {
                init: function() {
                    this.appendValueInput("NAME")
                        .setCheck("HTML_COMPONENT")
                        .appendField(`On ${event.name}`);
                    this.appendStatementInput("STATEMENT")
                        .setCheck(null);
                    this.setColour(160);
                    this.setTooltip(event.tooltip);  // tooltip 설정
                    this.setHelpUrl("");
                    this.setOutput(false, null);
                }
            };
        
            // JavaScript 코드 생성기 정의
            Blockly.JavaScript.forBlock[`html_component_${event.name}`] = function(block,generator) {
                var htmlComponent = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
                var statements_statement = Blockly.JavaScript.statementToCode(block, 'STATEMENT');
                
                console.log(statements_statement);
        
                var code = `document.getElementById(${htmlComponent}).addEventListener('${event.name}', async () => {
                    ${statements_statement}
                });`;
                return code;
            };
        });

       //html component의 내부 값들을 set할 수 있음 @set_html_component_value

        Blockly.Blocks['set_html_component_value'] = {
            init: function() {
                this.appendValueInput("FROM")
                    .setCheck("HTML_COMPONENT")
                    .appendField("Set")
                    .appendField(new Blockly.FieldDropdown(createDropdownOptions_forstyles(styleElements)), 'HTML_VALUES')
                    .appendField("of");
                this.appendDummyInput()
                    .appendField("to");
                this.appendValueInput("TO")
                    .setCheck(null);
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(100);
                this.setTooltip("");
                this.setHelpUrl("");
        
                this.setOnChange(function(changeEvent) {
                    var htmlValue = this.getFieldValue('HTML_VALUES');
                    var element = styleElements.find(el => el.name === htmlValue);
                    if (element && element.isNumber) {
                        this.getInput('TO').setCheck('Number');
                    } else {
                        this.getInput('TO').setCheck(null);
                    }
                });
            }
        };
        
        Blockly.JavaScript.forBlock['set_html_component_value'] = function(block,g) {
            var variable_name = block.getFieldValue('HTML_VALUES');
            var value_from = Blockly.JavaScript.valueToCode(block, 'FROM', Blockly.JavaScript.ORDER_ATOMIC);
            var value_to = Blockly.JavaScript.valueToCode(block, 'TO', Blockly.JavaScript.ORDER_ATOMIC);
            var code = '';
        
            if (variable_name === 'innerText') {
                code = `document.getElementById(${value_from}).innerText = ${value_to};\n`;
            } else {
                code = `document.getElementById(${value_from}).style.${variable_name} = ${value_to};\n`;
            }
            return code;
        };

          //////////////////KEYBOARD EVENTS////////////////////
          //@keyboard_keydown
          Blockly.Blocks['keyboard_keydown'] = {
            init: function() {
              this.appendDummyInput()
                  .appendField("Keyboard Keydown for")
                  .appendField(new Blockly.FieldDropdown([
                    ['key', 'KEY'], 
                    ['code', 'CODE']
                  ], function(option) {
                    // Dropdown 변경시 두 번째 dropdown 갱신
                    const keyBlock = this.getSourceBlock();
                    const keyDropdown = keyBlock.getField('KEY_TYPE');
                    if (option === 'KEY') {
                      keyDropdown.menuGenerator_ = keyOptions.map(k => [k, k]);
                    } else {
                      keyDropdown.menuGenerator_ = codeOptions.map(c => [c, c]);
                    }
                    keyDropdown.setValue(keyDropdown.menuGenerator_[0][1]);
                  }), 'TYPE')
                  .appendField(new Blockly.FieldDropdown(keyOptions.map(k => [k, k])), "KEY_TYPE");
              this.appendStatementInput("NAME")
                  .setCheck(null);
              this.setColour(50);
              this.setTooltip("");
              this.setHelpUrl("");
            }
          };
          
          // JavaScript 생성기 정의
          Blockly.JavaScript.forBlock['keyboard_keydown'] = function(block,generator) {
            const type = block.getFieldValue('TYPE');
            const keyType = block.getFieldValue('KEY_TYPE');
            const statements_name = Blockly.JavaScript.statementToCode(block, 'NAME');
            
            const eventKey = type === 'KEY' ? 'event.key' : 'event.code';
            
            const code = `
            document.addEventListener('keydown', (event) => {
              if (${eventKey} === '${keyType}') {
                ${statements_name}
              }
            });
            `;
            
            return code;
          };
        
        //keyboard_keyup
        // 블럭 정의 (keyup)
        Blockly.Blocks['keyboard_keyup'] = {
            init: function() {
            this.appendDummyInput()
                .appendField("Keyboard Keyup for")
                .appendField(new Blockly.FieldDropdown([
                    ['key', 'KEY'], 
                    ['code', 'CODE']
                ], function(option) {
                    // Dropdown 변경시 두 번째 dropdown 갱신
                    const keyBlock = this.getSourceBlock();
                    const keyDropdown = keyBlock.getField('KEY_TYPE');
                    if (option === 'KEY') {
                    keyDropdown.menuGenerator_ = keyOptions.map(k => [k, k]);
                    } else {
                    keyDropdown.menuGenerator_ = codeOptions.map(c => [c, c]);
                    }
                    keyDropdown.setValue(keyDropdown.menuGenerator_[0][1]);
                }), 'TYPE')
                .appendField(new Blockly.FieldDropdown(keyOptions.map(k => [k, k])), "KEY_TYPE");
            this.appendStatementInput("NAME")
                .setCheck(null);
            this.setColour(50);
            this.setTooltip("");
            this.setHelpUrl("");
            }
        };
        
        // JavaScript 생성기 정의 (keyup)
        Blockly.JavaScript.forBlock['keyboard_keyup'] = function(block,generator) {
            const type = block.getFieldValue('TYPE');
            const keyType = block.getFieldValue('KEY_TYPE');
            const statements_name = Blockly.JavaScript.statementToCode(block, 'NAME');
            
            const eventKey = type === 'KEY' ? 'event.key' : 'event.code';
            
            const code = `
            document.addEventListener('keyup', (event) => {
            if (${eventKey} === '${keyType}') {
                ${statements_name}
            }
            });
            `;
            
            return code;
        };

        // 키보드 입력과 주어지는 string과 비교 @keyboard_keydown_compare

        Blockly.Blocks['keyboard_keydown_compare'] = {
            init: function() {
              this.appendValueInput("KEY")
                  .setCheck("String")
                  .appendField("Keyboard Keydown for");
              this.appendStatementInput("STATEMENT")
                  .setCheck(null);
              this.setColour(50);
              this.setTooltip("");
              this.setHelpUrl("");
            }
          };

        Blockly.JavaScript.forBlock['keyboard_keydown_compare'] = function(block,g) {
        var value_key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_ATOMIC);
        var statements_statement = Blockly.JavaScript.statementToCode(block, 'STATEMENT');
        
        var code = `
        document.addEventListener('keydown', function(event) {
        if (event.key === ${value_key}) {
            ${statements_statement}
        }
        });
        `;
        return code;
        };

        //@keyboard_keyup_compare
        Blockly.Blocks['keyboard_keyup_compare'] = {
            init: function() {
                this.appendValueInput("KEY")
                    .setCheck("String")
                    .appendField("Keyboard Keyup for");
                this.appendStatementInput("STATEMENT")
                    .setCheck(null);
                this.setColour(50);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        
        Blockly.JavaScript['keyboard_keyup_compare'] = function(block) {
            var value_key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_ATOMIC);
            var statements_statement = Blockly.JavaScript.statementToCode(block, 'STATEMENT');
            
            var code = `
            document.addEventListener('keyup', function(event) {
                if (event.key === ${value_key}) {
                    ${statements_statement}
                }
            });
            `;
            return code;
        };

        ///////////// flow blocks /////////////
        // Wait 블록 정의
        Blockly.Blocks['wait'] = {
            init: function() {
              this.appendDummyInput()
                  .appendField("wait for")
                  .appendField(new Blockly.FieldNumber(0, 0), "DURATION")
                  .appendField("milliseconds");
              this.appendStatementInput("NEXT")
                  .setCheck(null)
                  .appendField("do");
              this.setPreviousStatement(true, null);
              this.setNextStatement(true, null);
              this.setColour(10);
              this.setTooltip("");
              this.setHelpUrl("");
            }
          };
        
        // JavaScript 코드 생성기
        Blockly.JavaScript.forBlock['wait'] = function(block,g) {
            var duration = block.getFieldValue('DURATION');
            var nextCode = Blockly.JavaScript.statementToCode(block, 'NEXT');
            // var code = `await sleep(${duration}).then(() => {\n${nextCode}\n});\n`;
            var code = `await sleep(${duration}); ${nextCode}`;
            return code;
        };

        //문자를 받아서 그 중에 숫자만 반환 @to_int
        Blockly.Blocks['to_int'] = {
            init: function() {
              this.appendValueInput("NUMBER")
                  .setCheck("String")
                  .appendField("to number");
              this.setOutput(true, "Number");
              this.setColour(10);
              this.setTooltip("");
              this.setHelpUrl("");
            }
          };

          Blockly.JavaScript.forBlock['to_int'] = function(block,g) {
            var value_number = Blockly.JavaScript.valueToCode(block, 'NUMBER', Blockly.JavaScript.ORDER_ATOMIC);
            // 정규식을 사용하여 문자열에서 숫자 부분만 추출
            var code = 'parseFloat(' + value_number + ')';
            return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
          };

        //number with unit @unit
        Blockly.Blocks['to_unit'] = {
            init: function() {
              this.appendValueInput("NUMBER")
                  .setCheck("Number");
              this.appendDummyInput()
                  .appendField(new Blockly.FieldDropdown([["px", "PX"], ["%", "PERCENT"]]), "UNIT");
              this.setColour(10);
              this.setOutput(true, null);
              this.setTooltip("");
              this.setHelpUrl("");
            }
          };

        Blockly.JavaScript.forBlock['to_unit'] = function(block,g) {
            var number_value = Blockly.JavaScript.valueToCode(block, 'NUMBER', Blockly.JavaScript.ORDER_ATOMIC);
            var dropdown_unit = block.getFieldValue('UNIT');
            
            var unit;
            if (dropdown_unit === 'PX') {
                unit = 'px';
            } else if (dropdown_unit === 'PERCENT') {
                unit = '%';
            }
            
            var code = `${number_value}.toString() + '${unit}'`;
            return [code, Blockly.JavaScript.ORDER_ADDITION];
        };

        //move window 정의 @move_window

        Blockly.Blocks['window_move'] = {
            init: function() {
              this.appendValueInput("NAME")
                  .setCheck("WINDOW")
                  .appendField("move to window");
              this.setPreviousStatement(true, null);
              this.setNextStatement(true, null);
              this.setColour(10);
           this.setTooltip("");
           this.setHelpUrl("");
            }
          };

        Blockly.JavaScript.forBlock['window_move'] = function(block,g) {
            var windowId = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
            var code = `
            (function() {
                windowVariables.forEach(function(id) {
                    document.getElementById(id).style.display = 'none';
                });
                document.getElementById(${windowId}).style.display = 'block';
            })();
            `;
            return code;
        };

        //다른 window로 서서히 전환, @window_fade

        Blockly.Blocks['window_fade'] = {
            init: function() {
              this.appendValueInput("NAME")
                  .setCheck("WINDOW")
                  .appendField("fade to window");
              this.setPreviousStatement(true, null);
              this.setNextStatement(true, null);
              this.setColour(10);
           this.setTooltip("");
           this.setHelpUrl("");
            }
          };

          Blockly.JavaScript.forBlock['window_fade'] = function(block,g) {
            var windowId = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
            var code = `
            (function() {
                const duration = 500; // fade duration in milliseconds
                const currentWindow = windowVariables.find(id => document.getElementById(id).style.display === 'block');
                const targetWindow = document.getElementById(${windowId});
        
                if (currentWindow && targetWindow && currentWindow !== ${windowId}) {
                    const currentElement = document.getElementById(currentWindow);
                    let opacity = 1;
                    const fadeOut = setInterval(() => {
                        if (opacity <= 0) {
                            clearInterval(fadeOut);
                            currentElement.style.display = 'none';
                            targetWindow.style.display = 'block';
                            let targetOpacity = 0;
                            targetWindow.style.opacity = targetOpacity;
                            const fadeIn = setInterval(() => {
                                if (targetOpacity >= 1) {
                                    clearInterval(fadeIn);
                                } else {
                                    targetOpacity += 0.1;
                                    targetWindow.style.opacity = targetOpacity;
                                }
                            }, duration / 10);
                        } else {
                            opacity -= 0.1;
                            currentElement.style.opacity = opacity;
                        }
                    }, duration / 10);
                } else {
                    targetWindow.style.display = 'block';
                    targetWindow.style.opacity = 1;
                }
            })();
            `;
            return code;
        };

        // window component의 id 가져오기, @window_id
        Blockly.Blocks['window_id'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("")
                    .appendField(new Blockly.FieldDropdown(createDropdownOptions(windowVariables)),'WINDOW');
                this.setOutput(true, 'WINDOW');
                this.setColour(10);
                this.setTooltip("Returns the id of the Window component.");
                this.setHelpUrl("");
            }
        };

        Blockly.JavaScript.forBlock['window_id'] = function(block,generator) {
            var variable = block.getFieldValue('WINDOW');
            var code = `'${variable}'`;
            return [code, Blockly.JavaScript.ORDER_NONE];
        };
          
        
        //workspace 저장
        workspace = Blockly.inject(blocklyDiv, {
            toolbox: toolboxDom.documentElement,
            theme: Blockly.Themes.Classic,
        });

        updateDropdownWindows('window1');
        
        window.updateDropdownOptions = updateDropdownOptions; 

        Blockly.svgResize(workspace);

        var resultmessage=  "";
        generateCodeButton.addEventListener('click', async () => {
            const code = Blockly.JavaScript.workspaceToCode(workspace);
            let window_variables_define = "\nconst windowVariables = [";
            windowVariables.forEach(function(id, index) {
                window_variables_define += `'${id}'`;
                if (index < windowVariables.length - 1) {
                    window_variables_define += ", ";
                }
            });
            window_variables_define += "];\n";
            
            JS_code = pre_defined_func + window_variables_define + "\ndocument.addEventListener('DOMContentLoaded', () => {\n" + code + "\n})";
            const resultPageHTML = document.querySelector('#resultpage-container').innerHTML;

            showPopup();
            
            try {
                const result = await submitCode(resultPageHTML,JS_code);

                const result_code = result['result']['status']['code']
                console.log(result);
                if(result_code == 15) // accept, 에러 없음
                {
                    resultmessage = "Your code is perfect!";
                    JS_code_sucess = JS_code;
                }
                else if(result_code == 11) // compilation error
                {
                    resultmessage = "Compilation Error occured.";
                }
                else if(result_code == 12) // runtime error
                {
                    resultmessage = "Runtime Error occured.";
                }
                else if(result_code == 13) // time limit exceeded
                {
                    resultmessage = "Time Limit Exceed occured.";
                }
                else if(result_code == 17) // memory limit exceeded
                {
                    resultmessage = "Memory Limit Exceed occured.";
                }
                else if(result_code == 19) // illegal system call
                {
                    resultmessage = "Illegal System Call occured.";
                }
                else if(result_code == 20) // internal error
                {
                    resultmessage = "Internal Error occured.";
                }

                
            } catch (error) {
                console.error("Error:", error);
            } finally {
                showResult(resultmessage);
            }
        });
      })
      .catch(error => console.error('Error loading toolbox:', error));
});
