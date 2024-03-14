import weave from "../src/weave.js";

weave.root = "weave-target"
weave.createPanel(weave.root, "b0", weave.buttons(weave.root));

//mocha.checkLeaks(); I need leaks for code evals
mocha.run();

describe('createPanel', function() {
    const root = document.getElementById(weave.root)
    it('should create a new panel', function() {
        const panel = root.children
        chai.expect(panel).to.not.be.empty
        chai.expect(panel).to.have.length(1)
    });
    it('should have created a panel with two elements (handle and body)', function() {
        const panelElements = root.children[0].children
        chai.expect(panelElements).to.not.be.empty
        chai.expect(panelElements).to.have.length(2)
        console.info(panelElements)
        chai.expect(panelElements[0].classList.contains("panel-handle")).to.be.true
        chai.expect(panelElements[1].classList.contains("body")).to.be.true
    });
})

const addSelectedTextTo = (text, destination) => {
    const textNode = document.createTextNode(text)
    destination.appendChild(textNode);
    const selection = window.getSelection();
    selection.removeAllRanges();
    const range = document.createRange();
    range.setStartBefore(textNode);
    range.setEndAfter(textNode);
    selection.addRange(range);
}

const createButton = (text, panelBody) => {
    addSelectedTextTo(text, panelBody)
    const contextMenuEvent = new CustomEvent('contextmenu');
    panelBody.dispatchEvent(contextMenuEvent);
}

describe('split text / button', function() {
    const panel = document.getElementById(weave.root).querySelector(".body-container")
    const panelBody = document.getElementById(weave.root).querySelector(".body")
    let splitButton
    weave.hookBody(panelBody);
    it('should become a button on right click', function() {
        createButton("split", panelBody)
        splitButton = panelBody.querySelector(".wrap")
        chai.expect(splitButton.innerText).to.eql("split")
        const buttonNode = splitButton.children[0]
        chai.expect(buttonNode.dataset.action).to.eql("split")
    });
    it('should create a panel on click', function() {
        const panels = () => document.getElementsByClassName("body-container")
        chai.expect(panels()).to.have.length(1)
        const mousedown = new MouseEvent('mousedown', {
            bubbles: true,
          });
        splitButton.dispatchEvent(mousedown);
        chai.expect(panels()).to.have.length(2)
        panels()[1].remove();
        panelBody.innerHTML = ""
    });
})

describe('eval text / button', function(){
    const panelBody = document.getElementById(weave.root).querySelector(".body")
    it('should become a button on right click', function() {
        createButton("eval", panelBody)
        const evalButton = panelBody.querySelector(".wrap")
        chai.expect(evalButton.innerText).to.eql("eval")
        const buttonNode = evalButton.children[0]
        chai.expect(buttonNode.dataset.action).to.eql("eval")
    });
})

describe('eval - direct evaluation', function() {
    const evaluation = "(9*6).toString(13)"
    const panelBody = document.getElementById(weave.root).querySelector(".body")
    let evalButton, evaluated
    it('should create an evaluation block on click after selecting text to evaluate', function() {
        evalButton = panelBody.querySelector(".wrap")
        addSelectedTextTo(evaluation, panelBody);
        const mousedown = new MouseEvent('mousedown');
        evalButton.dispatchEvent(mousedown);
        evaluated = panelBody.querySelector(".wired.code")
        chai.expect(evaluated).to.exist
    });
    it('should correctly assign the result of the evaluation to the block', function() {
        chai.expect(evaluated.innerText).to.equal('"42"')
    });
    it('should correctly assign the string to evaluate to the data container of the block', function() {
        chai.expect(evaluated.dataset.eval_string).to.equal(evaluation);
        evaluated.remove()
    });
});

describe('eval - assignments & edit/reassignment flow', function() {
    const mousedown = new MouseEvent('mousedown');
    const click = new MouseEvent('click');
    const contextmenu = new CustomEvent('contextmenu');
    const evaluation1 = "in_chai = +(9*6).toString(13)"
    const evaluation2 = "in_chai - 1"
    const evaluation3 = "in_chai - 2"
    const evaluation4 = "in_chai = -42"
    const panelBody = document.getElementById(weave.root).querySelector(".body")
    let evalButton
    it('should handle assignment and evaluation: a = f()', function() {
        evalButton = panelBody.querySelector(".wrap")
        addSelectedTextTo(evaluation1, panelBody);
        evalButton.dispatchEvent(mousedown);
        // Global leak expected here
        chai.expect(in_chai).to.equal(42)
        const assignment = panelBody.querySelector(".wired.code")
        chai.expect(assignment.innerText).to.equal(evaluation1)
    });
    it('should handle double assignment: a = f(); a-1', function() {
        addSelectedTextTo(evaluation2, panelBody);
        evalButton.dispatchEvent(mousedown);
        const second = panelBody.querySelectorAll(".wired.code")[1]
        chai.expect(second.innerText).to.equal('41')
    });
    it('should handle edits: clicking on the a-1 block switches from computed to computation', function(){
        const second = panelBody.querySelectorAll(".wired.code")[1]
        second.dispatchEvent(click);
        chai.expect(second.innerText).to.equal(evaluation2)
    });
    it('should handle edits: changing text and right clicking recomputes the value', function(){
        const second = panelBody.querySelectorAll(".wired.code")[1]
        second.innerText = evaluation3
        second.dispatchEvent(contextmenu);
        chai.expect(second.innerText).to.equal('40')
    });
    it('should handle global recomputation: editing f() affects the things that depend on it', function(){
        const first = panelBody.querySelectorAll(".wired.code")[0]
        const second = panelBody.querySelectorAll(".wired.code")[1]
        first.innerText = evaluation4
        first.dispatchEvent(contextmenu);
        chai.expect(first.innerText).to.equal(evaluation4)
        chai.expect(second.innerText).to.equal('-44')
    });
});