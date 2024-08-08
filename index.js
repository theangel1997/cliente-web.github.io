const xhr = new XMLHttpRequest();

//0 = UNSENT
// La solicitud no ha sido abierta (open() no ha sido llamada).

//1 = OPENED
// open() ha sido llamada, pero send() aún no.

//2 = HEADERS_RECEIVED
// send() ha sido llamada y las cabeceras de la respuesta han sido recibidas.

//3 = LOADING
// La respuesta está en proceso de ser descargada (responseText contiene datos parciales).

//4 = DONE
// La solicitud ha sido completada y la respuesta está lista para ser procesada.

function onRequestHandler() {
    if (this.readyState === 4) { // DONE
        let textoEstatico = "WEB:\\Print\\Respuesta\\>";
        let responseText = this.status === 204 ? 'No Content' : this.response;

        let output = `${textoEstatico}\n`;

        if (this.status === 204) {
            // Obtener todos los headers solo si es 204
            let headers = this.getAllResponseHeaders();
            let formattedHeaders = headers.split('\r\n').map(header => header.trim()).filter(header => header).join('\n');
            output += `\nHeaders:\n${formattedHeaders}`;
        } else {
            // Verificar si el contenido es JSON
            let contentType = this.getResponseHeader('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    let jsonResponse = JSON.parse(responseText);
                    let prettyJson = JSON.stringify(jsonResponse, null, 2); // Formatea JSON
                    output += prettyJson;
                } catch (error) {
                    output += `\nError al parsear JSON: ${error.message}\n${responseText}`;
                }
            } else {
                output += `\nResponse:\n${responseText}`;
            }
        }

        document.getElementById("response").innerHTML = output;
    }
}

function myFunction() {
    try {
        xhr.removeEventListener("load", onRequestHandler);
        xhr.addEventListener("load", onRequestHandler);

        let method = document.getElementById("metodo").value;
        let environment = document.getElementById("ambiente").value;
        let basePath = document.getElementById("basePath").value;
        let url = basePath.charAt(0) === "/" ? environment + basePath : environment + "/" + basePath;

        xhr.open(method, url);

        let curl = `curl -k -X ${method} '${url}' -H 'Authorization: Bearer ${document.getElementById("token").value}' -H 'Content-Type: ${document.getElementById("Content-Type").value}'`;

        let arrayHeaders = document.getElementById('headers').value.split("\n");
        for (let header of arrayHeaders) {
            let [name, value] = header.split(":");
            if (name && value) {
                curl += ` -H '${name.trim()}: ${value.trim()}'`;
                xhr.setRequestHeader(name.trim(), value.trim());
            }
        }

        let body = document.getElementById('body').value.replaceAll("\n", "").replaceAll(" ", "");
        curl += ` -d '${body}'`;

        document.getElementById("curl").innerHTML = `WEB:\\Print\\Curl\\>${curl}`;
        xhr.setRequestHeader("Content-Type", document.getElementById("Content-Type").value);
        xhr.setRequestHeader('Authorization', `Bearer ${document.getElementById("token").value}`);
        xhr.send(body);

        console.log("Request sent: " + url);
    } catch (error) {
        console.error(error);
        document.getElementById("response").innerHTML = error;
    }
}
