// générateur d'ID de step aléatoire - compat BordoJS
export const generateRandomId = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// fonction pour formatter le json comme les couleurs dans un IDE
export const formatJsonWithSyntax = (data: any): string => {
    const jsonString = JSON.stringify(data, null, 2);

    return jsonString
        .replace(/\"([^\"]+)\":/g, '<span class="json-key">"$1"</span><span class="json-colon">:</span>')
        .replace(/: \"([^\"]*)\"/g, ': <span class="json-string">"$1"</span>')
        .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
        .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
        .replace(/: (null)/g, ': <span class="json-null">$1</span>')
        .replace(/(\[|\]|\{|\})/g, '<span class="json-bracket">$1</span>')
        .replace(/,/g, '<span class="json-comma">,</span>');
};