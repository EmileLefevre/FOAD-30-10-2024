const sendPublic = document.querySelector("#sendPublic");
const messagesPublic = document.getElementById("messagesPublic");
const friendButton = document.getElementById("onLigneUsers");
const friendList = document.getElementById("friends");
const amis = document.getElementById("amis");
const messageTo = document.getElementById("messageTo");
const popup = document.getElementById("popupPrivateMessagesSender");
const recipientPopup = document.getElementById("popupPrivateMessagesRecipient");
const closePopupWindow = document.getElementById("closePopup");
const closePopupWindowRecipient = document.getElementById("closePopupRecipient");
const sendPrivateMessage = document.getElementById("sendPopupMessage");
const messageFrom = document.getElementById("messageFrom");
const errorMessage = document.getElementById("errorMessage");
const socket = io();
const query = window.location.search;
const urlParams = new URLSearchParams(query);
const pseudo = urlParams.get("pseudo");
const pwd = urlParams.get("pwd");
let friendsDisplayed = false;
let data;

tinymce.init({
    selector: '#textPublic',
    plugins: [
        'advlist', 'autolink',
        'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks',
        'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | formatpainter casechange blocks | bold italic backcolor | ' +
        'alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist checklist outdent indent | removeformat | a11ycheck code table help'
});

const displayMessage = (data) => {
    messagesPublic.innerHTML += `
    <div class="newMessage">
        <h2>Message de : ${data.pseudo}</h2>
        <p1 class="content"> ${data.messageContent}</p1>
        <p class="date"> Envoyé le : ${data.date}</p>
    </div>`
}

socket.on("init", (data) => {
    if (!pwd) {
        errorMessage.textContent = "Attention, vous n'avez pas mis de mot de passe ! (Ce message disparaîtra dans 5 secondes"; 
        errorMessage.style.display = "block"; 
        setTimeout(() => {
            errorMessage.style.display = "none"; 
        }, 5000); 
        return; 
    }
    socket.emit("sendLog", { pseudo: pseudo, pwd: pwd });
})

const sendMessage = () => {
    let messageContent = tinyMCE.get("textPublic").getContent();
    let date = moment().format("YYYY-MM-DD HH:mm:ss");
    data = { pseudo: pseudo, messageContent: messageContent, date: date };
    socket.emit("publicMessage", data);
    displayMessage(data);
}

const showFriends = (data) => {
    friendList.addEventListener("click", () => {
        if (!friendsDisplayed) {
            amis.innerHTML = '';
            amis.innerHTML += `<p onclick="displayPrivateMessage('${data.pseudo}', '${socket.id}')">${data.pseudo}</p>`;
            friendsDisplayed = true;
        } else {
            amis.innerHTML = '';
            friendsDisplayed = false;
        }
    })
}

const sendPrivateMessages = (socketID) => {
    sendPrivateMessage.addEventListener("click", () => {
        const privateMessageContent = tinyMCE.get("popupTextArea").getContent({ format: "text" });
        const privateMessageData = { pseudo: pseudo, socketID: socketID, messageContent: privateMessageContent } //PMC est bon
        socket.emit("privateMessage", privateMessageData);
        removePopup(popup);
    })
}

const displayPrivateMessage = (data, socketID) => {
    popup.style.display = "block";
    console.dir(socketID);
    messageTo.innerHTML += data;
    tinymce.init({
        selector: '#popupTextArea',
        plugins: [
            'advlist', 'autolink',
            'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks',
            'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | formatpainter casechange blocks | bold italic backcolor | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist checklist outdent indent | removeformat | a11ycheck code table help'
    });
    closePopupWindow.addEventListener("click", () => {
        removePopup(popup);
    })
    sendPrivateMessages(socketID);

}

const removePopup = (idName) => {
    idName.style.display = "none";
}

socket.on("privateMessageReceived", (data) => {
    recipientPopup.style.display = "block";
    const messagesPrivate = recipientPopup.querySelector("#popupTextAreaSender");
    messageFrom.innerHTML += " " + data.senderPseudo;
    messagesPrivate.textContent += data.privateMessageContent;
    closePopupWindowRecipient.addEventListener("click", () => {
        removePopup(recipientPopup);
    })

});

let historyMessage = []; // pour stocker les messages envoyés mais j'ai pas eu le temps de faire cette partie ...
socket.on("publicMessageGlobal", (data) => {
    displayMessage(data);
    historyMessage.push(data.messageContent);
    showFriends(data);
})

sendPublic.addEventListener("click", sendMessage);