let workspace;
let customVariables = [];
const API_KEY = "76e081612384877ee93d93d579dc2992";
const COMPILER_ID = "55"; // https://sphere-engine.com/supported-languages

var HTML_values = ["innerText","backgroundColor"];
var JS_code = "";
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

        // get variables with type "HTML_COMPONENT" and return text, @html_component_innerText
        Blockly.Blocks['html_component_innerText'] = {
            init: function() {
              this.appendValueInput("NAME")
                  .setCheck("HTML_COMPONENT")
                  .appendField("innerText of");
              this.setOutput(true, 'String');
              this.setColour(160);
              this.setTooltip("text of HTML Component");
              this.setHelpUrl("");
            }
          };

        // HTML Component Block 코드 생성기
        Blockly.JavaScript.forBlock['html_component_innerText'] = function(block,generator) {
            var htmlComponent = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
            // 텍스트로 반환
            var code = `document.getElementById(${htmlComponent}).innerText`;
            return [code, Blockly.JavaScript.ORDER_NONE];
        };

        //html component의 색깔 가져오기, @html_component_color
        Blockly.Blocks['html_component_color'] = {
            init: function() {
              this.appendValueInput("NAME")
                  .setCheck("HTML_COMPONENT")
                  .appendField("background color of");
              this.setOutput(true, 'String');
              this.setColour(160);
              this.setTooltip("text of HTML Component");
              this.setHelpUrl("");
            }
          };

        
        Blockly.JavaScript.forBlock['html_component_color'] = function(block,generator) {
            var htmlComponent = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
            // 텍스트로 반환
            var code = `document.getElementById(${htmlComponent}).style.backgroundColor`;
            return [code, Blockly.JavaScript.ORDER_NONE];
        };

         // html component가 클릭되었을 때, @html_component_onclick
         Blockly.Blocks['html_component_onclick'] = {
            init: function() {
              this.appendValueInput("NAME")
                  .setCheck("HTML_COMPONENT")
                  .appendField("Onclick");
              this.appendStatementInput("STATEMENT")
              .setCheck(null);
              this.setColour(160);
              this.setTooltip("Onclick of HTML Component");
              this.setHelpUrl("");
              this.setOutput(false, null);
            }
          };

        Blockly.JavaScript.forBlock['html_component_onclick'] = function(block,generator) {
            var htmlComponent = Blockly.JavaScript.valueToCode(block, 'NAME', javascript.Order.ATOMIC);
            var statements_statement = Blockly.JavaScript.statementToCode(block, 'STATEMENT');

            console.log(statements_statement);

            var code = `document.getElementById${htmlComponent}.addEventListener('click', () => {
                ${statements_statement}
            });`;
            return code;
        };

       //html component의 내부 값들을 set할 수 있음 @set_html_component_value

        Blockly.Blocks['set_html_component_value'] = {
            init: function() {
              this.appendValueInput("FROM")
                  .setCheck("HTML_COMPONENT")
                  .appendField("Set")
                  .appendField(new Blockly.FieldDropdown(createDropdownOptions(HTML_values)),'HTML_VALUES')
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
            }
          };

          javascript.javascriptGenerator.forBlock['set_html_component_value'] = function(block, generator) {
            var variable_name = generator.nameDB_.getName(block.getFieldValue('HTML_VALUES'), Blockly.Variables.NAME_TYPE);
            var value_from = generator.valueToCode(block, 'FROM', javascript.Order.ATOMIC);
            var value_to = generator.valueToCode(block, 'TO', javascript.Order.ATOMIC);
            var code = '';

            if(variable_name == "innerText") {
                code = `document.getElementById${value_from}.innerText = ${value_to};`;
            }
            else if(variable_name == "backgroundColor"){
                code = `document.getElementById${value_from}.style.backgroundColor = ${value_to};`;
            }
            return code;
          };

        //workspace 저장
        workspace = Blockly.inject(blocklyDiv, {
            toolbox: toolboxDom.documentElement,
            theme: Blockly.Themes.Classic,
        });
        
        window.updateDropdownOptions = updateDropdownOptions; 

        Blockly.svgResize(workspace);

        // 버튼 클릭 이벤트 리스너
        
        var resultmessage=  "";
        generateCodeButton.addEventListener('click', async () => {
            const code = Blockly.JavaScript.workspaceToCode(workspace);
            JS_code = "document.addEventListener('DOMContentLoaded', () => {\n" + code + "\n})";
            const resultPageHTML = document.querySelector('#resultpage-container').innerHTML;

            showPopup();
            
            try {
                const result = await submitCode(resultPageHTML,JS_code);

                const result_code = result['result']['status']['code']
                console.log(result);
                if(result_code == 15) // accept, 에러 없음
                {
                    resultmessage = "Your code is perfect!";
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
