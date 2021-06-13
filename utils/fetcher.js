export const fetcher = async (url, method="GET", bodyData = {}) => {
    let res;
    if (method === "GET"){
        res = await fetch(url, {
            method: "GET",
            headers: new Headers({ 'Content-Type': 'application/json' }),
            credentials: "same-origin",
        });
    }
    else if (method === "POST" || method === "DELETE") {
        res = await fetch(url, {
            method,
            headers: new Headers({ 'Content-Type': 'application/json' }),
            credentials: "same-origin",
            body: JSON.stringify(bodyData)
        });
    }

    let respData = await res.json();
    return respData;
};

export default fetcher;
