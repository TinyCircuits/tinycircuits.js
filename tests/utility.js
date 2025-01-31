export function log(message){
    let div = document.createElement("div");
    div.textContent = message;
    document.body.appendChild(div);
}