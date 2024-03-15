export { addSelectedTextTo, createButton, events }

const addSelectedTextTo = (text, destination) => {
    let first, last
    const lines = text.split("\n")
    for(let i=0;i<lines.length;i++){
        let node
        const textNode = document.createTextNode(lines[i])
        if(i==0){
            first = textNode
        }
        if(i==lines.length-1){
            last = textNode
        }
        if(i == 0){
            node = textNode
        } else {
            const div = document.createElement("div")
            div.appendChild(textNode)
            node = div
        }
        destination.appendChild(node);
    }
    
    const selection = window.getSelection();
    selection.removeAllRanges();
    const range = document.createRange();
    range.setStartBefore(first);
    range.setEndAfter(last);
    selection.addRange(range);
}

const createButton = (text, panelBody) => {
    addSelectedTextTo(text, panelBody)
    const contextMenuEvent = new CustomEvent('contextmenu');
    panelBody.dispatchEvent(contextMenuEvent);
}

const events = {
    mousedown: new MouseEvent('mousedown'),
    click: new MouseEvent('click'),

}
