//convert actual image
const  bufferToBase64 = buf => {
    var binstr = Array.prototype.map.call(buf, function (ch) {
        return String.fromCharCode(ch);
    }).join('');
    console.log(btoa(binstr));
    return btoa(binstr);
}
// src={`data:image/png;base64,${this.state.recimage}`} />