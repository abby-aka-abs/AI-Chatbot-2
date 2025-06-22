const chatBox = document.querySelector('.chatbox');
const inputField = chatBox.querySelector('input[type = "text"]');
const button = chatBox.querySelector('button');
const chatBoxBody = chatBox.querySelector('.chatbox-body');

button.addEventListener('click', sendMessage);
input.addEventListener('keypress', function(event){
    if (event.key == "Enter"){
        sendMessage();
    }

})

function sendMessage(){
    const message = inputField.value;
    inputField.value = '';
    chatBoxBody.innerHTML += `<div class = "message"> ${message} </div>`;
    scrollToBottom();

    fetch('http://localhost:3000/message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({message})
    }).then((response) => response.json()).then(data => {
        chatBoxBody.innerHTML += `<div class = "response"> ${data.message}</div>`;
        scrollToBottom();
    })
}

function scrollToBottom(){
    chatBoxBody.scrollTop = chatBoxBody.scrollHeight;
}

