document.addEventListener('DOMContentLoaded', () => {
    const blocklyDiv = document.querySelector('#blocklyDiv');
    const generateCodeButton = document.getElementById('generateCodeButton');

    // 현재 preview안의 id가 있는 component들을 받아와서 변수로 설정, 기본 블럭은 해당 컴포넌트의 id를 text로 반환함
    const resultpageContainer = document.getElementById('resultpage-container');

    // JavaScript 상의 변수 목록
    const childElements = resultpageContainer.querySelectorAll('[id]');
    const customVariables = Array.from(childElements).map(v => v.id);

    // 변수 목록을 위한 함수
    const createDropdownOptions = (variables) => {
        return variables.map(variable => [variable, variable]);
    };

    fetch('toolbox.xml')
      .then(response => response.text())
      .then(toolboxXml => {
        const parser = new DOMParser();
        const toolboxDom = parser.parseFromString(toolboxXml, 'text/xml');

        // component의 id가져오기,
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

        // get variables with type "HTML_COMPONENT" and return text 
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
            var code = `document.getElementById${htmlComponent}.innerText`;
            return [code, Blockly.JavaScript.ORDER_NONE];
        };

        //html component의 색깔 가져오기
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
            var code = `document.getElementById${htmlComponent}.style.backgroundColor`;
            return [code, Blockly.JavaScript.ORDER_NONE];
        };


        const workspace = Blockly.inject(blocklyDiv, {
            toolbox: toolboxDom.documentElement,
            theme: Blockly.Themes.Classic,
        });
        

        Blockly.svgResize(workspace);

        // 버튼 클릭 이벤트 리스너
        generateCodeButton.addEventListener('click', () => {
            const code = Blockly.JavaScript.workspaceToCode(workspace);
            console.log(code);
        });
      })
      .catch(error => console.error('Error loading toolbox:', error));
});


