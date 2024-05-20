const decodeBase64 = (base64) => {
    const binString = atob(base64);
    return new TextDecoder().decode(Uint8Array.from(binString, (m) => m.codePointAt(0)));
}

const evtSource = new EventSource("https://openaq-data-engineer.onrender.com/", {
    withCredentials: true,
});

var csvDataResult = '';
var clearAll;
var firstResult = true;

evtSource.onmessage = (event) => {
    if (event.data === 'FINISHED') {
        evtSource.close();
        clearAll = renderCharts(csvDataResult);
        document.querySelector('#loader').remove();
        document.querySelector('#delay-disclaimer').remove();
        document.querySelector('#main-table').classList.remove('hidden');
    } else {
        result = firstResult ? decodeBase64(event.data) : removeFirstLine(decodeBase64(event.data));
        firstResult = false;
        csvDataResult += result + '\n'
    }
};

evtSource.onerror = (e) => {
    document.querySelector('#loader').remove();
    document.querySelector('#delay-disclaimer').remove();
    document.querySelector('#error-alert').classList.remove('display-none');
};

const removeFirstLine = (text) => {
    var lines = text.split('\n');
    lines.splice(0,1);
    return lines.join('\n');
}
